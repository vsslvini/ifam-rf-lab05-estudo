// Contrato: docs/seq_06_mapa_backend.md, endpoints 1.9 e 1.10.
// A URL aponta para a raiz da API; os caminhos já incluem /api/v1.
export function createNotificacoesService({ baseURL, token, fetchImpl = fetch, timeoutMs = 10000 }) {
  async function request(path, method = 'GET') {
    if (!token) throw new Error('Entre na sua conta para consultar os alertas.');
    if (!baseURL) throw new Error('O serviço de notificações está indisponível.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${baseURL.replace(/\/+$/, '')}/api/v1/notificacoes${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        const error = new Error(response.status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : 'Não foi possível atualizar suas notificações.');
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async listar() {
      const data = await request('/');
      if (!Array.isArray(data)) throw new Error('Resposta inválida do serviço de notificações.');
      return data;
    },
    async marcarComoLida(id) {
      const data = await request(`/${encodeURIComponent(id)}/ler`, 'PATCH');
      if (data.id_notificacao !== id || data.status_leitura !== true) {
        throw new Error('O serviço não confirmou a leitura da notificação.');
      }
      return data;
    },
  };
}
