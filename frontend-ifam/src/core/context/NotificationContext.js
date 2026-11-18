import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createNotificacoesService } from '../../modules/auth/services/notificacoesService';

const NotificationContext = createContext(null);

export function NotificationProvider({ token, apiUrl = process.env.EXPO_PUBLIC_API_URL, fetchImpl, children }) {
  // fetchImpl existe para a demonstracao isolada e para testes. Em producao,
  // o servico continua usando o fetch nativo do dispositivo.
  const service = useMemo(
    () => createNotificacoesService({ token, baseURL: apiUrl, ...(fetchImpl ? { fetchImpl } : {}) }),
    [token, apiUrl, fetchImpl]
  );
  // Respostas antigas não podem expor alertas depois de trocar a conta.
  const [state, setState] = useState({ service, notificacoes: [], carregando: false, erro: null });
  const activeService = useRef(null);
  const requestId = useRef(0);
  const pendingReads = useRef(new Map());
  const current = state.service === service ? state : { notificacoes: [], carregando: false, erro: null };

  const carregarNotificacoes = useCallback(async () => {
    const id = ++requestId.current;
    if (!token) {
      setState({ service, notificacoes: [], carregando: false, erro: null });
      return;
    }
    setState((previous) => ({ service, notificacoes: previous.service === service ? previous.notificacoes : [], carregando: true, erro: null }));
    try {
      const notificacoes = await service.listar();
      if (activeService.current === service && id === requestId.current) {
        setState({ service, notificacoes, carregando: false, erro: null });
      }
    } catch (error) {
      if (activeService.current === service && id === requestId.current) {
        setState((previous) => ({ ...previous, carregando: false, erro: error.message }));
      }
    }
  }, [service, token]);

  useEffect(() => {
    activeService.current = service;
    carregarNotificacoes();
    return () => {
      activeService.current = null;
      requestId.current += 1;
    };
  }, [service, carregarNotificacoes]);

  const marcarComoLida = useCallback(async (id) => {
    if (!token || pendingReads.current.get(id) === service) return;
    pendingReads.current.set(id, service);
    try {
      await service.marcarComoLida(id);
      if (activeService.current !== service) return;
      // Uma listagem iniciada antes do PATCH não deve reverter a leitura.
      requestId.current += 1;
      setState((previous) => ({
        ...previous,
        carregando: false,
        erro: null,
        notificacoes: previous.notificacoes.map((item) => item.id_notificacao === id ? { ...item, status_leitura: true } : item),
      }));
    } catch (error) {
      if (activeService.current === service) setState((previous) => ({ ...previous, erro: error.message }));
    } finally {
      if (pendingReads.current.get(id) === service) pendingReads.current.delete(id);
    }
  }, [service, token]);

  const value = {
    ...current,
    quantidadeNaoLidas: current.notificacoes.filter((item) => !item.status_leitura).length,
    carregarNotificacoes,
    marcarComoLida,
  };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('As telas de notificações e hub devem estar dentro de NotificationProvider.');
  return context;
}
