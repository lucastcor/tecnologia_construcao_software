// src/services/lanchesService.ts
import type { LancheCombo, LancheComboCreate } from '../models';

const API_URL = 'http://localhost:3000';
const RESOURCE = 'lanches'; // deve bater com a chave do db.json

export async function getLanches(): Promise<LancheCombo[]> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar lanches');
  }
  return resp.json();
}

export async function createLanche(data: LancheComboCreate): Promise<LancheCombo> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar lanche');
  }

  return resp.json();
}

export async function updateLanche(
  id: string,
  data: LancheComboCreate,
): Promise<LancheCombo> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao atualizar lanche');
  }

  return resp.json();
}

export async function deleteLanche(id: string): Promise<void> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    throw new Error('Erro ao excluir lanche');
  }
}