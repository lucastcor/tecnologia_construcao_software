// src/pages/Lanches/index.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { z } from 'zod';
import type { LancheCombo, LancheComboCreate } from '../../models';
import { getLanches, createLanche, deleteLanche, updateLanche } from '../../services/lanchesService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

// schema de validação
const lancheSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valorUnitario: z
    .coerce
    .number()
    .positive('Valor deve ser maior que zero'),
  qtUnidade: z
    .coerce
    .number()
    .int()
    .positive('Quantidade deve ser maior que zero'),
});

type LancheFormData = {
  nome: string;
  descricao: string;
  valorUnitario: string;
  qtUnidade: string;
};

const LanchesPage = () => {
  const [lanches, setLanches] = useState<LancheCombo[]>([]);
  const [form, setForm] = useState<LancheFormData>({
    nome: '',
    descricao: '',
    valorUnitario: '',
    qtUnidade: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LancheFormData, string>>>(
    {},
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadLanches();
  }, []);

  async function loadLanches() {
    try {
      const data = await getLanches();
      setLanches(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(lanche: LancheCombo) {
    setForm({
      nome: lanche.nome,
      descricao: lanche.descricao,
      valorUnitario: String(lanche.valorUnitario),
      qtUnidade: String(lanche.qtUnidade),
    });
    setEditingId(String(lanche.id));
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // valida e converte com zod
    const result = lancheSchema.safeParse({
      nome: form.nome,
      descricao: form.descricao,
      valorUnitario: form.valorUnitario,
      qtUnidade: form.qtUnidade,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LancheFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LancheFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const { nome, descricao, valorUnitario, qtUnidade } = result.data;
    const subtotal = valorUnitario * qtUnidade;

    const payload: LancheComboCreate = {
      nome,
      descricao,
      valorUnitario,
      qtUnidade,
      subtotal,
    };

    try {
      if (editingId !== null) {
        await updateLanche(editingId, payload);
      } else {
        await createLanche(payload);
      }

      await loadLanches();
      setForm({
        nome: '',
        descricao: '',
        valorUnitario: '',
        qtUnidade: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este lanche?')) return;
    try {
      await deleteLanche(id);
      await loadLanches();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1 className="mb-4 d-flex align-items-center">
        <i className="bi bi-cup-straw me-2" />
        Lanches / Combos
      </h1>

      {/* Formulário */}
      <div className="card mb-4">
        <div className="card-header">
          {editingId ? 'Editar Lanche / Combo' : 'Cadastrar Lanche / Combo'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <Input
                id="nome"
                name="nome"
                label="Nome"
                value={form.nome}
                onChange={handleChange}
                error={errors.nome}
              />
            </div>

            <div className="col-md-6">
              <Input
                id="descricao"
                name="descricao"
                label="Descrição"
                value={form.descricao}
                onChange={handleChange}
                error={errors.descricao}
              />
            </div>

            <div className="col-md-3">
              <Input
                id="valorUnitario"
                name="valorUnitario"
                label="Valor unitário (R$)"
                type="number"
                value={form.valorUnitario}
                onChange={handleChange}
                error={errors.valorUnitario}
              />
            </div>

            <div className="col-md-3">
              <Input
                id="qtUnidade"
                name="qtUnidade"
                label="Qtd. por combo"
                type="number"
                value={form.qtUnidade}
                onChange={handleChange}
                error={errors.qtUnidade}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <Button type="submit" label="Salvar" variant="primary" />
            </div>
          </form>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="card-header">Lanches cadastrados</div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Valor unitário</th>
                <th>Qtd. por combo</th>
                <th>Subtotal</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lanches.map(l => (
                <tr key={l.id}>
                  <td>{l.nome}</td>
                  <td>{l.descricao}</td>
                  <td>R$ {l.valorUnitario.toFixed(2).replace('.', ',')}</td>
                  <td>{l.qtUnidade}</td>
                  <td>R$ {l.subtotal.toFixed(2).replace('.', ',')}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => handleEdit(l)}
                    >
                      <i className="bi bi-pencil-square me-1" />
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => handleDelete(String(l.id))}
                    >
                      <i className="bi bi-trash me-1" />
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {lanches.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-3">
                    Nenhum lanche cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LanchesPage;