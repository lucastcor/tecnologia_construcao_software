import { NavLink, Link } from 'react-router-dom';

const NavBar = () => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/filmes">
          <i className="bi bi-film me-2" />
          CineWeb
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/home">
                <i className="bi bi-house-door me-1" />
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/filmes">
                <i className="bi bi-film me-1" />
                Filmes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/salas">
                <i className="bi bi-door-open me-1" />
                Salas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/sessoes">
                <i className="bi bi-camera-reels me-1" />
                Sessões
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/lanches">
                <i className="bi bi-cup-straw me-1" />
                Lanches
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;