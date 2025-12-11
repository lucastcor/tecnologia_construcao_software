// src/models/index.ts

import type { ReactNode } from "react";

export interface Filme {
  id: number;
  titulo: string;
  sinopse: string;
  classificacao: string;
  duracao: number;             // em minutos
  genero: string;
  dataInicioExibicao: string;  // yyyy-mm-dd
  dataFinalExibicao: string;   // yyyy-mm-dd
}

// Tipo usado para criação (sem id, pq o json-server gera)
export type FilmeCreate = Omit<Filme, 'id'>;

export interface Sala {
  id: number;
  numero: number;
  capacidade: number;
}

// >>> ADICIONE ESTA LINHA <<<
export type SalaCreate = Omit<Sala, 'id'>;

export interface Sessao {
  filmeTitulo: ReactNode;
  id: string;
  filmeId: string;
  salaId: string;
  dataHora: string;
}

export type SessaoCreate = Omit<Sessao, 'id'>;

export type TipoIngresso = 'INTEIRA' | 'MEIA';

export interface Ingresso {
  id: string;
  sessaoId: string;
  tipo: TipoIngresso;
  valor: number;
}


export type IngressoCreate = Omit<Ingresso, 'id'>;

// -------------------------------------------
// Lanche / Combo
// -------------------------------------------

export interface LancheCombo {
  id: string;
  nome: string;
  descricao: string;      // <-- ESTE CAMPO PRECISA EXISTIR
  valorUnitario: number;
  qtUnidade: number;
  subtotal: number;
}

export type LancheComboCreate = Omit<LancheCombo, 'id'>;

// Itens de lanche dentro de um pedido (pode repetir combo com quantidades)
export interface PedidoLancheItem {
  lancheId: string;
  nome: string;
  quantidade: number;
  subtotal: number; // quantidade * valorUnitario
}

export interface Pedido {
  id: string;
  sessaoId: string;           // para qual sessão é o pedido
  ingressos: Ingresso[];      // ingressos vendidos nessa operação
  lanches: PedidoLancheItem[];// combos selecionados
  qtInteira: number;
  qtMeia: number;
  valorTotal: number;
}

export type PedidoCreate = Omit<Pedido, 'id'>;
