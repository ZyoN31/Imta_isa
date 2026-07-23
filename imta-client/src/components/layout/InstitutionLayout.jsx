import { FiBookOpen, FiHome, FiLogOut, FiMessageSquare, FiSearch, FiUser, FiUsers } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import { getDisplayName, getRoleLabel, resolveBackendUrl } from '../../services/api';

const baseNavigation = [
  { to: '/', label: 'Inicio', icon: FiHome, end: true },
  { to: '/investigadores', label: 'Investigadores', icon: FiUsers },
  { to: '/estudios', label: 'Estudios', icon: FiBookOpen },
  { to: '/noticias', label: 'Noticias', icon: FiMessageSquare },
];

export default function InstitutionLayout({ user, onLogout, children }) {
  const navigation = user?.rol
    ? [
        ...baseNavigation,
        user.rol === 'investigador'
          ? {
              to: '/mis-publicaciones',
              label: 'Mis publicaciones',
              icon: FiBookOpen,
            }
          : null,
        {
          to:
            user.rol === 'administrador'
              ? '/admin'
              : user.rol === 'investigador'
                ? '/investigador'
                : '/perfil',
          label: user.rol === 'consultor' ? 'Mi perfil' : 'Panel',
          icon: user.rol === 'consultor' ? FiUser : FiSearch,
        },
      ].filter(Boolean)
    : baseNavigation;

  return (
    <div className="page-shell">
      <header className="institution-header">
        <div className="institution-header__top">
          <div className="gov-brand">
            <div className="gov-brand__emblem">Mx</div>
            <div className="gov-brand__text">
              <strong>Gobierno de México</strong>
              <span>Laboratorio de Hidráulica del IMTA</span>
            </div>
          </div>

          <div className="institution-header__links">
            <a href="#">Trámites</a>
            <a href="#">Gobierno</a>
            <a href="#">English</a>
            <button type="button" aria-label="Buscar">⌕</button>
          </div>
        </div>

        <div className="institution-header__main">
          <div className="institution-brand">
            <div className="imta-brand__mark">IMTA</div>
            <div>
              <h1 className="institution-brand__title">Sistema Web Administrativo</h1>
              <p className="institution-brand__subtitle">Laboratorio de Hidráulica del IMTA</p>
            </div>
          </div>

          {user ? (
            <div className="user-chip">
              <div className="user-chip__avatar">
                {user.foto ? (
                  <img src={resolveBackendUrl(user.foto)} alt={getDisplayName(user)} />
                ) : (
                  <span>{getDisplayName(user).charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="user-chip__name">{getDisplayName(user)}</p>
                <p className="user-chip__role">{getRoleLabel(user.rol)}</p>
              </div>
            </div>
          ) : (
            <div className="institution-header__auth">
              <Link className="ghost-link" to="/login">Iniciar sesión</Link>
              <Link className="solid-link" to="/registro">Crear cuenta</Link>
            </div>
          )}
        </div>
      </header>

      <div className="page-shell__body">
        <aside className="side-nav">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `side-nav__link${isActive ? ' is-active' : ''}`}>
              <Icon className="side-nav__icon" />
              <span>{label}</span>
            </NavLink>
          ))}

          <hr className="side-nav__separator" />

          {user ? (
            <button type="button" className="side-nav__link side-nav__logout danger-button" onClick={onLogout}>
              <FiLogOut className="side-nav__icon" />
              <span>Cerrar sesión</span>
            </button>
          ) : (
            <Link className="side-nav__link" to="/login">
              <FiLogOut className="side-nav__icon" />
              <span>Acceso</span>
            </Link>
          )}
        </aside>

        <main className="content-area">{children}</main>
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer-brand">
            <div className="footer-brand__emblem">Mx</div>
            <div>
              <strong>Gobierno de México</strong>
              <small>Laboratorio de Hidráulica del IMTA</small>
            </div>
          </div>

          <div className="footer-copy">
            <strong>Laboratorio de Hidráulica del IMTA</strong>
            <small>Instituto Mexicano de Tecnología del Agua</small>
            <small>© 2026 Todos los derechos reservados.</small>
          </div>

          <div className="footer-logo">
            <div className="footer-logo__stack">
              <div className="footer-logo__symbol">IM</div>
              <div>
                <strong>IMTA</strong>
                <small>Instituto Mexicano de Tecnología del Agua</small>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}