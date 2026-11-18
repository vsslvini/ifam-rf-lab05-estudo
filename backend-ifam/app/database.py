"""Camada de persistencia: engine, sessao e Base declarativa do SQLAlchemy.

Referencia: docs/seq_06_mapa_backend.md - `app/database.py`.

A engine e criada de forma preguicosa (lazy): com `USE_IN_MEMORY_REPO=true`
nenhuma conexao e aberta e a API sobe sem PostgreSQL. Com `false`, o schema
e os dados iniciais sao criados por `app/seed.py` na subida da API.

TODO(Equipe do Core): trocar `create_all` (app/seed.py) por migracoes
Alembic quando o schema comecar a evoluir.
"""

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    """Base declarativa compartilhada por todos os modelos ORM."""


def get_engine() -> Engine:
    """Cria (uma unica vez) e devolve a engine do SQLAlchemy."""
    global _engine
    if _engine is None:
        _engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    """Devolve a fabrica de sessoes ligada a engine."""
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(),
            autoflush=False,
            autocommit=False,
            # O router le atributos da alocacao depois do commit da decisao.
            expire_on_commit=False,
        )
    return _session_factory
