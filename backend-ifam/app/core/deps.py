"""Injecao de dependencias da API.

Referencia: docs/seq_06_mapa_backend.md - `app/core/deps.py`
            (`get_db`, `get_current_user`, `get_admin_user`).

=============================================================================
PONTO DE TROCA DA AUTENTICACAO
=============================================================================
O RF-CORE01 (SSO / JWT) pertence a Equipe 1 e ainda nao foi implementado.
`get_current_user` e `get_admin_user` ja existem aqui com a **assinatura
definitiva** e devolvem, por enquanto, um Administrador fixo.

Quando o SSO entrar, apenas o corpo destas duas funcoes muda (decodificar o
Bearer token com `app/core/security.py` e carregar o usuario do banco).
Routers, schemas e testes do RF-LAB05 permanecem inalterados.
=============================================================================
"""

import uuid
from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_session_factory
from app.repositories.alocacoes_laboratorios import (
    AlocacaoRepository,
    SqlAlchemyAlocacaoRepository,
    repositorio_em_memoria as repositorio_alocacoes_em_memoria,
)

PERFIL_ADMINISTRADOR = "Administrador"
PERFIL_SOLICITANTE = "Solicitante"


class UsuarioAutenticado(BaseModel):
    """Identidade do usuario logado, espelhando os claims do JWT.

    Formato do token definido em docs/seq_08_arquitetura_multimodulos.md,
    secao 2 (`sub`, `email`, `matricula`, `perfil`).
    """

    id_usuario: uuid.UUID
    nome_completo: str
    email: str
    identificacao_institucional: str
    perfil: str

    @property
    def is_admin(self) -> bool:
        return self.perfil == PERFIL_ADMINISTRADOR


# Usuario devolvido enquanto o SSO nao existe. Corresponde ao exemplo de
# Administrador publicado no contrato de login (seq_06, secao 1.3).
_ADMIN_MOCK = UsuarioAutenticado(
    id_usuario=uuid.UUID("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
    nome_completo="Prof. Carlos Bento",
    email="carlos.bento@ifam.edu.br",
    identificacao_institucional="SIAPE 1975002",
    perfil=PERFIL_ADMINISTRADOR,
)


def get_db() -> Iterator[Session]:
    """Sessao do banco por requisicao, fechada ao fim da resposta.

    A sessao so abre conexao no primeiro comando SQL; com o repositorio em
    memoria ela nunca e usada.
    """
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()


def get_current_user() -> UsuarioAutenticado:
    """Usuario autenticado a partir do Bearer token.

    TODO(RF-CORE01, Equipe 1): substituir o mock por:
        1. Ler o header `Authorization: Bearer <token>`;
        2. Decodificar/validar via `app.core.security.decodificar_token`;
        3. Carregar o `Usuario` correspondente no banco;
        4. Responder 401 quando o token for invalido ou expirado.
    """
    return _ADMIN_MOCK


def get_admin_user(
    usuario: Annotated[UsuarioAutenticado, Depends(get_current_user)],
) -> UsuarioAutenticado:
    """Exige perfil Administrador (RN02 - RBAC).

    A verificacao de perfil ja e real: assim que `get_current_user` passar a
    ler o token de verdade, esta funcao passa a barrar Solicitantes sem
    nenhuma alteracao de codigo.
    """
    if not usuario.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a usuarios com perfil Administrador.",
        )
    return usuario


def get_alocacao_repository(
    db: Annotated[Session, Depends(get_db)],
) -> AlocacaoRepository:
    """Repositorio de alocacoes de laboratorio (RF-LAB05).

    `USE_IN_MEMORY_REPO=false` -> PostgreSQL; `true` -> seed em memoria.
    """
    if settings.USE_IN_MEMORY_REPO:
        return repositorio_alocacoes_em_memoria
    return SqlAlchemyAlocacaoRepository(db)


# Aliases para deixar as assinaturas dos routers mais curtas.
UsuarioAtual = Annotated[UsuarioAutenticado, Depends(get_current_user)]
UsuarioAdmin = Annotated[UsuarioAutenticado, Depends(get_admin_user)]
RepositorioAlocacoes = Annotated[AlocacaoRepository, Depends(get_alocacao_repository)]
