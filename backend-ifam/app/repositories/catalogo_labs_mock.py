"""Dados de apoio do Modulo 2 que NAO pertencem ao RF-LAB05.

=============================================================================
FRONTEIRA DE INTEGRACAO (diretriz de mock do projeto)
=============================================================================
O painel de aprovacoes (RF-LAB05) precisa exibir, para cada pedido, a sala,
o slot de horario e o docente solicitante. Essas tres entidades sao entregas
de outras equipes:

  * `laboratorios`      -> RF-LAB01 (Equipe 12)
  * `grades_horarios`   -> RF-LAB03 (Equipe 14)
  * `usuarios`          -> RF-CORE05 (Equipe 3)

Enquanto elas nao existem, este modulo semeia os registros em memoria e expoe
tres funcoes de consulta (`obter_laboratorio`, `obter_grade`, `obter_docente`).
O repositorio de alocacoes so conhece essas funcoes - nunca os dicionarios.

O que muda na integracao:
  * `obter_laboratorio` / `obter_grade` passam a fazer `session.get(...)`;
    os modelos ORM devolvidos JA sao os definitivos (`app/models/laboratorios.py`).
  * `obter_docente` passa a devolver o `Usuario` real. `DocenteMock` existe
    apenas porque `app/models/usuarios.py` ainda esta vazio e possui os mesmos
    nomes de campo do DDL (`docs/seq_05_database_schema.md`, secao 2.1), de
    modo que a troca nao afeta schemas nem routers.
=============================================================================
"""

import uuid
from dataclasses import dataclass
from datetime import datetime, time, timezone

from app.models.laboratorios import (
    GradeHorario,
    Laboratorio,
    StatusLaboratorio,
    TurnoAlocacao,
)

# ---------------------------------------------------------------------------
# Docentes / usuarios (RF-CORE05 - Equipe 3)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class DocenteMock:
    """Recorte de `usuarios` usado pelo painel de aprovacoes.

    Mesmos nomes de coluna do DDL para que a substituicao pelo modelo
    `Usuario` seja transparente.
    """

    id_usuario: uuid.UUID
    nome_completo: str
    email: str
    identificacao_institucional: str
    perfil: str = "Solicitante"


ID_DOCENTE_ROBERTO = uuid.UUID("b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e")
ID_DOCENTE_CAMILA = uuid.UUID("c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f")
ID_DOCENTE_MARCOS = uuid.UUID("d3e4f5a6-b7c8-4d9e-8f01-2b3c4d5e6f70")
# Administrador do seq_08 (secao 2), tambem docente de uma turma ja aprovada.
ID_DOCENTE_CARLOS = uuid.UUID("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")

_DOCENTES: dict[uuid.UUID, DocenteMock] = {
    ID_DOCENTE_ROBERTO: DocenteMock(
        id_usuario=ID_DOCENTE_ROBERTO,
        nome_completo="Prof. Roberto Dias",
        email="roberto.dias@ifam.edu.br",
        identificacao_institucional="SIAPE 1982341",
    ),
    ID_DOCENTE_CAMILA: DocenteMock(
        id_usuario=ID_DOCENTE_CAMILA,
        nome_completo="Profª. Camila Ribeiro",
        email="camila.ribeiro@ifam.edu.br",
        identificacao_institucional="SIAPE 2451990",
    ),
    ID_DOCENTE_MARCOS: DocenteMock(
        id_usuario=ID_DOCENTE_MARCOS,
        nome_completo="Prof. Marcos Lima",
        email="marcos.lima@ifam.edu.br",
        identificacao_institucional="SIAPE 3120098",
    ),
    ID_DOCENTE_CARLOS: DocenteMock(
        id_usuario=ID_DOCENTE_CARLOS,
        nome_completo="Prof. Carlos Bento",
        email="carlos.bento@ifam.edu.br",
        identificacao_institucional="SIAPE 1975002",
        perfil="Administrador",
    ),
}


# ---------------------------------------------------------------------------
# Laboratorios (RF-LAB01 - Equipe 12)
# UUID do Lab 01 identico ao publicado no contrato (seq_06, secao 3.5).
# ---------------------------------------------------------------------------

ID_LAB_REDES = uuid.UUID("3fa85f64-5717-4562-b3fc-2c963f66afa6")
ID_LAB_SOFTWARE = uuid.UUID("4fa85f64-5717-4562-b3fc-2c963f66afa7")
ID_LAB_GRAFICA = uuid.UUID("5fa85f64-5717-4562-b3fc-2c963f66afa8")

_AGORA_SEED = datetime(2026, 8, 1, 8, 0, 0, tzinfo=timezone.utc)

