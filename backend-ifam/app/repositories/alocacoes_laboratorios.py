"""Repositorio de `alocacoes_laboratorios` (RF-LAB05).

=============================================================================
PONTO DE TROCA DA PERSISTENCIA
=============================================================================
A camada de banco (engine, sessoes, migracoes) pertence a Equipe do Core e
ainda nao existe. Para que o RF-LAB05 seja entregue funcionando, a
persistencia fica isolada atras do protocolo `AlocacaoRepository`.

Duas implementacoes, escolhidas em `app/core/deps.py::get_alocacao_repository`
pela variavel `USE_IN_MEMORY_REPO`:

  * `InMemoryAlocacaoRepository`   - dicionario em memoria, com seed;
  * `SqlAlchemyAlocacaoRepository` - PostgreSQL (docker-compose.yml).

Nenhum router, schema ou teste depende de qual delas esta ativa.

Equivalente SQL de `listar_conflitos`:

    SELECT * FROM alocacoes_laboratorios a
     JOIN grades_horarios g ON g.id_grade_horario = a.id_grade_horario
    WHERE a.id_laboratorio = :id_laboratorio
      AND a.id_alocacao   <> :id_alocacao
      AND a.status_alocacao IN ('Pendente', 'Aprovada', 'Em_Uso')
      AND (CASE WHEN :semestral THEN a.dia_semana = :dia_semana
                ELSE a.data_reserva = :data_reserva END)
      AND g.hora_inicio < :hora_fim AND :hora_inicio < g.hora_fim;

(o indice `idx_alocacoes_data_lab` do seq_05 ja cobre esse filtro)
=============================================================================
"""

import uuid
from datetime import date, datetime, timezone
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.laboratorios import (
    AlocacaoLaboratorio,
    GradeHorario,
    StatusAlocacaoLab,
    TipoAlocacaoLab,
)
from app.repositories import catalogo_labs_mock as catalogo
from app.services.conflitos_alocacao import alocacoes_conflitam

# Status considerados "vivos" na agenda: entram na deteccao de conflito.
# `Rejeitada`, `Concluida` e `Cancelada` liberam a sala e sao ignorados.
STATUS_NA_AGENDA: frozenset[StatusAlocacaoLab] = frozenset(
    {
        StatusAlocacaoLab.PENDENTE,
        StatusAlocacaoLab.APROVADA,
        StatusAlocacaoLab.EM_USO,
    }
)


class AlocacaoRepository(Protocol):
    """Operacoes de persistencia exigidas pelo router de aprovacoes."""

    def listar_pendentes(
        self,
        tipo_alocacao: TipoAlocacaoLab | None = None,
        id_laboratorio: uuid.UUID | None = None,
    ) -> list[AlocacaoLaboratorio]: ...

    def obter(self, id_alocacao: uuid.UUID) -> AlocacaoLaboratorio | None: ...

    def listar_conflitos(
        self,
        alocacao: AlocacaoLaboratorio,
    ) -> list[AlocacaoLaboratorio]: ...

    def registrar_decisao(
        self,
        id_alocacao: uuid.UUID,
        status: StatusAlocacaoLab,
        justificativa: str | None = None,
    ) -> AlocacaoLaboratorio | None: ...


# ---------------------------------------------------------------------------
# Dados iniciais (seed)
#
# Os tres pedidos pendentes sao exatamente os exibidos no prototipo
# `screen/aprovacoes_alocacoes_screen.js`, e o primeiro reproduz o exemplo
# publicado no contrato da API (seq_06, secoes 3.5 e 3.6).
#
# `SEED_ALOCACAO_APROVADA_GRAFICA` existe para que o conflito da RN04 seja
# demonstravel: ela ja ocupa o Lab 03 no mesmo dia e horario do pedido
# `aloc-103`, que por isso aparece com o alerta vermelho e nao pode ser
# aprovado.
# ---------------------------------------------------------------------------

