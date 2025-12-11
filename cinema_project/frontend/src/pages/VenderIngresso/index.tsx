// src/pages/VenderIngresso/index.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import type {
  Filme,
  Sala,
  Sessao,
  TipoIngresso,
  IngressoCreate,
  PedidoCreate,
  PedidoLancheItem,
  LancheCombo,
} from '../../models';
import { getSessoes } from '../../services/sessoesService';
import { getFilmes } from '../../services/filmesService';
import { getSalas } from '../../services/salasService';
import {
  createIngresso,
  getIngressosBySessao,
} from '../../services/ingressosService';
import { createPedido } from '../../services/pedidosService';
import { getLanches } from '../../services/lanchesService';

const ingressoSchema = z.object({
  tipo: z.enum(['INTEIRA', 'MEIA']),
});

type IngressoFormData = z.infer<typeof ingressoSchema>;

const PRECO_BASE = 30; // você pode ajustar esse valor

const VenderIngressoPage = () => {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const navigate = useNavigate();

  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [filme, setFilme] = useState<Filme | null>(null);
  const [sala, setSala] = useState<Sala | null>(null);
  const [form, setForm] = useState<IngressoFormData>({ tipo: 'INTEIRA' });
  const [valor, setValor] = useState<number>(PRECO_BASE);
  const [errors, setErrors] = useState<
    Partial<Record<keyof IngressoFormData, string>>
  >({});
  const [ingressos, setIngressos] = useState<number>(0);
  const [lugaresDisponiveis, setLugaresDisponiveis] = useState<number | null>(
    null,
  );

  const [lanches, setLanches] = useState<LancheCombo[]>([]);
  const [lanchesSelecionados, setLanchesSelecionados] = useState<
    { lancheId: string; quantidade: number }[]
  >([]);

  useEffect(() => {
    if (!sessaoId) return;
    void loadDados(sessaoId);
  }, [sessaoId]);

  async function loadDados(id: string) {
    try {
      const [
        todasSessoes,
        filmesData,
        salasData,
        ingressosData,
        lanchesData,
      ] = await Promise.all([
        getSessoes(),
        getFilmes(),
        getSalas(),
        getIngressosBySessao(id),
        getLanches(),
      ]);

      setLanches(lanchesData);

      // encontra a sessão pelo id vindo da rota
      const sessaoData = todasSessoes.find(
        (s) => String((s as any).id) === String(id),
      );

      if (!sessaoData) {
        console.error('Sessão não encontrada para id', id);
        return;
      }

      setSessao(sessaoData);
      setIngressos(ingressosData.length);

      const filmeEncontrado = filmesData.find(
        (f) => String(f.id) === String((sessaoData as any).filmeId),
      );
      const salaEncontrada = salasData.find(
        (s) => String(s.id) === String((sessaoData as any).salaId),
      );

      setFilme(filmeEncontrado ?? null);
      setSala(salaEncontrada ?? null);

      if (salaEncontrada) {
        const livres = salaEncontrada.capacidade - ingressosData.length;
        setLugaresDisponiveis(livres);
      } else {
        setLugaresDisponiveis(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // recalcula valor conforme tipo
  useEffect(() => {
    setValor(form.tipo === 'INTEIRA' ? PRECO_BASE : PRECO_BASE / 2);
  }, [form.tipo]);

  // cálculo do valor de lanches e total do pedido
  const valorLanches = lanchesSelecionados.reduce((acc, itemSel) => {
    const lanche = lanches.find((l) => l.id === itemSel.lancheId);
    if (!lanche) return acc;
    return acc + lanche.valorUnitario * itemSel.quantidade;
  }, 0);

  const valorTotal = valor + valorLanches;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value as TipoIngresso,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sessaoId) return;

    if (lugaresDisponiveis !== null && lugaresDisponiveis <= 0) {
      alert('Não há assentos disponíveis para esta sessão.');
      return;
    }

    const result = ingressoSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof IngressoFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof IngressoFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const payloadIngresso: IngressoCreate = {
      sessaoId: sessaoId,
      tipo: result.data.tipo,
      valor,
    };

    // quantidades para o pedido
    const qtInteira = result.data.tipo === 'INTEIRA' ? 1 : 0;
    const qtMeia = result.data.tipo === 'MEIA' ? 1 : 0;

    // monta itens de lanche do pedido
    const itensLanche: PedidoLancheItem[] = lanchesSelecionados.map((sel) => {
      const lanche = lanches.find((l) => l.id === sel.lancheId);
      if (!lanche) {
        throw new Error('Lanche não encontrado para id ' + sel.lancheId);
      }
      const subtotal = lanche.valorUnitario * sel.quantidade;
      return {
        lancheId: lanche.id,
        nome: lanche.nome,
        quantidade: sel.quantidade,
        subtotal,
      };
    });

    // payload do pedido
    const pedidoPayload: PedidoCreate = {
      sessaoId: sessaoId,
      qtInteira,
      qtMeia,
      lanches: itensLanche,
      valorTotal,
      ingressos: [],
    };

    try {
      // 1) registra o ingresso
      await createIngresso(payloadIngresso);

      // 2) registra o pedido (ingresso + lanches)
      await createPedido(pedidoPayload);

      await loadDados(sessaoId);
      setLanchesSelecionados([]);
      alert('Ingresso vendido com sucesso!');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1>Venda de Ingresso</h1>

      {/* Resumo da sessão (dados estáticos) */}
      <div className="card mb-4">
        <div className="card-header">Informações da Sessão</div>
        <div className="card-body">
          <p>
            <strong>Filme:</strong> {filme?.titulo ?? '—'}
          </p>
          <p>
            <strong>Sala:</strong> {sala ? `Sala ${sala.numero}` : '—'}
          </p>
          <p>
            <strong>Data e Hora:</strong> {sessao?.dataHora ?? '—'}
          </p>
          <p>
            <strong>Capacidade total da sala:</strong>{' '}
            {sala ? sala.capacidade : '—'}
          </p>
          <p>
            <strong>Assentos disponíveis:</strong>{' '}
            {lugaresDisponiveis !== null
              ? Math.max(lugaresDisponiveis, 0)
              : '—'}
          </p>
          <p>
            <strong>Ingressos vendidos nesta sessão:</strong> {ingressos}
          </p>
        </div>
      </div>

      <div className="row">
        {/* Coluna principal: seleção de ingresso e lanches */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">Selecionar ingresso e lanches</div>
            <div className="card-body">
              <form
                id="form-venda"
                onSubmit={handleSubmit}
                className="row g-3"
              >
                <div className="col-md-6">
                  <label className="form-label">Tipo de Ingresso</label>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tipo ? 'is-invalid' : ''
                      }`}
                      type="radio"
                      id="tipoInteira"
                      name="tipo"
                      value="INTEIRA"
                      checked={form.tipo === 'INTEIRA'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="tipoInteira">
                      Inteira
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.tipo ? 'is-invalid' : ''
                      }`}
                      type="radio"
                      id="tipoMeia"
                      name="tipo"
                      value="MEIA"
                      checked={form.tipo === 'MEIA'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="tipoMeia">
                      Meia
                    </label>
                  </div>
                  {errors.tipo && (
                    <div className="invalid-feedback d-block">
                      {errors.tipo}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Valor do ingresso</label>
                  <input
                    className="form-control"
                    value={`R$ ${valor.toFixed(2).replace('.', ',')}`}
                    disabled
                  />
                  <small className="text-muted">
                    Meia-entrada equivale a 50% do valor do ingresso.
                  </small>
                </div>

                <div className="col-12">
                  <h5 className="mt-3">Lanches / Combos</h5>
                </div>

                <div className="col-12">
                  <div className="row">
                    {lanches.map((lanche) => {
                      const itemSel = lanchesSelecionados.find(
                        (i) => i.lancheId === lanche.id,
                      );
                      const quantidade = itemSel?.quantidade ?? 0;

                      return (
                        <div className="col-md-6 col-xl-4 mb-3" key={lanche.id}>
                          <div className="card h-100">
                            <div className="card-body">
                              <h6>{lanche.nome}</h6>
                              <p className="mb-1">{lanche.descricao}</p>
                              <p className="mb-1">
                                Valor: R${' '}
                                {lanche.valorUnitario
                                  .toFixed(2)
                                  .replace('.', ',')}
                              </p>
                              <div className="d-flex align-items-center">
                                <span className="me-2">Qtd:</span>
                                <input
                                  type="number"
                                  min={0}
                                  className="form-control"
                                  style={{ width: '80px' }}
                                  value={quantidade}
                                  onChange={(e) => {
                                    const q = Number(e.target.value);
                                    setLanchesSelecionados((prev) => {
                                      const semEsse = prev.filter(
                                        (i) => i.lancheId !== lanche.id,
                                      );
                                      if (q <= 0) return semEsse;
                                      return [
                                        ...semEsse,
                                        { lancheId: lanche.id, quantidade: q },
                                      ];
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {lanches.length === 0 && (
                      <p className="text-muted">
                        Nenhum lanche/combo cadastrado para venda.
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Coluna lateral: resumo financeiro e ações */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">Resumo do Pedido</div>
            <div className="card-body">
              <p>
                <strong>Valor ingresso desta venda:</strong>{' '}
                R$ {valor.toFixed(2).replace('.', ',')}
              </p>
              <p>
                <strong>Valor lanches selecionados:</strong>{' '}
                R$ {valorLanches.toFixed(2).replace('.', ',')}
              </p>
              <hr />
              <p className="fs-5">
                <strong>Total a pagar:</strong>{' '}
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-muted small mb-2">
                Assentos disponíveis:{' '}
                {lugaresDisponiveis !== null
                  ? Math.max(lugaresDisponiveis, 0)
                  : '—'}
              </p>
              {lugaresDisponiveis !== null && lugaresDisponiveis <= 0 && (
                <p className="text-danger small">
                  Não há assentos disponíveis para esta sessão.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-success w-100 mb-2"
                form="form-venda"
                disabled={
                  lugaresDisponiveis !== null && lugaresDisponiveis <= 0
                }
              >
                Confirmar Venda
              </button>
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => navigate('/sessoes')}
              >
                Voltar para Sessões
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenderIngressoPage;