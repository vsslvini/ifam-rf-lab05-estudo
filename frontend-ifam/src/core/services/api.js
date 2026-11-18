/**
 * Cliente HTTP compartilhado (Axios) da API RESTful do IFAM.
 *
 * Referência: Documentação/docs/seq_04_mapa_frontend.md — `src/core/services/api.js`.
 *
 * A URL base vem de `expo.extra.apiBaseUrl` no app.json. Em dispositivo físico
 * `localhost` não resolve para a máquina de desenvolvimento, então, quando o
 * Metro é acessado por IP (modo LAN), `localhost` é trocado por esse IP.
 * No modo túnel não há IP local conhecido — defina `apiBaseUrl` manualmente.
 */

import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/** IP da máquina que serve o Metro (ex.: "10.14.38.223"), se for um IPv4. */
function ipDoServidorDev() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? host : null;
}

function resolverBaseUrl(url) {
  const ip = ipDoServidorDev();
  return ip ? url.replace(/\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, `//${ip}`) : url;
}

export const API_BASE_URL = resolverBaseUrl(extra.apiBaseUrl ?? 'http://localhost:8000');

/** Quando `true`, os services usam dados mockados e não chamam a API. */
export const USE_MOCK = extra.useMock === true;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