ID_ALOCACAO_REDES = uuid.UUID("999e4567-e89b-12d3-a456-426614174999")
ID_ALOCACAO_WEB = uuid.UUID("999e4567-e89b-12d3-a456-426614174998")
ID_ALOCACAO_BLENDER = uuid.UUID("999e4567-e89b-12d3-a456-426614174997")
ID_ALOCACAO_CG_APROVADA = uuid.UUID("999e4567-e89b-12d3-a456-426614174990")


def _seed() -> tuple[AlocacaoLaboratorio, ...]:
    """Instancias iniciais de `alocacoes_laboratorios`."""
    return (
        AlocacaoLaboratorio(
            id_alocacao=ID_ALOCACAO_REDES,
            id_usuario=catalogo.ID_DOCENTE_ROBERTO,
            id_laboratorio=catalogo.ID_LAB_REDES,
            id_grade_horario=catalogo.ID_GRADE_MAT_1_2,
            data_reserva=date(2026, 8, 28),
            dia_semana="Sexta-feira",
            disciplina="Segurança de Redes e Firewalls",
            curso_turma="TADS 4º Período",
            qtd_alunos_prevista=28,
            tipo_alocacao=TipoAlocacaoLab.PONTUAL,
            status_alocacao=StatusAlocacaoLab.PENDENTE,
            softwares_solicitados="Wireshark, VirtualBox, Putty",
            criado_em=datetime(2026, 8, 25, 18, 55, tzinfo=timezone.utc),
            atualizado_em=datetime(2026, 8, 25, 18, 55, tzinfo=timezone.utc),
        ),
        AlocacaoLaboratorio(
            id_alocacao=ID_ALOCACAO_WEB,
            id_usuario=catalogo.ID_DOCENTE_CAMILA,
            id_laboratorio=catalogo.ID_LAB_SOFTWARE,
            id_grade_horario=catalogo.ID_GRADE_VES_3_4,
            data_reserva=date(2026, 8, 5),
            dia_semana="Quarta-feira",
            disciplina="Desenvolvimento Web FullStack",
            curso_turma="Eng. Software 3º Período",
            qtd_alunos_prevista=34,
            tipo_alocacao=TipoAlocacaoLab.SEMESTRAL,
            status_alocacao=StatusAlocacaoLab.PENDENTE,
            softwares_solicitados="VS Code, Docker, PostgreSQL",
            criado_em=datetime(2026, 8, 25, 19, 10, tzinfo=timezone.utc),
            atualizado_em=datetime(2026, 8, 25, 19, 10, tzinfo=timezone.utc),
        ),
        AlocacaoLaboratorio(
            id_alocacao=ID_ALOCACAO_BLENDER,
            id_usuario=catalogo.ID_DOCENTE_MARCOS,
            id_laboratorio=catalogo.ID_LAB_GRAFICA,
            id_grade_horario=catalogo.ID_GRADE_NOT_1_2,
            data_reserva=date(2026, 8, 29),
            dia_semana="Sábado",
            disciplina="Modelagem Tridimensional com Blender",
            curso_turma="Design Digital 2º Período",
            qtd_alunos_prevista=22,
            tipo_alocacao=TipoAlocacaoLab.PONTUAL,
            status_alocacao=StatusAlocacaoLab.PENDENTE,
            softwares_solicitados="Blender 3D, Photoshop",
            criado_em=datetime(2026, 8, 26, 9, 5, tzinfo=timezone.utc),
            atualizado_em=datetime(2026, 8, 26, 9, 5, tzinfo=timezone.utc),
        ),
        # Ja aprovada: e ela que gera o conflito do pedido acima (RN04).
        AlocacaoLaboratorio(
            id_alocacao=ID_ALOCACAO_CG_APROVADA,
            id_usuario=catalogo.ID_DOCENTE_CARLOS,
            id_laboratorio=catalogo.ID_LAB_GRAFICA,
            id_grade_horario=catalogo.ID_GRADE_NOT_1_2,
            data_reserva=date(2026, 8, 29),
            dia_semana="Sábado",
            disciplina="Introdução à Computação Gráfica",
            curso_turma="Design Digital 1º Período",
            qtd_alunos_prevista=20,
            tipo_alocacao=TipoAlocacaoLab.PONTUAL,
            status_alocacao=StatusAlocacaoLab.APROVADA,
            softwares_solicitados="Blender 3D, GIMP",
            criado_em=datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc),
            atualizado_em=datetime(2026, 8, 21, 14, 30, tzinfo=timezone.utc),
        ),
    )


