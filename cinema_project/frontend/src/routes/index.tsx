import { Route, Routes, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import FilmesPage from '../pages/Filmes';
import SalasPage from '../pages/Salas';
import SessoesPage from '../pages/Sessoes';
import VenderIngressoPage from '../pages/VenderIngresso';
import LanchesPage from '../pages/Lanches';
export const AppRoutes = () => {
  return (
    <Routes>
      {/* redireciona / para /filmes */}
      <Route path="/" element={<Navigate to="/filmes" />} />

      <Route path="/home" element={<Home />} />
      <Route path="/filmes" element={<FilmesPage />} />
      <Route path="/salas" element={<SalasPage />} />
      <Route path="/sessoes" element={<SessoesPage />} />
      <Route path="/lanches" element={<LanchesPage />} />
      <Route path="/vendas/:sessaoId" element={<VenderIngressoPage />} />
    </Routes>
  );
};