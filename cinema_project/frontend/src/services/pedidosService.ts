// src/services/pedidosService.ts
import type { Pedido, PedidoCreate } from '../models';

const API_URL = 'http://localhost:3000';
const RESOURCE = 'pedidos';

export async function createPedido(data: PedidoCreate): Promise<Pedido> {
  const resp = await fetch(`${API_URL}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error('Erro ao criar pedido');
  }

  return resp.json();
}