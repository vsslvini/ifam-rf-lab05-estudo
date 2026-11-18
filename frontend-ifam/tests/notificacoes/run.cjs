const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '../..');
const cache = new Map();
// Transform only the team files. This suite needs neither Expo nor App.js.
// Native hosts are substituted only in tests; no test data enters src/.
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename);
  const code = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, babelrc: false, configFile: false,
    plugins: [
      [require('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
      require('@babel/plugin-transform-modules-commonjs'),
    ],
  }).code;
  const module = { exports: {} };
  const localRequire = (name) => {
    if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.js`));
    if (name === 'react-native') return {
      StyleSheet: { create: (styles) => styles },
      Platform: { select: (styles) => styles.android },
      Text: 'Text', View: 'View', TouchableOpacity: 'TouchableOpacity',
      FlatList: 'FlatList', ActivityIndicator: 'ActivityIndicator', RefreshControl: 'RefreshControl',
      SafeAreaView: 'SafeAreaView', StatusBar: 'StatusBar', ScrollView: 'ScrollView',
    };
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}

const { createNotificacoesService } = load('src/modules/auth/services/notificacoesService.js');
const { NotificationProvider, useNotifications } = load('src/core/context/NotificationContext.js');
const apiUrl = 'https://api.example.test';
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
const notification = { id_notificacao: 'id-1', status_leitura: false, modulo_origem: 'SISTEMA', tipo_evento: 'Sistema', mensagem_corpo: 'Aviso', data_hora_envio: '2026-09-09T12:00:00Z' };
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

test('GET e PATCH usam o contrato publicado e Bearer token', async () => {
  const calls = [];
  const service = createNotificacoesService({ baseURL: `${apiUrl}/`, token: 'test-token', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return response(options.method === 'GET' ? [notification] : { id_notificacao: 'id-1', status_leitura: true });
  } });
  assert.deepEqual(await service.listar(), [notification]);
  await service.marcarComoLida('id-1');
  assert.equal(calls[0].url, `${apiUrl}/api/v1/notificacoes/`);
  assert.equal(calls[1].url, `${apiUrl}/api/v1/notificacoes/id-1/ler`);
  assert.equal(calls[1].options.method, 'PATCH');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
});

test('sem token ou URL não envia requisição', async () => {
  let calls = 0;
  for (const config of [{ baseURL: apiUrl }, { token: 'test-token' }]) {
    const service = createNotificacoesService({ ...config, fetchImpl: async () => { calls += 1; } });
    await assert.rejects(service.listar());
  }
  assert.equal(calls, 0);
});

test('401 é reportado e não é convertido em lista vazia', async () => {
  const service = createNotificacoesService({ baseURL: apiUrl, token: 'test-token', fetchImpl: async () => response({}, 401) });
  await assert.rejects(service.listar(), { status: 401 });
});

test('respostas incompatíveis não confirmam listagem ou leitura', async () => {
  const service = createNotificacoesService({ baseURL: apiUrl, token: 'test-token', fetchImpl: async () => response({ status_leitura: false }) });
  await assert.rejects(service.listar());
  await assert.rejects(service.marcarComoLida('id-1'));
});

test('requisição interrompida por timeout produz erro', async () => {
  const service = createNotificacoesService({ baseURL: apiUrl, token: 'test-token', timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('timeout')));
  }) });
  await assert.rejects(service.listar(), /timeout/);
});

async function mount(token, fetchImpl) {
  const originalFetch = global.fetch;
  global.fetch = fetchImpl;
  let current;
  const Probe = () => { current = useNotifications(); return null; };
  const tree = (value) => React.createElement(NotificationProvider, { token: value, apiUrl }, React.createElement(Probe));
  let renderer;
  await act(async () => { renderer = create(tree(token)); });
  return {
    current: () => current,
    update: async (value) => { await act(async () => { renderer.update(tree(value)); }); },
    cleanup: async () => { await act(async () => renderer.unmount()); global.fetch = originalFetch; },
  };
}

test('provider sem sessão não consulta a API', async () => {
  let calls = 0;
  const mounted = await mount(null, async () => { calls += 1; });
  try { assert.equal(calls, 0); assert.equal(mounted.current().quantidadeNaoLidas, 0); }
  finally { await mounted.cleanup(); }
});

test('contador só muda depois de o PATCH confirmar a leitura', async () => {
  const patch = deferred();
  const mounted = await mount('test-token', async (_, options) => options.method === 'GET' ? response([notification]) : patch.promise);
  try {
    assert.equal(mounted.current().quantidadeNaoLidas, 1);
    let reading;
    await act(async () => { reading = mounted.current().marcarComoLida('id-1'); });
    assert.equal(mounted.current().quantidadeNaoLidas, 1);
    await act(async () => { patch.resolve(response({ id_notificacao: 'id-1', status_leitura: true })); await reading; });
    assert.equal(mounted.current().quantidadeNaoLidas, 0);
  } finally { await mounted.cleanup(); }
});

test('falha no PATCH mantém a notificação não lida e mostra erro', async () => {
  const mounted = await mount('test-token', async (_, options) => options.method === 'GET' ? response([notification]) : response({}, 500));
  try {
    await act(async () => { await mounted.current().marcarComoLida('id-1'); });
    assert.equal(mounted.current().quantidadeNaoLidas, 1);
    assert.ok(mounted.current().erro);
  } finally { await mounted.cleanup(); }
});

test('troca de conta ignora resposta atrasada da sessão anterior', async () => {
  const oldRequest = deferred();
  const mounted = await mount('old-token', async (_, options) => options.headers.Authorization === 'Bearer old-token' ? oldRequest.promise : response([]));
  try {
    await mounted.update('new-token');
    await act(async () => { oldRequest.resolve(response([notification])); await oldRequest.promise; });
    assert.deepEqual(mounted.current().notificacoes, []);
    await mounted.update(null);
    assert.equal(mounted.current().quantidadeNaoLidas, 0);
  } finally { await mounted.cleanup(); }
});

test('tela de notificações compila', async () => {
  load('src/modules/auth/screens/perfil_notificacoes_screen.js');
  load('src/core/hooks/useNotifications.js');
});
