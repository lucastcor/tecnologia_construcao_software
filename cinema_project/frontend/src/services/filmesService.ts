// src/services/filmesService.ts
import type { Filme, FilmeCreate } from '../models';

const API_URL = 'http://localhost:3000';
const RESOURCE = 'filmes';

export async function getFilmes(): Promise<Filme[]> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar filmes');
  }
  return resp.json();
}

export async function createFilme(data: FilmeCreate): Promise<Filme> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar filme');
  }

  return resp.json();
}

export async function updateFilme(id: number, data: FilmeCreate): Promise<Filme> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao atualizar filme');
  }

  return resp.json();
}

export async function deleteFilme(id: number): Promise<void> {
  const resp = await fetch(`${API_URL}/${RESOURCE}/${id}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    throw new Error('Erro ao excluir filme');
  }
}