// src/services/ingressosService.ts
import type { Ingresso, IngressoCreate } from '../models';

const API_URL = 'http://localhost:3000';

export async function getIngressosBySessao(sessaoId: string): Promise<Ingresso[]> {
  const resp = await fetch(`${API_URL}/ingressos?sessaoId=${sessaoId}`);
  if (!resp.ok) {
    throw new Error('Erro ao buscar ingressos da sessão');
  }
  return resp.json();
}

export async function createIngresso(data: IngressoCreate): Promise<Ingresso> {
  const resp = await fetch(`${API_URL}/ingressos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar ingresso');
  }

  return resp.json();
}