class InMemoryAlocacaoRepository:
    """Implementacao em memoria do repositorio de alocacoes.

    Devolve instancias reais de `AlocacaoLaboratorio` (o modelo ORM),
    desacopladas de qualquer sessao do SQLAlchemy - assim o contrato entregue
    ao router e identico ao que a implementacao com banco vai devolver.
    """

    def __init__(self, semear: bool = True) -> None:
        self._registros: dict[uuid.UUID, AlocacaoLaboratorio] = {}
        if semear:
            self.semear()

    # -- Apoio -------------------------------------------------------------

    def semear(self) -> None:
        """Repovoa o repositorio com os dados iniciais (usado tambem nos testes)."""
        self._registros = {
            alocacao.id_alocacao: alocacao for alocacao in _seed()
        }

    def _grade_de(self, alocacao: AlocacaoLaboratorio) -> GradeHorario | None:
        return catalogo.obter_grade(alocacao.id_grade_horario)

    # -- Leitura -----------------------------------------------------------

    def listar_pendentes(
        self,
        tipo_alocacao: TipoAlocacaoLab | None = None,
        id_laboratorio: uuid.UUID | None = None,
    ) -> list[AlocacaoLaboratorio]:
        """Pedidos aguardando analise, do mais antigo para o mais recente.

        A fila e cronologica de proposito: o pedido que chegou primeiro e
        analisado primeiro.
        """
        resultado = [
            alocacao
            for alocacao in self._registros.values()
            if alocacao.status_alocacao is StatusAlocacaoLab.PENDENTE
        ]

        if tipo_alocacao is not None:
            resultado = [a for a in resultado if a.tipo_alocacao is tipo_alocacao]

        if id_laboratorio is not None:
            resultado = [a for a in resultado if a.id_laboratorio == id_laboratorio]

        return sorted(resultado, key=lambda a: a.criado_em)

    def obter(self, id_alocacao: uuid.UUID) -> AlocacaoLaboratorio | None:
        return self._registros.get(id_alocacao)

    # -- RN04: Prevencao de Conflitos de Grade -----------------------------

    def listar_conflitos(
        self,
        alocacao: AlocacaoLaboratorio,
    ) -> list[AlocacaoLaboratorio]:
        """Alocacoes que disputam o mesmo laboratorio, dia e horario.

        A regra de sobreposicao vive em `app/services/conflitos_alocacao.py`;
        aqui fica apenas a varredura dos candidatos.
        """
        grade = self._grade_de(alocacao)
        if grade is None:
            # Sem o slot de horario nao ha como comparar intervalos. Nao se
            # inventa "sem conflito": o router responde 422.
            return []

        conflitos: list[AlocacaoLaboratorio] = []
        for candidata in self._registros.values():
            if candidata.status_alocacao not in STATUS_NA_AGENDA:
                continue

            grade_candidata = self._grade_de(candidata)
            if grade_candidata is None:
                continue

            if alocacoes_conflitam(alocacao, grade, candidata, grade_candidata):
                conflitos.append(candidata)

        return sorted(conflitos, key=lambda a: a.criado_em)

    # -- Escrita -----------------------------------------------------------

    def registrar_decisao(
        self,
        id_alocacao: uuid.UUID,
        status: StatusAlocacaoLab,
        justificativa: str | None = None,
    ) -> AlocacaoLaboratorio | None:
        """Grava a decisao do Administrador (aprovacao ou rejeicao).

        A validacao da RN05 acontece no schema e a da RN04 no router; aqui
        so persiste.
        """
        alocacao = self._registros.get(id_alocacao)
        if alocacao is None:
            return None

        alocacao.status_alocacao = status
        alocacao.justificativa_rejeicao = justificativa
        alocacao.atualizado_em = datetime.now(timezone.utc)
        return alocacao


