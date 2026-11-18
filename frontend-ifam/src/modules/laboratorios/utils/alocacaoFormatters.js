/**
 * Formatadores de texto da alocação de laboratório (RF-LAB05).
 *
 * Funções puras: recebem o item como a API devolve (campos em `snake_case`) e
 * devolvem o texto que a tela mostra. Não dependem de React nem de estado —
 * por isso ficam fora dos componentes e podem ser testadas direto no Node
 * (`tests/laboratorios/run.cjs`).
 */

/** `2026-08-28` (DATE do banco) -> `28/08/2026`. */
export function formatarData(dataIso) {
  if (!dataIso) return '';
  // Fatiar o texto evita o problema de fuso de `new Date('2026-08-28')`,
  // que em Manaus (UTC-4) viraria 27/08 às 20h.
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * `Quarta-feira` -> `Todas as Quartas-feiras`; `Sábado` -> `Todos os Sábados`.
 * Em português os dois termos do composto vão para o plural.
 */
export function descreverRecorrenciaSemanal(diaSemana) {
  if (!diaSemana) return '';
  if (diaSemana.includes('-feira')) {
    return `Todas as ${diaSemana.replace('-feira', 's-feiras')}`;
  }
  return `Todos os ${diaSemana}s`;
}

/**
 * Linha de agenda do card e da confirmação de aprovação.
 *
 * Uma alocação semestral se repete toda semana (no DDL, `data_reserva` guarda
 * o início do semestre), por isso mostra o dia da semana em vez de uma data
 * única — a mesma leitura que o back-end usa na RN04.
 */
export function descreverAgenda(item) {
  if (item.tipo_alocacao === 'Semestral') {
    return `${descreverRecorrenciaSemanal(item.dia_semana)} (a partir de ${formatarData(item.data_reserva)})`;
  }
  return `${formatarData(item.data_reserva)} • ${item.dia_semana}`;
}

/** Texto da caixa de confirmação antes de aprovar. */
export function descreverConfirmacaoAprovacao(pedido) {
  return (
    `Aprovar a alocação do ${pedido.laboratorio.nome} para ${pedido.docente.nome} ` +
    `em ${descreverAgenda(pedido)} (${pedido.descricao_tempo})?`
  );
}

/** Conflitos que efetivamente impedem a aprovação (RN04). */
export function listarBloqueios(pedido) {
  return (pedido.conflitos ?? []).filter((conflito) => conflito.bloqueia_aprovacao);
}
