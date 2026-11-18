"""RF-LAB05 - Aprovacao de Alocacoes e Deteccao de Conflitos.

Painel do Administrador para analisar os pedidos de uso de laboratorio, com
alerta automatico de sobreposicao de horario e recusa justificada.

Rota base: `/api/v1/laboratorios/alocacoes`
Contratos: docs/seq_06_mapa_backend.md, secoes 3.6 e 3.7.

Regras de negocio aplicadas (docs/seq_02_requisitos_V8.md, secao 4):
  * **RN02** - todas as rotas exigem perfil Administrador.
  * **RN04** - uma alocacao nao e aprovada se a sala ja estiver ocupada no
    mesmo dia e intervalo de tempo (responde 409).
  * **RN05** - rejeicao exige justificativa (validada no schema, 422).

Extensao sobre a documentacao: o seq_06 expoe apenas o booleano
`conflito_detectado`. Foi acrescentado `GET /{id}/conflitos` (e o campo
`conflitos` na listagem) para que o Administrador veja *com quem* o horario
bate - sem isso o alerta vermelho da tela informa o problema mas nao ajuda a
resolve-lo.

TODO(RF-LAB04, Equipe 15): `POST /api/v1/laboratorios/alocacoes/` (criacao do
pedido pelo Solicitante) entra neste mesmo router. A deteccao de conflito ja
esta pronta para ser reaproveitada la, via `repositorio.listar_conflitos`.
"""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import RepositorioAlocacoes, UsuarioAdmin
from app.models.laboratorios import (
    AlocacaoLaboratorio,
    StatusAlocacaoLab,
    TipoAlocacaoLab,
)
from app.repositories import catalogo_labs_mock as catalogo
from app.schemas.laboratorios.alocacoes import (
    AlocacaoEmConflito,
    AlocacaoPendenteResponse,
    AlocacaoStatusResponse,
    AlocacaoStatusUpdate,
    DocenteResumo,
    LaboratorioResumo,
)
from app.services.notificacoes import enfileirar_decisao_alocacao, montar_evento_decisao

router = APIRouter(
    prefix="/api/v1/laboratorios/alocacoes",
    tags=["Laboratórios - Aprovação de Alocações (RF-LAB05)"],
)

NAO_ENCONTRADO = "Alocação não encontrada."
JA_ANALISADA = "Esta solicitação já foi analisada."
CADASTRO_INCOMPLETO = (
    "Cadastro de apoio incompleto: laboratório, horário ou docente "
    "da solicitação não foi encontrado."
)

DOCENTE_DESCONHECIDO = "Docente não identificado"


# ---------------------------------------------------------------------------
# Montagem das respostas (ORM -> contrato JSON do seq_06)
# ---------------------------------------------------------------------------


def _separar_softwares(texto: str | None) -> list[str]:
    """`softwares_solicitados` e TEXT no banco e lista no contrato (seq_06, 3.6)."""
    if not texto:
        return []
    return [item.strip() for item in texto.split(",") if item.strip()]


def _montar_conflito(alocacao: AlocacaoLaboratorio) -> AlocacaoEmConflito:
    docente = catalogo.obter_docente(alocacao.id_usuario)
    return AlocacaoEmConflito(
        id_alocacao=alocacao.id_alocacao,
        docente=docente.nome_completo if docente else DOCENTE_DESCONHECIDO,
        disciplina=alocacao.disciplina,
        curso_turma=alocacao.curso_turma,
        tipo_alocacao=alocacao.tipo_alocacao,
        status_alocacao=alocacao.status_alocacao,
        bloqueia_aprovacao=alocacao.ocupa_sala,
    )


def _montar_pendente(
    alocacao: AlocacaoLaboratorio,
    conflitos: list[AlocacaoLaboratorio],
) -> AlocacaoPendenteResponse:
    laboratorio = catalogo.obter_laboratorio(alocacao.id_laboratorio)
    grade = catalogo.obter_grade(alocacao.id_grade_horario)
    docente = catalogo.obter_docente(alocacao.id_usuario)

    if laboratorio is None or grade is None or docente is None:
        # Integridade referencial do DDL garante que isso nao acontece com o
        # banco real; enquanto as tabelas de apoio sao mocks, falha explicito.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=CADASTRO_INCOMPLETO,
        )

    intervalo = f"{grade.hora_inicio:%H:%M} - {grade.hora_fim:%H:%M}"

    return AlocacaoPendenteResponse(
        id_alocacao=alocacao.id_alocacao,
        laboratorio=LaboratorioResumo(
            id_laboratorio=laboratorio.id_laboratorio,
            nome=laboratorio.nome_laboratorio,
            bloco=laboratorio.bloco_predio,
        ),
        docente=DocenteResumo(
            id_usuario=docente.id_usuario,
            nome=docente.nome_completo,
            matricula=docente.identificacao_institucional,
        ),
        disciplina=alocacao.disciplina,
        curso_turma=alocacao.curso_turma,
        qtd_alunos_prevista=alocacao.qtd_alunos_prevista,
        data_reserva=alocacao.data_reserva,
        dia_semana=alocacao.dia_semana,
        turno=grade.turno,
        horario=f"{grade.turno.value} ({intervalo})",
        descricao_tempo=grade.descricao_tempo,
        tipo_alocacao=alocacao.tipo_alocacao,
        softwares_solicitados=_separar_softwares(alocacao.softwares_solicitados),
        status_alocacao=alocacao.status_alocacao,
        conflito_detectado=bool(conflitos),
        conflitos=[_montar_conflito(c) for c in conflitos],
        criado_em=alocacao.criado_em,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/pendentes",
    response_model=list[AlocacaoPendenteResponse],
    summary="Listar pedidos de alocação pendentes (com detecção de conflitos)",
)
def listar_alocacoes_pendentes(
    repositorio: RepositorioAlocacoes,
    _admin: UsuarioAdmin,
    tipo_alocacao: TipoAlocacaoLab | None = Query(
        default=None,
        description="Filtra a fila por `Pontual` ou `Semestral`.",
    ),
    id_laboratorio: uuid.UUID | None = Query(
        default=None,
        description="Filtra a fila por um laboratório específico.",
    ),
) -> list[AlocacaoPendenteResponse]:
    """Fila de analise do Administrador, em ordem cronologica de solicitacao.

    Cada item ja vem com o resultado da RN04 (`conflito_detectado` e a lista
    `conflitos`), para que a tela destaque o alerta critico vermelho sem
    precisar de uma segunda requisicao.
    """
    pendentes = repositorio.listar_pendentes(
        tipo_alocacao=tipo_alocacao,
        id_laboratorio=id_laboratorio,
    )
    return [
        _montar_pendente(alocacao, repositorio.listar_conflitos(alocacao))
        for alocacao in pendentes
    ]


