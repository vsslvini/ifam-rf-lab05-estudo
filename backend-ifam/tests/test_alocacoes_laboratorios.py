"""Testes do RF-LAB05 - Aprovacao de Alocacoes e Deteccao de Conflitos."""

from datetime import date, datetime, time, timezone

from fastapi.testclient import TestClient

from app.models.laboratorios import (
    AlocacaoLaboratorio,
    GradeHorario,
    StatusAlocacaoLab,
    TipoAlocacaoLab,
    TurnoAlocacao,
)
from app.services.conflitos_alocacao import alocacoes_conflitam, horarios_se_sobrepoem

BASE = "/api/v1/laboratorios/alocacoes"

# Ids do seed (app/repositories/alocacoes_laboratorios.py).
ID_REDES = "999e4567-e89b-12d3-a456-426614174999"  # pendente, sem conflito
ID_WEB = "999e4567-e89b-12d3-a456-426614174998"  # pendente, semestral
ID_BLENDER = "999e4567-e89b-12d3-a456-426614174997"  # pendente, EM conflito
ID_CG_APROVADA = "999e4567-e89b-12d3-a456-426614174990"  # ja aprovada
ID_INEXISTENTE = "00000000-0000-4000-8000-000000000000"

JUSTIFICATIVA_VALIDA = "Sala reservada para manutencao preventiva neste turno."


# --- Health check ---------------------------------------------------------


def test_health_check_segue_contrato(client: TestClient) -> None:
    resposta = client.get("/")
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "online"
    assert resposta.json()["documentacao"] == "/docs"


def test_ping_responde_pong(client: TestClient) -> None:
    resposta = client.get("/ping")
    assert resposta.status_code == 200
    assert resposta.json()["ping"] == "pong"


# --- Fila de pendentes (seq_06, secao 3.6) --------------------------------


