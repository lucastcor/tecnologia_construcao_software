// src/services/sessoesService.ts
import type { Sessao, SessaoCreate } from '../models';

const API_URL = 'http://localhost:3000';
const RESOURCE = 'sessoes';

export async function getSessoes(): Promise<Sessao[]> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar sessões');
  }
  return resp.json();
}

export async function createSessao(data: SessaoCreate): Promise<Sessao> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar sessão');
  }

  return resp.json();
}

export async function updateSessao(id: number, data: SessaoCreate): Promise<Sessao> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao atualizar sessão');
  }

  return resp.json();
}

export async function deleteSessao(id: number): Promise<void> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    throw new Error('Erro ao excluir sessão');
  }
}

export async function getSessaoById(id: string): Promise<Sessao> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar sessão');
  }
  return resp.json();
}