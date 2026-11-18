"""Fixtures compartilhadas dos testes da API.

Os testes HTTP rodam duas vezes, uma para cada implementacao do repositorio:
`memoria` (seed em dicionario) e `sqlalchemy` (o repositorio do PostgreSQL,
aqui sobre um SQLite em memoria). Assim as duas aplicam as mesmas regras.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.deps import get_alocacao_repository
from app.database import Base
from app.main import app
from app.repositories.alocacoes_laboratorios import (
    SqlAlchemyAlocacaoRepository,
    repositorio_em_memoria,
)
from app.seed import semear
from app.services import notificacoes


@pytest.fixture(params=["memoria", "sqlalchemy"])
def client(request: pytest.FixtureRequest) -> Iterator[TestClient]:
    """Cliente HTTP de teste com o repositorio reiniciado a cada teste."""
    notificacoes.limpar_eventos()

    if request.param == "memoria":
        repositorio_em_memoria.semear()
        app.dependency_overrides[get_alocacao_repository] = lambda: repositorio_em_memoria
        yield TestClient(app)
        app.dependency_overrides.clear()
        return

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    fabrica = sessionmaker(bind=engine, expire_on_commit=False)
    with fabrica() as session:
        semear(session)

    def repositorio_sqlalchemy() -> Iterator[SqlAlchemyAlocacaoRepository]:
        with fabrica() as session:
            yield SqlAlchemyAlocacaoRepository(session)

    app.dependency_overrides[get_alocacao_repository] = repositorio_sqlalchemy
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()