def test_listar_pendentes_devolve_apenas_status_pendente(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/pendentes")
    assert resposta.status_code == 200

    corpo = resposta.json()
    assert len(corpo) == 3
    assert {item["status_alocacao"] for item in corpo} == {"Pendente"}
    # A alocacao ja aprovada nao aparece na fila de analise.
    assert ID_CG_APROVADA not in {item["id_alocacao"] for item in corpo}


def test_listar_pendentes_segue_o_contrato_do_seq_06(client: TestClient) -> None:
    item = client.get(f"{BASE}/pendentes").json()[0]

    assert item["id_alocacao"] == ID_REDES
    assert item["laboratorio"]["nome"] == "Laboratório 01 - Redes e Infraestrutura"
    assert item["laboratorio"]["bloco"] == "Bloco B - Sala 102"
    assert item["docente"]["nome"] == "Prof. Roberto Dias"
    assert item["docente"]["matricula"] == "SIAPE 1982341"
    assert item["horario"] == "Matutino (07:30 - 09:10)"
    assert item["tipo_alocacao"] == "Pontual"
    # `softwares_solicitados` e TEXT no banco e lista no contrato.
    assert item["softwares_solicitados"] == ["Wireshark", "VirtualBox", "Putty"]
    assert item["conflito_detectado"] is False


def test_listar_pendentes_em_ordem_cronologica(client: TestClient) -> None:
    corpo = client.get(f"{BASE}/pendentes").json()
    criados = [item["criado_em"] for item in corpo]
    assert criados == sorted(criados)


def test_listar_pendentes_filtra_por_tipo(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/pendentes", params={"tipo_alocacao": "Semestral"})
    assert resposta.status_code == 200

    corpo = resposta.json()
    assert len(corpo) == 1
    assert corpo[0]["id_alocacao"] == ID_WEB


def test_listar_pendentes_filtra_por_laboratorio(client: TestClient) -> None:
    id_lab_redes = client.get(f"{BASE}/pendentes").json()[0]["laboratorio"]["id_laboratorio"]

    resposta = client.get(f"{BASE}/pendentes", params={"id_laboratorio": id_lab_redes})
    assert resposta.status_code == 200
    assert [item["id_alocacao"] for item in resposta.json()] == [ID_REDES]


def test_filtro_sem_resultado_devolve_lista_vazia(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/pendentes", params={"id_laboratorio": ID_INEXISTENTE})
    assert resposta.status_code == 200
    assert resposta.json() == []


# --- RN04: deteccao de conflitos ------------------------------------------


def test_pendente_com_sala_ocupada_e_sinalizado(client: TestClient) -> None:
    corpo = client.get(f"{BASE}/pendentes").json()
    blender = next(item for item in corpo if item["id_alocacao"] == ID_BLENDER)

    assert blender["conflito_detectado"] is True
    assert len(blender["conflitos"]) == 1

    conflito = blender["conflitos"][0]
    assert conflito["id_alocacao"] == ID_CG_APROVADA
    assert conflito["status_alocacao"] == "Aprovada"
    assert conflito["bloqueia_aprovacao"] is True


def test_endpoint_de_conflitos_detalha_o_concorrente(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/{ID_BLENDER}/conflitos")
    assert resposta.status_code == 200

    corpo = resposta.json()
    assert len(corpo) == 1
    assert corpo[0]["disciplina"] == "Introdução à Computação Gráfica"


def test_endpoint_de_conflitos_sem_conflito_devolve_vazio(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/{ID_REDES}/conflitos")
    assert resposta.status_code == 200
    assert resposta.json() == []


def test_endpoint_de_conflitos_404_para_id_inexistente(client: TestClient) -> None:
    resposta = client.get(f"{BASE}/{ID_INEXISTENTE}/conflitos")
    assert resposta.status_code == 404


def test_aprovar_com_sala_ocupada_e_bloqueado(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_BLENDER}/status",
        json={"status_alocacao": "Aprovada"},
    )
    assert resposta.status_code == 409
    assert "RN04" in resposta.json()["detail"]

    # O pedido continua pendente - nada foi gravado.
    pendentes = {item["id_alocacao"] for item in client.get(f"{BASE}/pendentes").json()}
    assert ID_BLENDER in pendentes


def test_rejeicao_libera_a_sala_para_o_pedido_concorrente(client: TestClient) -> None:
    """Rejeitada/Concluida/Cancelada saem da agenda e deixam de conflitar."""
    # Aprovar o Blender so e possivel depois que a alocacao que ocupa a sala sair.
    # Como o seed a traz `Aprovada`, o caminho testado e o inverso: o conflito
    # desaparece quando o pedido concorrente e recusado.
    conflitos_antes = client.get(f"{BASE}/{ID_BLENDER}/conflitos").json()
    assert len(conflitos_antes) == 1

    # Rejeita o proprio Blender e confirma que ele sai da agenda do concorrente.
    client.patch(
        f"{BASE}/{ID_BLENDER}/status",
        json={
            "status_alocacao": "Rejeitada",
            "justificativa_rejeicao": JUSTIFICATIVA_VALIDA,
        },
    )
    assert client.get(f"{BASE}/{ID_CG_APROVADA}/conflitos").json() == []


# --- Aprovacao (seq_06, secao 3.7) ----------------------------------------


def test_aprovar_alocacao_sem_conflito(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Aprovada"},
    )
    assert resposta.status_code == 200

    corpo = resposta.json()
    assert corpo["id_alocacao"] == ID_REDES
    assert corpo["status_alocacao"] == "Aprovada"
    assert corpo["mensagem"] == "Alocação aprovada. Notificação disparada ao docente."

    # Sai da fila de pendentes.
    pendentes = {item["id_alocacao"] for item in client.get(f"{BASE}/pendentes").json()}
    assert ID_REDES not in pendentes


def test_aprovar_dispara_evento_de_notificacao(client: TestClient) -> None:
    client.patch(f"{BASE}/{ID_REDES}/status", json={"status_alocacao": "Aprovada"})

    from app.services.notificacoes import eventos_emitidos

    eventos = eventos_emitidos()
    assert len(eventos) == 1
    assert eventos[0]["tipo_evento"] == "Alocacao_Aprovada"
    assert eventos[0]["destinatario"] == "roberto.dias@ifam.edu.br"
    assert eventos[0]["justificativa_rejeicao"] is None


def test_pedido_ja_analisado_devolve_409(client: TestClient) -> None:
    client.patch(f"{BASE}/{ID_REDES}/status", json={"status_alocacao": "Aprovada"})

    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Aprovada"},
    )
    assert resposta.status_code == 409
    assert "já foi analisada" in resposta.json()["detail"]


def test_decidir_id_inexistente_devolve_404(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_INEXISTENTE}/status",
        json={"status_alocacao": "Aprovada"},
    )
    assert resposta.status_code == 404


def test_status_fora_do_escopo_do_endpoint_devolve_422(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Em_Uso"},
    )
    assert resposta.status_code == 422


# --- RN05: justificativa obrigatoria em rejeicoes -------------------------


def test_rejeitar_sem_justificativa_devolve_422(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Rejeitada"},
    )
    assert resposta.status_code == 422


def test_rejeitar_com_justificativa_em_branco_devolve_422(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Rejeitada", "justificativa_rejeicao": "     "},
    )
    assert resposta.status_code == 422


def test_rejeitar_com_justificativa_curta_devolve_422(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={"status_alocacao": "Rejeitada", "justificativa_rejeicao": "nao"},
    )
    assert resposta.status_code == 422


def test_rejeitar_com_justificativa_valida(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={
            "status_alocacao": "Rejeitada",
            "justificativa_rejeicao": JUSTIFICATIVA_VALIDA,
        },
    )
    assert resposta.status_code == 200
    assert resposta.json()["status_alocacao"] == "Rejeitada"
    assert "Justificativa enviada" in resposta.json()["mensagem"]


def test_rejeicao_envia_a_justificativa_ao_docente(client: TestClient) -> None:
    client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={
            "status_alocacao": "Rejeitada",
            "justificativa_rejeicao": JUSTIFICATIVA_VALIDA,
        },
    )

    from app.services.notificacoes import eventos_emitidos

    evento = eventos_emitidos()[0]
    assert evento["tipo_evento"] == "Alocacao_Rejeitada"
    assert evento["justificativa_rejeicao"] == JUSTIFICATIVA_VALIDA


def test_aprovacao_ignora_justificativa_enviada_por_engano(client: TestClient) -> None:
    resposta = client.patch(
        f"{BASE}/{ID_REDES}/status",
        json={
            "status_alocacao": "Aprovada",
            "justificativa_rejeicao": "texto que nao deveria ser gravado",
        },
    )
    assert resposta.status_code == 200

    from app.services.notificacoes import eventos_emitidos

    assert eventos_emitidos()[0]["justificativa_rejeicao"] is None


# --- Regra de dominio isolada (app/services/conflitos_alocacao.py) --------


def _grade(hora_inicio: time, hora_fim: time) -> GradeHorario:
    return GradeHorario(
        turno=TurnoAlocacao.MATUTINO,
        descricao_tempo="teste",
        hora_inicio=hora_inicio,
        hora_fim=hora_fim,
    )


def _alocacao(
    id_lab: str = "1",
    data_reserva: date = date(2026, 8, 28),
    dia_semana: str = "Sexta-feira",
    tipo: TipoAlocacaoLab = TipoAlocacaoLab.PONTUAL,
) -> AlocacaoLaboratorio:
    import uuid

    return AlocacaoLaboratorio(
        id_alocacao=uuid.uuid4(),
        id_usuario=uuid.uuid4(),
        id_laboratorio=uuid.uuid5(uuid.NAMESPACE_OID, id_lab),
        id_grade_horario=uuid.uuid4(),
        data_reserva=data_reserva,
        dia_semana=dia_semana,
        disciplina="Disciplina de teste",
        curso_turma="Turma de teste",
        qtd_alunos_prevista=10,
        tipo_alocacao=tipo,
        status_alocacao=StatusAlocacaoLab.PENDENTE,
        criado_em=datetime(2026, 8, 1, tzinfo=timezone.utc),
        atualizado_em=datetime(2026, 8, 1, tzinfo=timezone.utc),
    )


def test_horarios_encostados_nao_se_sobrepoem() -> None:
    manha = _grade(time(7, 30), time(9, 10))
    seguinte = _grade(time(9, 10), time(10, 50))
    assert horarios_se_sobrepoem(manha, seguinte) is False


def test_horarios_parcialmente_sobrepostos_conflitam() -> None:
    manha = _grade(time(7, 30), time(9, 10))
    atravessado = _grade(time(8, 30), time(10, 10))
    assert horarios_se_sobrepoem(manha, atravessado) is True


def test_slots_diferentes_mas_sobrepostos_conflitam() -> None:
    """A RN04 fala em intervalo de tempo, nao em igualdade de slot."""
    a, b = _alocacao(), _alocacao()
    assert alocacoes_conflitam(a, _grade(time(7, 30), time(9, 10)), b, _grade(time(8, 0), time(9, 40)))


def test_laboratorios_diferentes_nao_conflitam() -> None:
    a, b = _alocacao(id_lab="1"), _alocacao(id_lab="2")
    grade = _grade(time(7, 30), time(9, 10))
    assert alocacoes_conflitam(a, grade, b, grade) is False


def test_datas_diferentes_nao_conflitam_em_alocacao_pontual() -> None:
    a = _alocacao(data_reserva=date(2026, 8, 28))
    b = _alocacao(data_reserva=date(2026, 9, 4))
    grade = _grade(time(7, 30), time(9, 10))
    assert alocacoes_conflitam(a, grade, b, grade) is False


def test_semestral_conflita_pelo_dia_da_semana_em_datas_diferentes() -> None:
    """Alocacao semestral se repete toda semana (ver decisao 2 do modulo)."""
    semestral = _alocacao(
        data_reserva=date(2026, 8, 5),
        dia_semana="Quarta-feira",
        tipo=TipoAlocacaoLab.SEMESTRAL,
    )
    pontual = _alocacao(data_reserva=date(2026, 9, 30), dia_semana="Quarta-feira")
    grade = _grade(time(15, 30), time(17, 10))
    assert alocacoes_conflitam(semestral, grade, pontual, grade) is True


def test_semestral_em_dia_da_semana_diferente_nao_conflita() -> None:
    semestral = _alocacao(dia_semana="Quarta-feira", tipo=TipoAlocacaoLab.SEMESTRAL)
    pontual = _alocacao(dia_semana="Sexta-feira")
    grade = _grade(time(15, 30), time(17, 10))
    assert alocacoes_conflitam(semestral, grade, pontual, grade) is False
