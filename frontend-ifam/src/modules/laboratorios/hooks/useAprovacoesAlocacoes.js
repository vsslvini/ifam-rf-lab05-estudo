/**
 * Hook de dados da fila de aprovações (RF-LAB05).
 *
 * Concentra **tudo que fala com o service**: carregar a fila, aprovar e
 * rejeitar, mais os estados que acompanham essas chamadas (carregando,
 * atualizando, erro, modo offline, qual card está em processamento) e os
 * dois filtros da fila: o chip de tipo (vai para a API) e a busca por texto
 * (aplicada no aparelho).
 *
 * O que o hook NÃO faz: desenhar nada nem abrir diálogos. Ele devolve dados e
 * funções; a tela decide o que mostrar e os componentes decidem como.
 * Erros de negócio (409 da RN04, 422 da RN05) são relançados para a tela
 * exibir a mensagem que veio do servidor.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  aprovarAlocacao,
  isModoMock,
  listarAlocacoesPendentes,
  rejeitarAlocacao,
} from '../services/laboratoriosService';
import { filtrarPorBusca } from '../utils/buscaAlocacao';
import { FILTRO_TODOS, filtrosParaApi } from '../utils/filtrosAlocacao';

export function useAprovacoesAlocacoes() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState(FILTRO_TODOS);
  const [busca, setBusca] = useState('');

  // O chip vai para a API; a busca por texto é aplicada aqui, sobre a lista
  // carregada (a API ainda não tem `?busca=`). `useMemo` evita refiltrar a
  // cada render que não mudou nem a lista nem o texto.
  const pedidosVisiveis = useMemo(() => filtrarPorBusca(pedidos, busca), [pedidos, busca]);

  // Estados da comunicação com a API
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [modoMock, setModoMock] = useState(false);
  const [idEmProcessamento, setIdEmProcessamento] = useState(null);

  // Número da última requisição de listagem disparada. Se o Administrador
  // trocar de chip duas vezes rápido, a resposta do filtro antigo pode chegar
  // depois da do novo; respostas "velhas" são ignoradas pela comparação.
  const ultimaRequisicao = useRef(0);

  const sincronizarModoMock = () => setModoMock(isModoMock());

  // ------------------------------------------------------------------
  // Carregamento (GET /alocacoes/pendentes). O filtro vai para a API.
  // ------------------------------------------------------------------
  const carregar = useCallback(
    async ({ silencioso = false } = {}) => {
      const numero = ++ultimaRequisicao.current;
      const aindaEhAtual = () => numero === ultimaRequisicao.current;

      if (silencioso) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }
      setErroCarregamento(null);

      try {
        const dados = await listarAlocacoesPendentes(filtrosParaApi(filtroTipo));
        if (!aindaEhAtual()) return;
        setPedidos(dados);
        sincronizarModoMock();
      } catch (erro) {
        if (!aindaEhAtual()) return;
        setErroCarregamento(erro.mensagem ?? 'Não foi possível carregar a fila de aprovações.');
      } finally {
        if (aindaEhAtual()) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    },
    [filtroTipo],
  );

  // Primeira carga e toda vez que o filtro muda (o `useCallback` acima só
  // cria uma nova função quando `filtroTipo` muda).
  useEffect(() => {
    carregar();
  }, [carregar]);

  const removerDaFila = (idAlocacao) => {
    setPedidos((lista) => lista.filter((item) => item.id_alocacao !== idAlocacao));
  };

  // ------------------------------------------------------------------
  // Aprovação (RN04). Em 409 a fila é recarregada: a situação mudou no servidor.
  // ------------------------------------------------------------------
  const aprovar = async (pedido) => {
    setIdEmProcessamento(pedido.id_alocacao);
    try {
      const resultado = await aprovarAlocacao(pedido.id_alocacao);
      removerDaFila(pedido.id_alocacao);
      sincronizarModoMock();
      return resultado;
    } catch (erro) {
      if (erro.status === 409) {
        carregar({ silencioso: true });
      }
      throw erro;
    } finally {
      setIdEmProcessamento(null);
    }
  };

  // ------------------------------------------------------------------
  // Rejeição (RN05). A justificativa já chega validada pelo modal; o 422 do
  // servidor continua sendo a garantia real.
  // ------------------------------------------------------------------
  const rejeitar = async (pedido, justificativa) => {
    const resultado = await rejeitarAlocacao(pedido.id_alocacao, justificativa);
    removerDaFila(pedido.id_alocacao);
    sincronizarModoMock();
    return resultado;
  };

  return {
    // dados
    pedidos, // fila completa do filtro atual (o contador do cabeçalho usa esta)
    pedidosVisiveis, // a fila depois da busca por texto (a lista usa esta)
    filtroTipo,
    busca,
    carregando,
    atualizando,
    erroCarregamento,
    modoMock,
    idEmProcessamento,
    // ações
    setFiltroTipo,
    setBusca,
    recarregar: () => carregar(),
    atualizar: () => carregar({ silencioso: true }),
    aprovar,
    rejeitar,
  };
}
