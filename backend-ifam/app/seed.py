"""Criacao do schema e carga dos dados iniciais no PostgreSQL.

Executado automaticamente na subida da API quando `USE_IN_MEMORY_REPO=false`
(ver `app/main.py`), e tambem a mao:

    python -m app.seed            # cria o que faltar e semeia se estiver vazio
    python -m app.seed --recriar  # apaga tudo e volta ao estado da demonstracao

Os dados sao exatamente os do repositorio em memoria (mesmos UUIDs), entao a
API responde igual nos dois modos e o front-end nao percebe a troca.

TODO(Equipe do Core): `create_all` nao altera tabelas existentes. Quando o
schema comecar a evoluir, substituir por migracoes Alembic.
"""

import argparse
import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, get_engine, get_session_factory
from app.models.laboratorios import AlocacaoLaboratorio
from app.models.usuarios import PerfilUsuario, Usuario
from app.repositories import catalogo_labs_mock as catalogo
from app.repositories.alocacoes_laboratorios import _seed as seed_alocacoes

logger = logging.getLogger(__name__)

# Os docentes do seed nao fazem login: o hash nao corresponde a senha alguma.
# O cadastro real de usuarios e do RF-CORE05 (Equipe 3).
SENHA_HASH_SEM_LOGIN = "!seed-rf-lab05-sem-login"


def criar_schema(recriar: bool = False) -> None:
    """Cria as tabelas (e os ENUMs do PostgreSQL) declaradas nos modelos."""
    engine = get_engine()
    if recriar:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)


def semear(session: Session) -> bool:
    """Carrega os dados de demonstracao se o banco estiver vazio.

    Devolve `True` quando inseriu algo. Idempotente: com qualquer alocacao ja
    gravada, nada e feito - o estado da apresentacao nao e sobrescrito.
    """
    if session.scalar(select(AlocacaoLaboratorio.id_alocacao).limit(1)) is not None:
        return False

    for docente in catalogo.listar_docentes():
        session.merge(
            Usuario(
                id_usuario=docente.id_usuario,
                nome_completo=docente.nome_completo,
                email=docente.email,
                senha_hash=SENHA_HASH_SEM_LOGIN,
                identificacao_institucional=docente.identificacao_institucional,
                perfil=PerfilUsuario(docente.perfil),
            )
        )

    # `merge` grava uma copia: os objetos do catalogo em memoria continuam
    # desligados de qualquer sessao.
    for laboratorio in catalogo.listar_laboratorios():
        session.merge(laboratorio)
    for grade in catalogo.listar_grades():
        session.merge(grade)
    session.flush()

    session.add_all(seed_alocacoes())
    session.commit()
    return True


def inicializar_banco(recriar: bool = False) -> None:
    """Schema + dados iniciais. Chamado no `lifespan` da API."""
    criar_schema(recriar=recriar)
    with get_session_factory()() as session:
        if semear(session):
            logger.info("Banco semeado com os dados de demonstracao do RF-LAB05.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--recriar",
        action="store_true",
        help="apaga todas as tabelas antes de criar e semear",
    )
    inicializar_banco(recriar=parser.parse_args().recriar)