@router.get(
    "/{id_alocacao}/conflitos",
    response_model=list[AlocacaoEmConflito],
    summary="Detalhar os conflitos de grade de uma alocação",
    responses={404: {"description": NAO_ENCONTRADO}},
)
def listar_conflitos_da_alocacao(
    id_alocacao: uuid.UUID,
    repositorio: RepositorioAlocacoes,
    _admin: UsuarioAdmin,
) -> list[AlocacaoEmConflito]:
    """Quem mais disputa o mesmo laboratório, dia e intervalo de tempo (RN04)."""
    alocacao = repositorio.obter(id_alocacao)
    if alocacao is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NAO_ENCONTRADO)

    return [_montar_conflito(c) for c in repositorio.listar_conflitos(alocacao)]


@router.patch(
    "/{id_alocacao}/status",
    response_model=AlocacaoStatusResponse,
    summary="Aprovar ou rejeitar uma alocação de laboratório",
    responses={
        404: {"description": NAO_ENCONTRADO},
        409: {"description": "Solicitação já analisada ou conflito de grade (RN04)."},
        422: {"description": "Justificativa ausente na rejeição (RN05)."},
    },
)
def decidir_alocacao(
    id_alocacao: uuid.UUID,
    decisao: AlocacaoStatusUpdate,
    repositorio: RepositorioAlocacoes,
    _admin: UsuarioAdmin,
) -> AlocacaoStatusResponse:
    """Registra a decisão do Administrador sobre um pedido pendente.

    - **RN04:** aprovar é bloqueado (409) se a sala já estiver ocupada por
      uma alocação `Aprovada` / `Em_Uso` no mesmo dia e horário.
    - **RN05:** rejeitar sem justificativa é recusado (422) pelo schema.

    Após gravar, o evento de notificação ao docente é publicado
    (`Alocacao_Aprovada` / `Alocacao_Rejeitada`, ver `app/services/notificacoes.py`).
    """
    alocacao = repositorio.obter(id_alocacao)
    if alocacao is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NAO_ENCONTRADO)

    if alocacao.status_alocacao is not StatusAlocacaoLab.PENDENTE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"{JA_ANALISADA} Status atual: "
                f"{alocacao.status_alocacao.value}."
            ),
        )

    if decisao.status_alocacao is StatusAlocacaoLab.APROVADA:
        bloqueios = [c for c in repositorio.listar_conflitos(alocacao) if c.ocupa_sala]
        if bloqueios:
            concorrente = bloqueios[0]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Conflito de grade (RN04): o laboratório já está reservado "
                    f"para \"{concorrente.disciplina}\" "
                    f"({concorrente.curso_turma}) neste dia e horário. "
                    "Rejeite o pedido com justificativa ou peça a alteração do horário."
                ),
            )

    atualizada = repositorio.registrar_decisao(
        id_alocacao,
        decisao.status_alocacao,
        decisao.justificativa_rejeicao,
    )
    if atualizada is None:  # pragma: no cover - guardado pelo 404 acima
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NAO_ENCONTRADO)

    laboratorio = catalogo.obter_laboratorio(atualizada.id_laboratorio)
    enfileirar_decisao_alocacao(
        montar_evento_decisao(
            atualizada,
            catalogo.obter_docente(atualizada.id_usuario),
            laboratorio.nome_laboratorio if laboratorio else "",
            catalogo.obter_grade(atualizada.id_grade_horario),
        )
    )

    aprovada = atualizada.status_alocacao is StatusAlocacaoLab.APROVADA
    mensagem = (
        "Alocação aprovada. Notificação disparada ao docente."
        if aprovada
        else "Alocação rejeitada. Justificativa enviada ao docente."
    )

    return AlocacaoStatusResponse(
        id_alocacao=atualizada.id_alocacao,
        status_alocacao=atualizada.status_alocacao,
        mensagem=mensagem,
    )
