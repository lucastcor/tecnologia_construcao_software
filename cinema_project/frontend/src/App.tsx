// src/App.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { AppRoutes } from './routes';
import NavBar from './components/Nav';

function App() {
  return (
    <>
      <NavBar />
      {/* container central da aplicação */}
      <main className="container my-4">
        <AppRoutes />
      </main>
    </>
  );
}

export default App;