"""Contratos Pydantic v2 do Modulo 2 - Alocacao e Gestao de Laboratorios.

Referencia dos contratos JSON: docs/seq_06_mapa_backend.md, secoes 3.6 e 3.7.

Escopo deste arquivo: RF-LAB05 (Aprovacao e Deteccao de Conflitos).

O `seq_06` previa um unico `app/schemas/laboratorios.py`. A Equipe 19 (RF-LAB08)
transformou esse caminho em **pacote** (`app/schemas/laboratorios/dashboard.py`)
e os dois formatos nao podem coexistir: um modulo `laboratorios.py` sombreia o
pacote e quebra o import `app.schemas.laboratorios.dashboard`. Ao integrar com
a `develop`, os schemas do RF-LAB05 foram movidos para dentro do pacote, um
arquivo por requisito - sem alterar o arquivo da outra equipe.

TODO(outras duplas do Modulo 2): `LabSchema` (RF-LAB01), `SoftwareSchema`
(RF-LAB02), `GradeSchema` (RF-LAB03), `AlocacaoCreate` (RF-LAB04) e
`FechamentoSchema` (RF-LAB07) entram como novos arquivos neste pacote.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.laboratorios import StatusAlocacaoLab, TipoAlocacaoLab, TurnoAlocacao

# Limite espelhado do DDL (docs/seq_05_database_schema.md, secao 2.9).
TAMANHO_MIN_JUSTIFICATIVA = 10


class LaboratorioResumo(BaseModel):
    """Bloco `laboratorio` do contrato (seq_06, secao 3.6)."""

    model_config = ConfigDict(from_attributes=True)

    id_laboratorio: uuid.UUID
    nome: str = Field(examples=["Laboratório 01 - Redes e Infraestrutura"])
    bloco: str = Field(examples=["Bloco B - Sala 102"])


class DocenteResumo(BaseModel):
    """Bloco `docente` do contrato (seq_06, secao 3.6).

    Alimentado hoje pelo mock de usuarios; quando o RF-CORE05 entregar a
    tabela `usuarios`, os mesmos campos passam a vir do banco.
    """

    model_config = ConfigDict(from_attributes=True)

    id_usuario: uuid.UUID
    nome: str = Field(examples=["Prof. Roberto Dias"])
    matricula: str = Field(examples=["SIAPE 1982341"])


class AlocacaoEmConflito(BaseModel):
    """Alocacao que disputa o mesmo laboratorio, data e slot de horario (RN04).

    Extensao sobre o seq_06: o contrato original expoe apenas o booleano
    `conflito_detectado`. Para que o Administrador consiga *resolver* o
    conflito (e nao apenas ve-lo), a API devolve tambem quem esta ocupando
    a sala - e isso que o alerta vermelho da tela detalha.
    """

    id_alocacao: uuid.UUID
    docente: str
    disciplina: str
    curso_turma: str
    tipo_alocacao: TipoAlocacaoLab
    status_alocacao: StatusAlocacaoLab
    bloqueia_aprovacao: bool = Field(
        description=(
            "`true` quando a alocacao concorrente ja ocupa a sala "
            "(Aprovada/Em_Uso) e portanto impede a aprovacao pela RN04."
        ),
    )


class AlocacaoPendenteResponse(BaseModel):
    """Item de `GET /api/v1/laboratorios/alocacoes/pendentes` (seq_06, 3.6)."""

    id_alocacao: uuid.UUID
    laboratorio: LaboratorioResumo
    docente: DocenteResumo
    disciplina: str
    curso_turma: str
    qtd_alunos_prevista: int
    data_reserva: date
    dia_semana: str
    turno: TurnoAlocacao
    horario: str = Field(
        description="Turno e intervalo formatados. Ex: 'Matutino (07:30 - 09:10)'.",
        examples=["Matutino (07:30 - 09:10)"],
    )
    descricao_tempo: str = Field(examples=["1º e 2º Tempo (07:30 - 09:10)"])
    tipo_alocacao: TipoAlocacaoLab
    softwares_solicitados: list[str]
    status_alocacao: StatusAlocacaoLab
    conflito_detectado: bool
    conflitos: list[AlocacaoEmConflito] = Field(
        default_factory=list,
        description="Detalhamento dos conflitos (vazio quando nao houver).",
    )
    criado_em: datetime


class AlocacaoStatusUpdate(BaseModel):
    """Corpo de `PATCH /api/v1/laboratorios/alocacoes/{id}/status` (seq_06, 3.7).

    Aceita apenas `Aprovada` ou `Rejeitada` - as demais transicoes de status
    (`Em_Uso`, `Concluida`, `Cancelada`) pertencem a outros requisitos.

    A RN05 (justificativa obrigatoria em rejeicoes) e validada aqui, antes de
    a requisicao chegar ao router.
    """

    status_alocacao: StatusAlocacaoLab = Field(
        description="Decisao do Administrador: `Aprovada` ou `Rejeitada`.",
        examples=["Aprovada"],
    )
    justificativa_rejeicao: str | None = Field(
        default=None,
        description="Obrigatoria quando `status_alocacao = 'Rejeitada'` (RN05).",
        examples=[None],
    )

    @model_validator(mode="after")
    def validar_decisao(self) -> "AlocacaoStatusUpdate":
        if self.status_alocacao not in (
            StatusAlocacaoLab.APROVADA,
            StatusAlocacaoLab.REJEITADA,
        ):
            raise ValueError(
                "Este endpoint aceita apenas 'Aprovada' ou 'Rejeitada'."
            )

        justificativa = (self.justificativa_rejeicao or "").strip()

        if self.status_alocacao is StatusAlocacaoLab.REJEITADA:
            # RN05 - Justificativa Obrigatoria em Rejeicoes.
            if not justificativa:
                raise ValueError(
                    "A justificativa e obrigatoria para rejeitar uma alocacao (RN05)."
                )
            if len(justificativa) < TAMANHO_MIN_JUSTIFICATIVA:
                raise ValueError(
                    "A justificativa deve explicar o motivo da recusa "
                    f"(minimo de {TAMANHO_MIN_JUSTIFICATIVA} caracteres)."
                )
            self.justificativa_rejeicao = justificativa
        else:
            # Uma aprovacao nunca carrega justificativa de recusa.
            self.justificativa_rejeicao = None

        return self


class AlocacaoStatusResponse(BaseModel):
    """Resposta de `PATCH .../{id}/status` (seq_06, secao 3.7)."""

    id_alocacao: uuid.UUID
    status_alocacao: StatusAlocacaoLab
    mensagem: str = Field(
        examples=["Alocação aprovada. Notificação disparada ao docente."],
    )
