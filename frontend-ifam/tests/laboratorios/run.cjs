/**
 * Testes dos módulos puros do RF-LAB05 (Equipe 16).
 *
 *   node tests/laboratorios/run.cjs
 *
 * Cobre o que não depende de React nem de React Native: os formatadores, o
 * filtro enviado à API, a busca por texto e as regras RN04/RN05 do mock. Usa só o `node:test`
 * e o Babel que o Expo já instala — nenhuma dependência extra.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

const raiz = path.resolve(__dirname, '../..');

/** Carrega um módulo ES de `src/` como CommonJS, sem Expo nem Metro. */
function carregar(relativo) {
  const arquivo = path.resolve(raiz, relativo);
  const { code } = babel.transformSync(fs.readFileSync(arquivo, 'utf8'), {
    filename: arquivo,
    babelrc: false,
    configFile: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  });
  const modulo = { exports: {} };
  new Function('require', 'module', 'exports', code)(require, modulo, modulo.exports);
  return modulo.exports;
}

const formatters = carregar('src/modules/laboratorios/utils/alocacaoFormatters.js');
const filtros = carregar('src/modules/laboratorios/utils/filtrosAlocacao.js');
const busca = carregar('src/modules/laboratorios/utils/buscaAlocacao.js');
const mock = carregar('src/modules/laboratorios/services/aprovacoesAlocacoesMock.js');

const ID_REDES = '999e4567-e89b-12d3-a456-426614174999';
const ID_BLENDER = '999e4567-e89b-12d3-a456-426614174997';

// ---------------------------------------------------------------------------
// alocacaoFormatters
// ---------------------------------------------------------------------------

test('formatarData converte DATE do banco para dd/mm/aaaa sem passar por Date', () => {
  assert.equal(formatters.formatarData('2026-08-28'), '28/08/2026');
  assert.equal(formatters.formatarData(null), '');
});

test('descreverRecorrenciaSemanal flexiona os dois termos do dia composto', () => {
  assert.equal(formatters.descreverRecorrenciaSemanal('Quarta-feira'), 'Todas as Quartas-feiras');
  assert.equal(formatters.descreverRecorrenciaSemanal('Sábado'), 'Todos os Sábados');
  assert.equal(formatters.descreverRecorrenciaSemanal(''), '');
});

test('descreverAgenda mostra data em Pontual e dia da semana em Semestral', () => {
  const pontual = { tipo_alocacao: 'Pontual', data_reserva: '2026-08-28', dia_semana: 'Sexta-feira' };
  const semestral = { tipo_alocacao: 'Semestral', data_reserva: '2026-08-05', dia_semana: 'Quarta-feira' };

  assert.equal(formatters.descreverAgenda(pontual), '28/08/2026 • Sexta-feira');
  assert.equal(
    formatters.descreverAgenda(semestral),
    'Todas as Quartas-feiras (a partir de 05/08/2026)',
  );
});

test('listarBloqueios devolve só os conflitos que impedem a aprovação', () => {
  const pedido = {
    conflitos: [
      { id_alocacao: 'a', bloqueia_aprovacao: true },
      { id_alocacao: 'b', bloqueia_aprovacao: false },
    ],
  };
  assert.deepEqual(formatters.listarBloqueios(pedido).map((c) => c.id_alocacao), ['a']);
  assert.deepEqual(formatters.listarBloqueios({}), []);
});

test('descreverConfirmacaoAprovacao resume laboratório, docente e horário', () => {
  const pedido = {
    laboratorio: { nome: 'Lab 01' },
    docente: { nome: 'Prof. Roberto' },
    tipo_alocacao: 'Pontual',
    data_reserva: '2026-08-28',
    dia_semana: 'Sexta-feira',
    descricao_tempo: '1º e 2º Tempo',
  };
  assert.equal(
    formatters.descreverConfirmacaoAprovacao(pedido),
    'Aprovar a alocação do Lab 01 para Prof. Roberto em 28/08/2026 • Sexta-feira (1º e 2º Tempo)?',
  );
});

// ---------------------------------------------------------------------------
// filtrosAlocacao
// ---------------------------------------------------------------------------

