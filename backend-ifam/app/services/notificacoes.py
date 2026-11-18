"""Disparo de notificacoes de decisao de alocacao (RF-LAB05 -> RF-CORE03).

=============================================================================
FRONTEIRA DE INTEGRACAO
=============================================================================
O contrato do seq_06 (secao 3.7) responde
"Alocação aprovada. Notificação disparada ao docente." e o seq_07 define que
esse disparo acontece de forma assincrona, pela fila
`fila_emails_transacionais` (RabbitMQ + Celery), gravando tambem uma
notificacao in-app na tabela `notificacoes` (RF-CORE03, Equipe 2).

Nem a fila nem a tabela existem hoje. Para nao inventar nenhuma das duas, o
evento e apenas *registrado no log* com exatamente os dados que a tarefa
Celery vai receber.

O que muda na integracao:
  * trocar o corpo de `enfileirar_decisao_alocacao` por
    `tasks_emails.enviar_email_decisao_alocacao.delay(**evento)`;
  * inserir a `Notificacao` (`Alocacao_Aprovada` / `Alocacao_Rejeitada`) na
    tabela do RF-CORE03.
Assinatura, nomes de campo e `tipo_evento` ja seguem o seq_06/seq_07, portanto
o router nao muda.
=============================================================================
"""

import logging
from typing import Any

from app.models.laboratorios import AlocacaoLaboratorio, GradeHorario, StatusAlocacaoLab
from app.repositories.catalogo_labs_mock import DocenteMock

logger = logging.getLogger("ifam.notificacoes")

# Valores do ENUM `tipo_notificacao` (docs/seq_05_database_schema.md).
TIPO_EVENTO_APROVADA = "Alocacao_Aprovada"
TIPO_EVENTO_REJEITADA = "Alocacao_Rejeitada"

# Registro dos eventos emitidos na execucao atual. Serve para os testes e
# para inspecionar a fila durante a apresentacao.
_eventos_emitidos: list[dict[str, Any]] = []


def montar_evento_decisao(
    alocacao: AlocacaoLaboratorio,
    docente: DocenteMock | None,
    laboratorio_nome: str,
    grade: GradeHorario | None,
) -> dict[str, Any]:
    """Monta o payload publicado na fila (formato do seq_07, secao 3.3)."""
    aprovada = alocacao.status_alocacao is StatusAlocacaoLab.APROVADA

    return {
        "tipo_evento": TIPO_EVENTO_APROVADA if aprovada else TIPO_EVENTO_REJEITADA,
        "id_alocacao": str(alocacao.id_alocacao),
        "id_usuario": str(alocacao.id_usuario),
        "destinatario": getattr(docente, "email", None),
        "nome_destinatario": getattr(docente, "nome_completo", None),
        "laboratorio": laboratorio_nome,
        "disciplina": alocacao.disciplina,
        "data_reserva": alocacao.data_reserva.isoformat(),
        "horario": grade.descricao_tempo if grade is not None else None,
        "justificativa_rejeicao": alocacao.justificativa_rejeicao,
    }


def enfileirar_decisao_alocacao(evento: dict[str, Any]) -> dict[str, Any]:
    """Publica (hoje: registra) o evento de aprovacao/rejeicao da alocacao."""
    logger.info(
        "[MOCK fila_emails_transacionais] %s -> %s (%s)",
        evento["tipo_evento"],
        evento.get("destinatario"),
        evento["id_alocacao"],
    )
    _eventos_emitidos.append(evento)
    return evento


def eventos_emitidos() -> list[dict[str, Any]]:
    """Eventos publicados desde o inicio da aplicacao (leitura)."""
    return list(_eventos_emitidos)


def limpar_eventos() -> None:
    """Zera o historico de eventos (usado pelos testes)."""
    _eventos_emitidos.clear()