_LABORATORIOS: dict[uuid.UUID, Laboratorio] = {
    ID_LAB_REDES: Laboratorio(
        id_laboratorio=ID_LAB_REDES,
        nome_laboratorio="Laboratório 01 - Redes e Infraestrutura",
        bloco_predio="Bloco B - Sala 102",
        capacidade_computadores=30,
        sistema_operacional="Dual Boot (Windows 11 / Ubuntu 22.04)",
        especificacao_hardware="Core i5 11400, 16GB RAM, SSD 512GB",
        status_laboratorio=StatusLaboratorio.DISPONIVEL,
        qr_code_porta_hash="QR-LAB-01-PORTA-B102",
        criado_em=_AGORA_SEED,
        atualizado_em=_AGORA_SEED,
    ),
    ID_LAB_SOFTWARE: Laboratorio(
        id_laboratorio=ID_LAB_SOFTWARE,
        nome_laboratorio="Laboratório 02 - Desenvolvimento de Software",
        bloco_predio="Bloco B - Sala 104",
        capacidade_computadores=36,
        sistema_operacional="Linux Ubuntu 24.04",
        especificacao_hardware="Ryzen 5 5600, 16GB RAM, SSD 512GB",
        status_laboratorio=StatusLaboratorio.DISPONIVEL,
        qr_code_porta_hash="QR-LAB-02-PORTA-B104",
        criado_em=_AGORA_SEED,
        atualizado_em=_AGORA_SEED,
    ),
    ID_LAB_GRAFICA: Laboratorio(
        id_laboratorio=ID_LAB_GRAFICA,
        nome_laboratorio="Laboratório 03 - Computação Gráfica & CAD",
        bloco_predio="Bloco C - Sala 04",
        capacidade_computadores=24,
        sistema_operacional="Windows 11 Pro",
        especificacao_hardware="Core i7 12700, 32GB RAM, RTX 3060, SSD 1TB",
        status_laboratorio=StatusLaboratorio.DISPONIVEL,
        qr_code_porta_hash="QR-LAB-03-PORTA-C004",
        criado_em=_AGORA_SEED,
        atualizado_em=_AGORA_SEED,
    ),
}


# ---------------------------------------------------------------------------
# Grade de horarios (RF-LAB03 - Equipe 14)
# UUID do primeiro tempo matutino identico ao contrato (seq_06, secao 3.5).
# ---------------------------------------------------------------------------

ID_GRADE_MAT_1_2 = uuid.UUID("8a9b8c12-3456-7890-abcd-ef1234567891")
ID_GRADE_MAT_3_4 = uuid.UUID("8a9b8c12-3456-7890-abcd-ef1234567892")
ID_GRADE_VES_1_2 = uuid.UUID("8a9b8c12-3456-7890-abcd-ef1234567893")
ID_GRADE_VES_3_4 = uuid.UUID("8a9b8c12-3456-7890-abcd-ef1234567894")
ID_GRADE_NOT_1_2 = uuid.UUID("8a9b8c12-3456-7890-abcd-ef1234567895")

_GRADES: dict[uuid.UUID, GradeHorario] = {
    ID_GRADE_MAT_1_2: GradeHorario(
        id_grade_horario=ID_GRADE_MAT_1_2,
        turno=TurnoAlocacao.MATUTINO,
        descricao_tempo="1º e 2º Tempo (07:30 - 09:10)",
        hora_inicio=time(7, 30),
        hora_fim=time(9, 10),
    ),
    ID_GRADE_MAT_3_4: GradeHorario(
        id_grade_horario=ID_GRADE_MAT_3_4,
        turno=TurnoAlocacao.MATUTINO,
        descricao_tempo="3º e 4º Tempo (09:30 - 11:10)",
        hora_inicio=time(9, 30),
        hora_fim=time(11, 10),
    ),
    ID_GRADE_VES_1_2: GradeHorario(
        id_grade_horario=ID_GRADE_VES_1_2,
        turno=TurnoAlocacao.VESPERTINO,
        descricao_tempo="1º e 2º Tempo (13:30 - 15:10)",
        hora_inicio=time(13, 30),
        hora_fim=time(15, 10),
    ),
    ID_GRADE_VES_3_4: GradeHorario(
        id_grade_horario=ID_GRADE_VES_3_4,
        turno=TurnoAlocacao.VESPERTINO,
        descricao_tempo="3º e 4º Tempo (15:30 - 17:10)",
        hora_inicio=time(15, 30),
        hora_fim=time(17, 10),
    ),
    ID_GRADE_NOT_1_2: GradeHorario(
        id_grade_horario=ID_GRADE_NOT_1_2,
        turno=TurnoAlocacao.NOTURNO,
        descricao_tempo="1º e 2º Tempo (18:30 - 20:10)",
        hora_inicio=time(18, 30),
        hora_fim=time(20, 10),
    ),
}


# ---------------------------------------------------------------------------
# Consultas (unico ponto usado pelo repositorio de alocacoes)
# ---------------------------------------------------------------------------


def obter_laboratorio(id_laboratorio: uuid.UUID) -> Laboratorio | None:
    """TODO(RF-LAB01): trocar por `session.get(Laboratorio, id_laboratorio)`."""
    return _LABORATORIOS.get(id_laboratorio)


def obter_grade(id_grade_horario: uuid.UUID) -> GradeHorario | None:
    """TODO(RF-LAB03): trocar por `session.get(GradeHorario, id_grade_horario)`."""
    return _GRADES.get(id_grade_horario)


def obter_docente(id_usuario: uuid.UUID) -> DocenteMock | None:
    """TODO(RF-CORE05): trocar por `session.get(Usuario, id_usuario)`."""
    return _DOCENTES.get(id_usuario)


def listar_docentes() -> list[DocenteMock]:
    return list(_DOCENTES.values())


def listar_laboratorios() -> list[Laboratorio]:
    return sorted(_LABORATORIOS.values(), key=lambda lab: lab.nome_laboratorio)


def listar_grades() -> list[GradeHorario]:
    return sorted(_GRADES.values(), key=lambda grade: (grade.turno.value, grade.hora_inicio))
