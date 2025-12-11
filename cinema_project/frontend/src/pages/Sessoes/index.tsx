// src/pages/Sessoes/index.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import type { Filme, Sala, Sessao, SessaoCreate } from '../../models';
import { getFilmes } from '../../services/filmesService';
import { getSalas } from '../../services/salasService';
import {
  getSessoes,
  createSessao,
  updateSessao,
  deleteSessao,
} from '../../services/sessoesService';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

// Regra de negócio do enunciado:
// - Obrigatório selecionar Filme e Sala
// - Data da sessão não pode ser no passado  [oai_citation:1‡Laboratório - React.pdf](sediment://file_0000000074a871f5a3f0b7eb03490536)
const sessaoSchema = z.object({
  filmeId: z
    .string()
    .min(1, 'Selecione um filme'),
  salaId: z
    .string()
    .min(1, 'Selecione uma sala'),
  dataHora: z
    .string()
    .min(1, 'Data e hora são obrigatórias')
    .refine((val) => {
      const data = new Date(val);
      if (Number.isNaN(data.getTime())) return false;
      const agora = new Date();
      return data >= agora; // não retroativa
    }, 'A data da sessão não pode ser no passado'),
});

type SessaoFormData = z.infer<typeof sessaoSchema>;

type SessaoView = Sessao & {
  filmeTitulo: string;
  salaNumero: number | string;
};

const SessoesPage = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [form, setForm] = useState<SessaoFormData>({
    filmeId: '',
    salaId: '',
    dataHora: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SessaoFormData, string>>
  >({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Carregar filmes, salas e sessões ao montar
  useEffect(() => {
    loadFilmes();
    loadSalas();
    loadSessoes();
  }, []);

  async function loadFilmes() {
    try {
      const data = await getFilmes();
      setFilmes(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSalas() {
    try {
      const data = await getSalas();
      setSalas(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSessoes() {
    try {
      const data = await getSessoes();
      setSessoes(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(sessao: Sessao) {
    setForm({
      filmeId: String((sessao as any).filmeId),
      salaId: String((sessao as any).salaId),
      dataHora: sessao.dataHora,
    });
    setEditingId((sessao as any).id as number);
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = sessaoSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SessaoFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SessaoFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const payload: SessaoCreate = {
      filmeId: form.filmeId,
      salaId: form.salaId,
      dataHora: form.dataHora,
      filmeTitulo: undefined
    };

    try {
      if (editingId !== null) {
        await updateSessao(editingId, payload);
      } else {
        await createSessao(payload);
      }
      await loadSessoes();
      setForm({
        filmeId: '',
        salaId: '',
        dataHora: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta sessão?')) return;

    try {
      // aceita id string, compatível com json-server
      await deleteSessao(id as any);
      await loadSessoes();
    } catch (err) {
      console.error(err);
    }
  }

  function handleVenderIngresso(sessaoId: string) {
    navigate(`/vendas/${sessaoId}`);
  }

  // Monta visão cruzando IDs com título do filme e número da sala

  const sessoesView: SessaoView[] = sessoes.map((s) => {
    const filmeIdStr = String((s as any).filmeId);
    const salaIdStr = String((s as any).salaId);

    const filme = filmes.find((f) => String(f.id) === filmeIdStr);
    const sala = salas.find((sa) => String(sa.id) === salaIdStr);

    return {
      ...s,
      filmeTitulo: filme ? filme.titulo : '—',
      salaNumero: sala ? sala.numero : '—',
    };
  });

  return (
    <div>
      <h1 className="mb-4 d-flex align-items-center">
        <i className="bi bi-camera-reels me-2" />
        Sessões
      </h1>

      {/* Formulário de agendamento */}
      <div className="card mb-4">
        <div className="card-header">
          {editingId ? 'Editar Sessão' : 'Agendar Sessão'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Select de Filmes */}
            <div className="col-md-4">
              <label className="form-label">Filme</label>
              <select
                className={`form-select ${
                  errors.filmeId ? 'is-invalid' : ''
                }`}
                name="filmeId"
                value={form.filmeId}
                onChange={handleChange}
              >
                <option value="">Selecione um filme</option>
                {filmes.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.titulo}
                  </option>
                ))}
              </select>
              {errors.filmeId && (
                <div className="invalid-feedback">{errors.filmeId}</div>
              )}
            </div>

            {/* Select de Salas */}
            <div className="col-md-4">
              <label className="form-label">Sala</label>
              <select
                className={`form-select ${errors.salaId ? 'is-invalid' : ''}`}
                name="salaId"
                value={form.salaId}
                onChange={handleChange}
              >
                <option value="">Selecione uma sala</option>
                {salas.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    Sala {s.numero} (cap. {s.capacidade})
                  </option>
                ))}
              </select>
              {errors.salaId && (
                <div className="invalid-feedback">{errors.salaId}</div>
              )}
            </div>

            {/* Data e hora */}
            <div className="col-md-4">
              <Input
                id="dataHora"
                name="dataHora"
                label="Data e Hora"
                type="datetime-local"
                value={form.dataHora}
                onChange={handleChange}
                error={errors.dataHora}
              />
            </div>

            <div className="col-12">
              <Button type="submit" label="Salvar Sessão" variant="primary" />
            </div>
          </form>
        </div>
      </div>

      {/* Listagem de sessões */}
      <h2>Sessões agendadas</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Filme</th>
            <th>Sala</th>
            <th>Data e Hora</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessoesView.map((s) => (
            <tr key={s.id}>
              <td>{s.filmeTitulo}</td>
              <td>{s.salaNumero}</td>
              <td>{s.dataHora}</td>
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
                  className="btn btn-sm btn-success"
                  type="button"
                  onClick={() => handleVenderIngresso(String(s.id))}
                >
                  <i className="bi bi-ticket-perforated me-1" />
                  Vender
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  type="button"
                  onClick={() => handleDelete(String(s.id))}
                >
                  <i className="bi bi-trash me-1" />
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {sessoesView.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhuma sessão cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SessoesPage;