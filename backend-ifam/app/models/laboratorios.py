"""Modelos ORM do Modulo 2 - Alocacao e Gestao de Laboratorios de Informatica.

Referencias:
  - docs/seq_05_database_schema.md (secoes 2.6 a 2.9 e script DDL)
  - docs/seq_06_mapa_backend.md (`app/models/laboratorios.py`)

Escopo entregue pela Equipe 16 (RF-LAB05 - Aprovacao e Deteccao de Conflitos):
`AlocacaoLaboratorio`. As classes `Laboratorio` e `GradeHorario` sao
pre-requisitos do RF-LAB05 (o painel precisa exibir a sala e o horario do
pedido) e por isso tambem estao declaradas aqui, fieis ao DDL.

TODO(RF-LAB02, Equipe 13): a classe `SoftwareLaboratorio` (tabela
`softwares_laboratorio`) entra neste mesmo arquivo.

Observacao de integracao: nao foram declarados `relationship()` para
`usuarios` porque o modelo `Usuario` (RF-CORE05) ainda nao existe. As chaves
estrangeiras usam a forma textual (`"usuarios.id_usuario"`), que o SQLAlchemy
resolve apenas na criacao do schema - portanto os modelos carregam mesmo
antes de a Equipe do Core entregar `app/models/usuarios.py`.
"""

import enum
import uuid
from datetime import date, datetime, time

