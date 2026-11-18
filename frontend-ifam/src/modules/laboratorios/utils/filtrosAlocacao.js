/**
 * Filtro por tipo de alocação da fila de aprovações (RF-LAB05).
 *
 * Separa o **valor** (o que vai para a API, `tipo_alocacao=Pontual`) do
 * **rótulo** (o que aparece no chip). Para acrescentar um filtro, basta uma
 * linha em `FILTROS_TIPO_ALOCACAO`.
 */

/** Chip "Todos": nenhum filtro enviado à API. */
export const FILTRO_TODOS = 'Todos';

export const FILTROS_TIPO_ALOCACAO = [
  { valor: FILTRO_TODOS, rotulo: 'Todos' },
  { valor: 'Pontual', rotulo: 'Pontual' },
  { valor: 'Semestral', rotulo: 'Semestral' },
];

/**
 * Converte o chip selecionado nos `params` do `GET /alocacoes/pendentes`.
 * O filtro é aplicado pelo servidor, não no array em memória.
 */
export function filtrosParaApi(filtroTipo) {
  return filtroTipo === FILTRO_TODOS ? {} : { tipo_alocacao: filtroTipo };
}
