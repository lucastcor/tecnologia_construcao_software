// src/pages/Salas/index.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { z } from 'zod';

import type { Sala, SalaCreate } from '../../models';
import {
  getSalas,
  createSala,
  updateSala,
  deleteSala,
} from '../../services/salasService';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Schema de validação do formulário de salas
const salaSchema = z.object({
  numero: z
    .coerce
    .number() // removemos o objeto com invalid_type_error
    .int()
    .positive('Número deve ser maior que zero'),
  capacidade: z
    .coerce
    .number() // idem aqui
    .int()
    .positive('Capacidade deve ser maior que zero'),
});

type SalaFormData = {
  numero: string;
  capacidade: string;
};

const SalasPage = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [form, setForm] = useState<SalaFormData>({
    numero: '',
    capacidade: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SalaFormData, string>>
  >({});
  const [editingId, setEditingId] = useState<number | null>(null);

  // Carrega salas ao montar o componente
  useEffect(() => {
    loadSalas();
  }, []);

  async function loadSalas() {
    try {
      const data = await getSalas();
      setSalas(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(sala: Sala) {
    setForm({
      numero: String(sala.numero),
      capacidade: String(sala.capacidade),
    });
    setEditingId(sala.id);
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // valida com Zod, convertendo strings para número
    const result = salaSchema.safeParse({
      numero: form.numero,
      capacidade: form.capacidade,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SalaFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SalaFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const payload: SalaCreate = {
      numero: result.data.numero,
      capacidade: result.data.capacidade,
    };

    try {
      if (editingId !== null) {
        // atualização
        await updateSala(editingId, payload);
      } else {
        // criação
        await createSala(payload);
      }

      await loadSalas();
      // limpa formulário e sai do modo edição
      setForm({
        numero: '',
        capacidade: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deseja realmente excluir esta sala?')) return;

    try {
      await deleteSala(id);
      await loadSalas();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1 className="mb-4 d-flex align-items-center">
        <i className="bi bi-door-open me-2" />
        Salas
      </h1>

      {/* Formulário de cadastro de salas */}
      <div className="card mb-4">
        <div className="card-header">
          {editingId ? 'Editar Sala' : 'Cadastrar Sala'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <Input
                id="numero"
                name="numero"
                label="Número da Sala"
                type="number"
                value={form.numero}
                onChange={handleChange}
                error={errors.numero}
              />
            </div>

            <div className="col-md-6">
              <Input
                id="capacidade"
                name="capacidade"
                label="Capacidade"
                type="number"
                value={form.capacidade}
                onChange={handleChange}
                error={errors.capacidade}
              />
            </div>

            <div className="col-12">
              <Button type="submit" label="Salvar" variant="primary" />
            </div>
          </form>
        </div>
      </div>

      {/* Tabela de salas cadastradas */}
      <h2>Salas cadastradas</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Número</th>
            <th>Capacidade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {salas.map((s) => (
            <tr key={s.id}>
              <td>{s.numero}</td>
              <td>{s.capacidade}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  type="button"
                  onClick={() => handleEdit(s)}
                >
                  <i className="bi bi-pencil-square me-1" />
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  type="button"
                  onClick={() => handleDelete(s.id)}
                >
                  <i className="bi bi-trash me-1" />
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {salas.length === 0 && (
            <tr>
              <td colSpan={3}>Nenhuma sala cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalasPage;