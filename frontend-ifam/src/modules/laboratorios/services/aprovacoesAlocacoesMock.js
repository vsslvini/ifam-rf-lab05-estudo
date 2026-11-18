/**
 * Mock in-memory da fila de aprovações de laboratório (RF-LAB05).
 *
 * Reproduz exatamente o contrato de `/api/v1/laboratorios/alocacoes`
 * (Documentação/docs/seq_06_mapa_backend.md, seções 3.6 e 3.7), incluindo os
 * mesmos nomes de campo, os mesmos UUIDs do back-end e uma latência
 * artificial.
 *
 * Serve como fallback quando a API não está no ar, para que a tela possa ser
 * demonstrada no Expo Snack / apresentação sem depender do back-end — e as
 * regras RN04 e RN05 continuam valendo aqui, senão o mock demonstraria um
 * comportamento que o sistema real não tem.
 */

const LATENCIA_MS = 300;

// Mesmos registros semeados no back-end
// (app/repositories/alocacoes_laboratorios.py).
const SEED = [
  {
    id_alocacao: '999e4567-e89b-12d3-a456-426614174999',
    laboratorio: {
      id_laboratorio: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      nome: 'Laboratório 01 - Redes e Infraestrutura',
      bloco: 'Bloco B - Sala 102',
    },
    docente: {
      id_usuario: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
      nome: 'Prof. Roberto Dias',
      matricula: 'SIAPE 1982341',
    },
    disciplina: 'Segurança de Redes e Firewalls',
    curso_turma: 'TADS 4º Período',
    qtd_alunos_prevista: 28,
    data_reserva: '2026-08-28',
    dia_semana: 'Sexta-feira',
    turno: 'Matutino',
    horario: 'Matutino (07:30 - 09:10)',
    descricao_tempo: '1º e 2º Tempo (07:30 - 09:10)',
    tipo_alocacao: 'Pontual',
    softwares_solicitados: ['Wireshark', 'VirtualBox', 'Putty'],
    status_alocacao: 'Pendente',
    conflito_detectado: false,
    conflitos: [],
    criado_em: '2026-08-25T18:55:00Z',
  },
  {
    id_alocacao: '999e4567-e89b-12d3-a456-426614174998',
    laboratorio: {
      id_laboratorio: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
      nome: 'Laboratório 02 - Desenvolvimento de Software',
      bloco: 'Bloco B - Sala 104',
    },
    docente: {
      id_usuario: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f',
      nome: 'Profª. Camila Ribeiro',
      matricula: 'SIAPE 2451990',
    },
    disciplina: 'Desenvolvimento Web FullStack',
    curso_turma: 'Eng. Software 3º Período',
    qtd_alunos_prevista: 34,
    data_reserva: '2026-08-05',
    dia_semana: 'Quarta-feira',
    turno: 'Vespertino',
    horario: 'Vespertino (15:30 - 17:10)',
    descricao_tempo: '3º e 4º Tempo (15:30 - 17:10)',
    tipo_alocacao: 'Semestral',
    softwares_solicitados: ['VS Code', 'Docker', 'PostgreSQL'],
    status_alocacao: 'Pendente',
    conflito_detectado: false,
    conflitos: [],
    criado_em: '2026-08-25T19:10:00Z',
  },
  {
    id_alocacao: '999e4567-e89b-12d3-a456-426614174997',
    laboratorio: {
      id_laboratorio: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
      nome: 'Laboratório 03 - Computação Gráfica & CAD',
      bloco: 'Bloco C - Sala 04',
    },
    docente: {
      id_usuario: 'd3e4f5a6-b7c8-4d9e-8f01-2b3c4d5e6f70',
      nome: 'Prof. Marcos Lima',
      matricula: 'SIAPE 3120098',
    },
    disciplina: 'Modelagem Tridimensional com Blender',
    curso_turma: 'Design Digital 2º Período',
    qtd_alunos_prevista: 22,
    data_reserva: '2026-08-29',
    dia_semana: 'Sábado',
    turno: 'Noturno',
    horario: 'Noturno (18:30 - 20:10)',
    descricao_tempo: '1º e 2º Tempo (18:30 - 20:10)',
    tipo_alocacao: 'Pontual',
    softwares_solicitados: ['Blender 3D', 'Photoshop'],
    status_alocacao: 'Pendente',
    // RN04: o Lab 03 já está reservado neste dia e horário.
    conflito_detectado: true,
    conflitos: [
      {
        id_alocacao: '999e4567-e89b-12d3-a456-426614174990',
        docente: 'Prof. Carlos Bento',
        disciplina: 'Introdução à Computação Gráfica',
        curso_turma: 'Design Digital 1º Período',
        tipo_alocacao: 'Pontual',
        status_alocacao: 'Aprovada',
        bloqueia_aprovacao: true,
      },
    ],
    criado_em: '2026-08-26T09:05:00Z',
  },
];

let pendentes = SEED.map((item) => ({ ...item }));

const esperar = () => new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));

/** Reproduz o formato de erro da API (`detail` + status HTTP). */
function erroApi(status, detail) {
  const erro = new Error(detail);
  erro.mensagem = detail;
  erro.status = status;
  return erro;
}

export async function listarPendentes({ tipo_alocacao: tipoAlocacao } = {}) {
  await esperar();

  const lista = tipoAlocacao
    ? pendentes.filter((item) => item.tipo_alocacao === tipoAlocacao)
    : pendentes;

  return lista.map((item) => ({ ...item }));
}

export async function listarConflitos(idAlocacao) {
  await esperar();

  const alocacao = pendentes.find((item) => item.id_alocacao === idAlocacao);
  if (!alocacao) {
    throw erroApi(404, 'Alocação não encontrada.');
  }

  return alocacao.conflitos.map((item) => ({ ...item }));
}

/**
 * Aprova ou rejeita, aplicando as mesmas regras do back-end:
 * RN04 (409 se a sala estiver ocupada) e RN05 (422 sem justificativa).
 */
export async function decidir(idAlocacao, { status_alocacao: status, justificativa_rejeicao: justificativa }) {
  await esperar();

  const alocacao = pendentes.find((item) => item.id_alocacao === idAlocacao);
  if (!alocacao) {
    throw erroApi(404, 'Alocação não encontrada.');
  }

  if (status === 'Aprovada') {
    const bloqueio = alocacao.conflitos.find((conflito) => conflito.bloqueia_aprovacao);
    if (bloqueio) {
      throw erroApi(
        409,
        'Conflito de grade (RN04): o laboratório já está reservado para ' +
          `"${bloqueio.disciplina}" (${bloqueio.curso_turma}) neste dia e horário. ` +
          'Rejeite o pedido com justificativa ou peça a alteração do horário.',
      );
    }
  } else if (!justificativa || !justificativa.trim()) {
    throw erroApi(422, 'A justificativa é obrigatória para rejeitar uma alocação (RN05).');
  }

  pendentes = pendentes.filter((item) => item.id_alocacao !== idAlocacao);

  return {
    id_alocacao: idAlocacao,
    status_alocacao: status,
    mensagem:
      status === 'Aprovada'
        ? 'Alocação aprovada. Notificação disparada ao docente.'
        : 'Alocação rejeitada. Justificativa enviada ao docente.',
  };
}

/** Restaura o estado inicial (útil em testes e demonstrações). */
export function reiniciar() {
  pendentes = SEED.map((item) => ({ ...item }));
}