class SqlAlchemyAlocacaoRepository:
    """Implementacao do repositorio sobre o PostgreSQL (SQLAlchemy 2.0).

    Recebe a sessao da requisicao (`app/core/deps.py::get_db`). A filtragem
    grossa (mesmo laboratorio, status na agenda) e feita no banco; a decisao
    de sobreposicao reaproveita `alocacoes_conflitam`, para que as duas
    implementacoes apliquem exatamente a mesma RN04.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def _grade_de(self, alocacao: AlocacaoLaboratorio) -> GradeHorario | None:
        return self._session.get(GradeHorario, alocacao.id_grade_horario)

    # -- Leitura -----------------------------------------------------------

    def listar_pendentes(
        self,
        tipo_alocacao: TipoAlocacaoLab | None = None,
        id_laboratorio: uuid.UUID | None = None,
    ) -> list[AlocacaoLaboratorio]:
        consulta = select(AlocacaoLaboratorio).where(
            AlocacaoLaboratorio.status_alocacao == StatusAlocacaoLab.PENDENTE
        )
        if tipo_alocacao is not None:
            consulta = consulta.where(AlocacaoLaboratorio.tipo_alocacao == tipo_alocacao)
        if id_laboratorio is not None:
            consulta = consulta.where(AlocacaoLaboratorio.id_laboratorio == id_laboratorio)

        consulta = consulta.order_by(AlocacaoLaboratorio.criado_em)
        return list(self._session.scalars(consulta))

    def obter(self, id_alocacao: uuid.UUID) -> AlocacaoLaboratorio | None:
        return self._session.get(AlocacaoLaboratorio, id_alocacao)

    # -- RN04: Prevencao de Conflitos de Grade -----------------------------

    def listar_conflitos(
        self,
        alocacao: AlocacaoLaboratorio,
    ) -> list[AlocacaoLaboratorio]:
        grade = self._grade_de(alocacao)
        if grade is None:
            return []

        consulta = (
            select(AlocacaoLaboratorio, GradeHorario)
            .join(
                GradeHorario,
                GradeHorario.id_grade_horario == AlocacaoLaboratorio.id_grade_horario,
            )
            .where(
                AlocacaoLaboratorio.id_laboratorio == alocacao.id_laboratorio,
                AlocacaoLaboratorio.id_alocacao != alocacao.id_alocacao,
                AlocacaoLaboratorio.status_alocacao.in_(STATUS_NA_AGENDA),
                GradeHorario.hora_inicio < grade.hora_fim,
                GradeHorario.hora_fim > grade.hora_inicio,
            )
            .order_by(AlocacaoLaboratorio.criado_em)
        )

        return [
            candidata
            for candidata, grade_candidata in self._session.execute(consulta)
            if alocacoes_conflitam(alocacao, grade, candidata, grade_candidata)
        ]

    # -- Escrita -----------------------------------------------------------

    def registrar_decisao(
        self,
        id_alocacao: uuid.UUID,
        status: StatusAlocacaoLab,
        justificativa: str | None = None,
    ) -> AlocacaoLaboratorio | None:
        alocacao = self.obter(id_alocacao)
        if alocacao is None:
            return None

        alocacao.status_alocacao = status
        alocacao.justificativa_rejeicao = justificativa
        alocacao.atualizado_em = datetime.now(timezone.utc)
        self._session.commit()
        return alocacao


# Instancia unica do repositorio em memoria, para que o estado sobreviva
# entre requisicoes enquanto a API estiver no ar.
repositorio_em_memoria = InMemoryAlocacaoRepository()
