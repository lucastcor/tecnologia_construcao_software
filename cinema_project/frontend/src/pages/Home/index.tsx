// src/pages/Home/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilmeCreate, Filme } from '../../models';
import { createFilme, getFilmes } from '../../services/filmesService';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleImportNowPlaying() {
    if (movies.length === 0) return;

    try {
      // Busca filmes já cadastrados no json-server
      const existentes: Filme[] = await getFilmes();

      // Normaliza para comparação por título + data de início de exibição
      const novosPayloads: FilmeCreate[] = movies
        .filter((m) => {
          const release = m.release_date || '';
          return !existentes.some(
            (f) =>
              f.titulo === m.title &&
              f.dataInicioExibicao === release,
          );
        })
        .map((m) => ({
          titulo: m.title,
          sinopse: m.overview || 'Sinopse indisponível.',
          classificacao: 'Livre',
          duracao: 120,
          genero: 'Em cartaz (TMDb)',
          dataInicioExibicao: m.release_date || '2025-01-01',
          dataFinalExibicao: m.release_date || '2025-12-31',
        }));

      if (novosPayloads.length === 0) {
        alert('Nenhum filme novo para importar. Todos já existem no catálogo local.');
        return;
      }

      await Promise.all(novosPayloads.map((p) => createFilme(p)));

      alert(
        `${novosPayloads.length} filme(s) em cartaz importado(s) para o catálogo local (db.json).`,
      );
    } catch (err) {
      console.error(err);
      alert('Erro ao importar filmes para o catálogo local.');
    }
  }

  useEffect(() => {
    async function loadNowPlaying() {
      setLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          setError('Chave da API TMDb não configurada (VITE_TMDB_API_KEY).');
          return;
        }

        const resp = await fetch(
          `https://api.themoviedb.org/3/movie/now_playing?language=pt-BR&page=1&api_key=${apiKey}`,
        );

        if (!resp.ok) {
          throw new Error('Falha ao buscar filmes em cartaz');
        }

        const data = await resp.json();
        setMovies((data.results ?? []).slice(0, 20));
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar filmes em cartaz.');
      } finally {
        setLoading(false);
      }
    }

    loadNowPlaying();
  }, []);

  return (
    <div>

      <p className="text-muted mb-4">
        Utilize o menu superior para gerenciar filmes, salas, sessões, ingressos e lanches.
      </p>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0 d-flex align-items-center">
            <i className="bi bi-film me-2" />
            Filmes em cartaz
          </h2>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleImportNowPlaying}
            disabled={movies.length === 0 || loading}
          >
            <i className="bi bi-download me-1" />
            Importar para catálogo local
          </button>
        </div>

        {loading && <p>Carregando filmes...</p>}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <p className="text-muted">Nenhum filme em cartaz encontrado na API.</p>
        )}

        <div className="row g-3">
          {movies.map((movie) => (
            <div className="col-6 col-md-3 col-lg-2" key={movie.id}>
              <div
                className="card h-100"
                role="button"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  navigate(`/sessoes?filme=${encodeURIComponent(movie.title)}`)
                }
              >
                {movie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                    className="card-img-top"
                    alt={movie.title}
                  />
                ) : (
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center bg-secondary text-white"
                    style={{ height: '240px', fontSize: '0.9rem' }}
                  >
                    Sem imagem
                  </div>
                )}
                <div className="card-body p-2">
                  <h3 className="card-title h6 mb-1">{movie.title}</h3>
                  <p className="card-text small text-muted mb-1">
                    {movie.release_date}
                  </p>
                  <p
                    className="card-text small text-truncate"
                    title={movie.overview}
                  >
                    {movie.overview || 'Sinopse indisponível.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;