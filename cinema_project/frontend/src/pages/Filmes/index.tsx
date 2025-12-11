// src/pages/Filmes/index.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { z } from 'zod';

import type { Filme, FilmeCreate } from '../../models';
import {
  getFilmes,
  createFilme,
  updateFilme,
  deleteFilme,
} from '../../services/filmesService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

// schema de validação do formulário
const filmeSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  sinopse: z.string().min(10, 'Sinopse deve ter pelo menos 10 caracteres'),
  classificacao: z.string().min(1, 'Classificação é obrigatória'),
  duracao: z
    .coerce
    .number()
    .int()
    .positive('Duração deve ser maior que zero'),
  genero: z.string().min(1, 'Gênero é obrigatório'),
  dataInicioExibicao: z.string().min(1, 'Data inicial obrigatória'),
  dataFinalExibicao: z.string().min(1, 'Data final obrigatória'),
});

type FilmeFormData = {
  titulo: string;
  sinopse: string;
  classificacao: string;
  duracao: string;
  genero: string;
  dataInicioExibicao: string;
  dataFinalExibicao: string;
};

const FilmesPage = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [form, setForm] = useState<FilmeFormData>({
    titulo: '',
    sinopse: '',
    classificacao: '',
    duracao: '',
    genero: '',
    dataInicioExibicao: '',
    dataFinalExibicao: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FilmeFormData, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // carregar lista de filmes na montagem
  useEffect(() => {
    loadFilmes();
  }, []);

  async function loadFilmes() {
    try {
      const data = await getFilmes();
      setFilmes(data);
    } catch (err) {
      console.error(err);
      // em projeto real: toast / alert
    }
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleToggleSelectAll() {
    setSelectedIds((prev) => {
      if (filmes.length === 0) return [];
      const allIds = filmes.map((f) => f.id);
      const allSelected = allIds.every((id) => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Deseja realmente excluir ${selectedIds.length} filme(s) selecionado(s)?`,
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((id) => deleteFilme(id)));
      await loadFilmes();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAll() {
    if (filmes.length === 0) return;
    if (
      !confirm(
        `Deseja realmente excluir TODOS os ${filmes.length} filme(s) cadastrados?`,
      )
    ) {
      return;
    }

    try {
      await Promise.all(filmes.map((f) => deleteFilme(f.id)));
      await loadFilmes();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit(filme: Filme) {
    setForm({
      titulo: filme.titulo,
      sinopse: filme.sinopse,
      classificacao: filme.classificacao,
      duracao: String(filme.duracao),
      genero: filme.genero,
      dataInicioExibicao: filme.dataInicioExibicao,
      dataFinalExibicao: filme.dataFinalExibicao,
    });
    setEditingId(filme.id);
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // valida com Zod (coerce converte duracao para number)
    const result = filmeSchema.safeParse({
      ...form,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FilmeFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FilmeFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const payload: FilmeCreate = {
      ...result.data,
    };

    try {
      if (editingId !== null) {
        // atualização
        await updateFilme(editingId, payload);
      } else {
        // criação
        await createFilme(payload);
      }

      await loadFilmes();

      // limpa formulário e sai do modo edição
      setForm({
        titulo: '',
        sinopse: '',
        classificacao: '',
        duracao: '',
        genero: '',
        dataInicioExibicao: '',
        dataFinalExibicao: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deseja realmente excluir este filme?')) return;

    try {
      await deleteFilme(id);
      await loadFilmes();
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1 className="mb-4 d-flex align-items-center">
        <i className="bi bi-film me-2" />
        Filmes
      </h1>

      {/* Formulário de cadastro */}
      <div className="card mb-4">
        <div className="card-header">
          {editingId ? 'Editar Filme' : 'Cadastrar Filme'}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <Input
                id="titulo"
                name="titulo"
                label="Título"
                value={form.titulo}
                onChange={handleChange}
                error={errors.titulo}
              />
            </div>

            <div className="col-md-6">
              <Input
                id="classificacao"
                name="classificacao"
                label="Classificação"
                value={form.classificacao}
                onChange={handleChange}
                error={errors.classificacao}
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Sinopse</label>
              <textarea
                className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`}
                name="sinopse"
                value={form.sinopse}
                onChange={handleChange}
                rows={3}
              />
              {errors.sinopse && (
                <div className="invalid-feedback">{errors.sinopse}</div>
              )}
            </div>

            <div className="col-md-4">
              <Input
                id="duracao"
                name="duracao"
                label="Duração (minutos)"
                type="number"
                value={form.duracao}
                onChange={handleChange}
                error={errors.duracao}
              />
            </div>

            <div className="col-md-4">
              <Input
                id="genero"
                name="genero"
                label="Gênero"
                value={form.genero}
                onChange={handleChange}
                error={errors.genero}
              />
            </div>

            <div className="col-md-4">
              <Input
                id="dataInicioExibicao"
                name="dataInicioExibicao"
                label="Data Início Exibição"
                type="date"
                value={form.dataInicioExibicao}
                onChange={handleChange}
                error={errors.dataInicioExibicao}
              />
            </div>

            <div className="col-md-4">
              <Input
                id="dataFinalExibicao"
                name="dataFinalExibicao"
                label="Data Final Exibição"
                type="date"
                value={form.dataFinalExibicao}
                onChange={handleChange}
                error={errors.dataFinalExibicao}
              />
            </div>

            <div className="col-12">
              <Button type="submit" label="Salvar" variant="primary" />
            </div>
          </form>
        </div>
      </div>

      {/* Tabela de filmes cadastrados */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="mb-0">Filmes cadastrados</h2>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            <i className="bi bi-trash3 me-1" />
            Excluir selecionados
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleDeleteAll}
            disabled={filmes.length === 0}
          >
            <i className="bi bi-x-circle me-1" />
            Excluir todos
          </button>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ width: '2rem' }}>
              <input
                type="checkbox"
                className="form-check-input"
                onChange={handleToggleSelectAll}
                checked={
                  filmes.length > 0 &&
                  filmes.every((f) => selectedIds.includes(f.id))
                }
              />
            </th>
            <th>Título</th>
            <th>Classificação</th>
            <th>Duração</th>
            <th>Gênero</th>
            <th>Início</th>
            <th>Final</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filmes.map((f) => (
            <tr key={f.id}>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedIds.includes(f.id)}
                  onChange={() => handleToggleSelect(f.id)}
                />
              </td>
              <td>{f.titulo}</td>
              <td>{f.classificacao}</td>
              <td>{f.duracao} min</td>
              <td>{f.genero}</td>
              <td>{f.dataInicioExibicao}</td>
              <td>{f.dataFinalExibicao}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  type="button"
                  onClick={() => handleEdit(f)}
                >
                  <i className="bi bi-pencil-square me-1" />
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  type="button"
                  onClick={() => handleDelete(f.id)}
                >
                  <i className="bi bi-trash me-1" />
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {filmes.length === 0 && (
            <tr>
              <td colSpan={8}>Nenhum filme cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FilmesPage;