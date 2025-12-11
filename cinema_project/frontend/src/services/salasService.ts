// src/services/salasService.ts
import type { Sala, SalaCreate } from '../models';

const API_URL = 'http://localhost:3000';
const RESOURCE = 'salas';

export async function getSalas(): Promise<Sala[]> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar salas');
  }
  return resp.json();
}

export async function createSala(data: SalaCreate): Promise<Sala> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar sala');
  }

  return resp.json();
}

export async function updateSala(id: number, data: SalaCreate): Promise<Sala> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao atualizar sala');
  }

  return resp.json();
}

export async function deleteSala(id: number): Promise<void> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    throw new Error('Erro ao excluir sala');
  }
}