test('filtrosParaApi não envia filtro em "Todos" e envia tipo_alocacao nos demais', () => {
  assert.deepEqual(filtros.filtrosParaApi(filtros.FILTRO_TODOS), {});
  assert.deepEqual(filtros.filtrosParaApi('Pontual'), { tipo_alocacao: 'Pontual' });
  assert.equal(filtros.FILTROS_TIPO_ALOCACAO[0].valor, filtros.FILTRO_TODOS);
});

// ---------------------------------------------------------------------------
// aprovacoesAlocacoesMock — as mesmas regras da API
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Busca por texto (aplicada no aparelho)
// ---------------------------------------------------------------------------

const FILA_BUSCA = [
  {
    id_alocacao: 'a',
    laboratorio: { nome: 'Laboratório 01 - Redes', bloco: 'Bloco B - Sala 102' },
    docente: { nome: 'Prof. Roberto Dias' },
    disciplina: 'Segurança de Redes',
    curso_turma: 'TADS 4º Período',
    softwares_solicitados: ['Wireshark'],
  },
  {
    id_alocacao: 'b',
    laboratorio: { nome: 'Laboratório 02 - Desenvolvimento', bloco: 'Bloco B - Sala 104' },
    docente: { nome: 'Profª. Camila Ribeiro' },
    disciplina: 'Desenvolvimento Web FullStack',
    curso_turma: 'Eng. Software 3º Período',
    softwares_solicitados: ['VS Code', 'Docker'],
  },
];

const ids = (lista) => lista.map((item) => item.id_alocacao);

test('normalizarTexto ignora caixa, acentos e espaços nas pontas', () => {
  assert.equal(busca.normalizarTexto('  Profª. CAMILA Ribeiro '), 'profa. camila ribeiro');
  assert.equal(busca.normalizarTexto(undefined), '');
});

test('filtrarPorBusca devolve a lista inteira quando a busca está vazia', () => {
  assert.equal(busca.filtrarPorBusca(FILA_BUSCA, ''), FILA_BUSCA);
  assert.equal(busca.filtrarPorBusca(FILA_BUSCA, '   '), FILA_BUSCA);
});

test('filtrarPorBusca procura em docente, disciplina, laboratório, turma e softwares', () => {
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'camila')), ['b']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'seguranca')), ['a']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'sala 104')), ['b']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'tads')), ['a']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'docker')), ['b']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'bloco b')), ['a', 'b']);
});

test('filtrarPorBusca exige todas as palavras, em qualquer campo', () => {
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'camila web')), ['b']);
  assert.deepEqual(ids(busca.filtrarPorBusca(FILA_BUSCA, 'camila redes')), []);
});

test('mock: a fila inicial tem três pedidos e filtra por tipo no "servidor"', async () => {
  mock.reiniciar();
  assert.equal((await mock.listarPendentes()).length, 3);
  assert.equal((await mock.listarPendentes({ tipo_alocacao: 'Semestral' })).length, 1);
});

test('mock: RN04 — aprovar pedido em conflito bloqueante responde 409', async () => {
  mock.reiniciar();
  await assert.rejects(
    mock.decidir(ID_BLENDER, { status_alocacao: 'Aprovada', justificativa_rejeicao: null }),
    (erro) => erro.status === 409 && /RN04/.test(erro.mensagem),
  );
  assert.equal((await mock.listarPendentes()).length, 3, 'o pedido continua na fila');
});

test('mock: RN05 — rejeitar sem justificativa responde 422', async () => {
  mock.reiniciar();
  await assert.rejects(
    mock.decidir(ID_REDES, { status_alocacao: 'Rejeitada', justificativa_rejeicao: '   ' }),
    (erro) => erro.status === 422,
  );
});

test('mock: aprovar sem conflito remove da fila e devolve a mensagem da API', async () => {
  mock.reiniciar();
  const resultado = await mock.decidir(ID_REDES, {
    status_alocacao: 'Aprovada',
    justificativa_rejeicao: null,
  });
  assert.equal(resultado.status_alocacao, 'Aprovada');
  assert.match(resultado.mensagem, /Notificação disparada/);
  assert.equal((await mock.listarPendentes()).length, 2);
});

test('mock: id desconhecido responde 404', async () => {
  mock.reiniciar();
  await assert.rejects(mock.listarConflitos('nao-existe'), (erro) => erro.status === 404);
});
