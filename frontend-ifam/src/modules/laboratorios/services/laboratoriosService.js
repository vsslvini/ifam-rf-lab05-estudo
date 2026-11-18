/**
 * Service do Módulo 2 — Alocação e Gestão de Laboratórios de Informática.
 *
 * Referência: Documentação/docs/seq_04_mapa_frontend.md
 *             — `src/modules/laboratorios/services/laboratoriosService.js`.
 *
 * Escopo atual: RF-LAB05 (aprovação de alocações e detecção de conflitos).
 * TODO(RF-LAB01/02/03/04/06/07/08): catálogo de labs, softwares, grade,
 * solicitação, check-in na porta, checklist de fechamento e dashboard entram
 * neste mesmo arquivo, conforme as outras duplas entregarem.
 *
 * -------------------------------------------------------------------------
 * FALLBACK OFFLINE
 * -------------------------------------------------------------------------
 * As funções chamam a API real. Se `useMock` estiver ligado no app.json ou se
 * a API não responder (erro de rede), caem automaticamente no mock in-memory
 * com o mesmo contrato — assim a tela nunca quebra em uma demonstração.
 * O modo em uso é exposto por `isModoMock()`.
 * -------------------------------------------------------------------------
 */

import api, { USE_MOCK } from '../../../core/services/api';
import { isErroDeRede } from '../../../core/services/interceptors';
import * as mock from './aprovacoesAlocacoesMock';

const ROTA_ALOCACOES = '/api/v1/laboratorios/alocacoes';

// Fica `true` depois que uma chamada falhar por rede, para as ações
// seguintes já irem direto ao mock dentro da mesma sessão.
let usandoMock = USE_MOCK;

/** Indica se os dados exibidos vêm do mock (API indisponível ou desligada). */
export function isModoMock() {
  return usandoMock;
}

/**
 * Executa a chamada real e, em caso de falha de conectividade, repete no mock.
 * Erros de negócio da API (404, 409, 422) são propagados normalmente.
 */
async function comFallback(chamadaApi, chamadaMock) {
  if (usandoMock) {
    return chamadaMock();
  }

  try {
    return await chamadaApi();
  } catch (erro) {
    if (isErroDeRede(erro)) {
      usandoMock = true;
      return chamadaMock();
    }
    throw erro;
  }
}

/**
 * Fila de pedidos de alocação aguardando análise do Administrador.
 *
 * Cada item já vem com `conflito_detectado` e a lista `conflitos` resolvidos
 * pela API (RN04) — a tela não recalcula nada.
 *
 * @param {{tipo_alocacao?: 'Pontual'|'Semestral', id_laboratorio?: string}} filtros
 */
export async function listarAlocacoesPendentes(filtros = {}) {
  return comFallback(
    async () => {
      const { data } = await api.get(`${ROTA_ALOCACOES}/pendentes`, { params: filtros });
      return data;
    },
    () => mock.listarPendentes(filtros),
  );
}

/** Detalha com quem o horário de um pedido colide (RN04). */
export async function listarConflitosDaAlocacao(idAlocacao) {
  return comFallback(
    async () => {
      const { data } = await api.get(`${ROTA_ALOCACOES}/${idAlocacao}/conflitos`);
      return data;
    },
    () => mock.listarConflitos(idAlocacao),
  );
}

/**
 * Aprova uma alocação.
 *
 * Responde 409 quando a sala já está ocupada no mesmo dia e horário (RN04) —
 * a tela mostra o motivo devolvido pela API.
 */
export async function aprovarAlocacao(idAlocacao) {
  const corpo = { status_alocacao: 'Aprovada', justificativa_rejeicao: null };

  return comFallback(
    async () => {
      const { data } = await api.patch(`${ROTA_ALOCACOES}/${idAlocacao}/status`, corpo);
      return data;
    },
    () => mock.decidir(idAlocacao, corpo),
  );
}

/**
 * Rejeita uma alocação com justificativa.
 *
 * A justificativa é obrigatória (RN05): a API responde 422 sem ela. A tela
 * valida antes de enviar, mas a regra vale de verdade no servidor.
 */
export async function rejeitarAlocacao(idAlocacao, justificativa) {
  const corpo = {
    status_alocacao: 'Rejeitada',
    justificativa_rejeicao: justificativa,
  };

  return comFallback(
    async () => {
      const { data } = await api.patch(`${ROTA_ALOCACOES}/${idAlocacao}/status`, corpo);
      return data;
    },
    () => mock.decidir(idAlocacao, corpo),
  );
}