from sqlalchemy import (
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

# ---------------------------------------------------------------------------
# Tipos enumerados (docs/seq_05_database_schema.md, secao 1 do DDL)
# ---------------------------------------------------------------------------


class StatusLaboratorio(str, enum.Enum):
    """`CREATE TYPE status_laboratorio AS ENUM (...)`."""

    DISPONIVEL = "Disponivel"
    OCUPADO = "Ocupado"
    MANUTENCAO = "Manutencao"
    INTERDITADO = "Interditado"


class TurnoAlocacao(str, enum.Enum):
    """`CREATE TYPE turno_alocacao AS ENUM (...)`."""

    MATUTINO = "Matutino"
    VESPERTINO = "Vespertino"
    NOTURNO = "Noturno"


class TipoAlocacaoLab(str, enum.Enum):
    """`CREATE TYPE tipo_alocacao_lab AS ENUM (...)`."""

    PONTUAL = "Pontual"
    SEMESTRAL = "Semestral"


class StatusAlocacaoLab(str, enum.Enum):
    """`CREATE TYPE status_alocacao_lab AS ENUM (...)`."""

    PENDENTE = "Pendente"
    APROVADA = "Aprovada"
    EM_USO = "Em_Uso"
    CONCLUIDA = "Concluida"
    REJEITADA = "Rejeitada"
    CANCELADA = "Cancelada"


class EstadoPosAula(str, enum.Enum):
    """`CREATE TYPE estado_pos_aula AS ENUM (...)`."""

    EXCELENTE = "Excelente"
    BOM = "Bom"
    AVARIAS_LEVES = "Avarias_Leves"
    CRITICO = "Critico"


def _enum_ddl(enum_cls: type[enum.Enum], nome_tipo: str) -> SAEnum:
    """Mapeia o enum Python para o `CREATE TYPE` do DDL.

    Por padrao o SQLAlchemy grava o *nome* do membro (`EM_USO`); o DDL do
    seq_05 usa o *valor* (`'Em_Uso'`). `values_callable` alinha os dois.
    """
    return SAEnum(
        enum_cls,
        name=nome_tipo,
        values_callable=lambda membros: [m.value for m in membros],
    )


# Status que efetivamente ocupam a sala e, portanto, entram na verificacao de
# conflito da RN04. `Pendente` nao ocupa: dois pedidos pendentes para o mesmo
# slot apenas se apontam mutuamente como conflito, sem bloquear a analise.
STATUS_QUE_OCUPAM_SALA: frozenset[StatusAlocacaoLab] = frozenset(
    {
        StatusAlocacaoLab.APROVADA,
        StatusAlocacaoLab.EM_USO,
    }
)


# ---------------------------------------------------------------------------
# Tabelas
# ---------------------------------------------------------------------------


class Laboratorio(Base):
    """Sala fisica de informatica (tabela `laboratorios`).

    Pre-requisito do RF-LAB05: o painel de aprovacoes exibe nome e bloco.
    O CRUD desta tabela pertence ao RF-LAB01 (Equipe 12).
    """

    __tablename__ = "laboratorios"

    id_laboratorio: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    nome_laboratorio: Mapped[str] = mapped_column(String(150), nullable=False)
    bloco_predio: Mapped[str] = mapped_column(String(150), nullable=False)
    capacidade_computadores: Mapped[int] = mapped_column(Integer, nullable=False)
    sistema_operacional: Mapped[str] = mapped_column(String(100), nullable=False)
    especificacao_hardware: Mapped[str] = mapped_column(Text, nullable=False)
    status_laboratorio: Mapped[StatusLaboratorio] = mapped_column(
        _enum_ddl(StatusLaboratorio, "status_laboratorio"),
        nullable=False,
        default=StatusLaboratorio.DISPONIVEL,
    )
    qr_code_porta_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
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
        return f"<Laboratorio {self.nome_laboratorio!r}>"


class GradeHorario(Base):
    """Slot de tempo institucional (tabela `grades_horarios`).

    Pre-requisito do RF-LAB05: define o intervalo comparado na RN04.
    A grade em si e exibida pelo RF-LAB03 (Equipe 14).
    """

    __tablename__ = "grades_horarios"

    id_grade_horario: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    turno: Mapped[TurnoAlocacao] = mapped_column(
        _enum_ddl(TurnoAlocacao, "turno_alocacao"),
        nullable=False,
    )
    descricao_tempo: Mapped[str] = mapped_column(String(100), nullable=False)
    hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
    hora_fim: Mapped[time] = mapped_column(Time, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover - auxilio de depuracao
        return f"<GradeHorario {self.turno.value} {self.descricao_tempo!r}>"


class AlocacaoLaboratorio(Base):
    """Pedido de uso de laboratorio (tabela `alocacoes_laboratorios`).

    E a entidade central do RF-LAB05: o Administrador aprova ou rejeita cada
    registro com `status_alocacao = 'Pendente'`, respeitando a RN04
    (sem sobreposicao de horario) e a RN05 (justificativa obrigatoria na
    rejeicao, gravada em `justificativa_rejeicao`).

    As colunas de check-in/fechamento existem no DDL e sao preenchidas pelos
    RF-LAB06 (Equipe 17) e RF-LAB07 (Equipe 18); aqui elas so sao declaradas.
    """

    __tablename__ = "alocacoes_laboratorios"

    id_alocacao: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    id_usuario: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("usuarios.id_usuario", ondelete="RESTRICT"),
        nullable=False,
    )
    id_laboratorio: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("laboratorios.id_laboratorio", ondelete="RESTRICT"),
        nullable=False,
    )
    id_grade_horario: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("grades_horarios.id_grade_horario", ondelete="RESTRICT"),
        nullable=False,
    )
    data_reserva: Mapped[date] = mapped_column(Date, nullable=False)
    dia_semana: Mapped[str] = mapped_column(String(20), nullable=False)
    disciplina: Mapped[str] = mapped_column(String(150), nullable=False)
    curso_turma: Mapped[str] = mapped_column(String(150), nullable=False)
    qtd_alunos_prevista: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_alocacao: Mapped[TipoAlocacaoLab] = mapped_column(
        _enum_ddl(TipoAlocacaoLab, "tipo_alocacao_lab"),
        nullable=False,
        default=TipoAlocacaoLab.PONTUAL,
    )
    status_alocacao: Mapped[StatusAlocacaoLab] = mapped_column(
        _enum_ddl(StatusAlocacaoLab, "status_alocacao_lab"),
        nullable=False,
        default=StatusAlocacaoLab.PENDENTE,
    )
    softwares_solicitados: Mapped[str | None] = mapped_column(Text, nullable=True)
    justificativa_rejeicao: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_hora_checkin: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    data_hora_fechamento: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    estado_conservacao_pos_aula: Mapped[EstadoPosAula | None] = mapped_column(
        _enum_ddl(EstadoPosAula, "estado_pos_aula"),
        nullable=True,
    )
    checklist_fechamento_obs: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    @property
    def ocupa_sala(self) -> bool:
        """Indica se esta alocacao reserva a sala para efeito da RN04."""
        return self.status_alocacao in STATUS_QUE_OCUPAM_SALA

    def __repr__(self) -> str:  # pragma: no cover - auxilio de depuracao
        return (
            f"<AlocacaoLaboratorio {self.disciplina!r} "
            f"{self.data_reserva} status={self.status_alocacao.value}>"
        )
