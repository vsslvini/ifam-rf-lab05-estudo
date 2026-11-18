"""Modelo ORM da tabela `usuarios` (Modulo 0 - Core).

Referencia: docs/seq_05_database_schema.md (secao 2.1 e script DDL).

=============================================================================
FRONTEIRA DE INTEGRACAO
=============================================================================
Este modelo pertence ao RF-CORE05 (Equipe 3) / Equipe do Core. Ele foi
declarado aqui pela Equipe 16 apenas porque `alocacoes_laboratorios.id_usuario`
e uma FK para `usuarios` e, sem a tabela, o PostgreSQL nao aceita o schema.

A declaracao segue o DDL coluna a coluna (mesmos nomes, tamanhos e ENUMs
`perfil_usuario` / `status_conta`), de modo que a versao da Equipe do Core
substitui este arquivo inteiro sem mudar o banco.

TODO(RF-CORE05, Equipe 3): substituir pelo modelo definitivo (com os
relacionamentos de tokens, reservas etc.).
=============================================================================
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PerfilUsuario(str, enum.Enum):
    """`CREATE TYPE perfil_usuario AS ENUM (...)`."""

    SOLICITANTE = "Solicitante"
    ADMINISTRADOR = "Administrador"


class StatusConta(str, enum.Enum):
    """`CREATE TYPE status_conta AS ENUM (...)`."""

    ATIVO = "Ativo"
    BLOQUEADO_POR_ATRASO = "Bloqueado_por_Atraso"
    INATIVO = "Inativo"


def _valores(membros: type[enum.Enum]) -> list[str]:
    return [m.value for m in membros]


class Usuario(Base):
    """Usuario institucional (tabela `usuarios`)."""

    __tablename__ = "usuarios"

    id_usuario: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    nome_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    identificacao_institucional: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )
    perfil: Mapped[PerfilUsuario] = mapped_column(
        SAEnum(PerfilUsuario, name="perfil_usuario", values_callable=_valores),
        nullable=False,
        default=PerfilUsuario.SOLICITANTE,
    )
    status_conta: Mapped[StatusConta] = mapped_column(
        SAEnum(StatusConta, name="status_conta", values_callable=_valores),
        nullable=False,
        default=StatusConta.ATIVO,
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
    )

    def __repr__(self) -> str:  # pragma: no cover - auxilio de depuracao
        return f"<Usuario {self.email!r} perfil={self.perfil.value}>"
