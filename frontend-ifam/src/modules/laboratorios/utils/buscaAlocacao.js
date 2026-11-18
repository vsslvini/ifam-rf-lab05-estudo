/**
 * Busca textual na fila de aprovações (RF-LAB05).
 *
 * A API ainda não tem `?busca=`, então o filtro é feito **no aparelho**, sobre
 * a lista já carregada — a fila pendente é curta e isso evita uma requisição
 * a cada tecla. Quando o backend ganhar o parâmetro, basta trocar esta função
 * por mais um item em `filtrosParaApi` e o resto da tela continua igual.
 *
 * Regras: ignora caixa e acentos, e cada palavra digitada precisa aparecer em
 * algum campo do pedido ("camila web" acha "Profª. Camila Ribeiro" em
 * "Desenvolvimento Web FullStack").
 */

/** "Profª. Camila" → "profa. camila". NFKD também desmonta ª/º, não só acentos. */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Campos do pedido onde a busca procura. */
export function textoPesquisavel(pedido) {
  return normalizarTexto(
    [
      pedido.laboratorio?.nome,
      pedido.laboratorio?.bloco,
      pedido.docente?.nome,
      pedido.disciplina,
      pedido.curso_turma,
      ...(pedido.softwares_solicitados ?? []),
    ].join(' '),
  );
}

/** Devolve só os pedidos que contêm todas as palavras de `busca`. */
export function filtrarPorBusca(pedidos, busca) {
  const palavras = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return pedidos;

  return pedidos.filter((pedido) => {
    const texto = textoPesquisavel(pedido);
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
