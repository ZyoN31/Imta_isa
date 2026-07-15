import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, topMessage, children, footerText, footerLink, footerLinkLabel }) {
  return (
    <div className="auth-page">
      <div className="auth-banner">{topMessage}</div>
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="auth-hero__icon">→</div>
          <div>
            <h1>Laboratorio de Hidráulica Enzo Levi</h1>
            <p>Consulta proyectos, estudios y servicios del Laboratorio Enzo Levi en un solo lugar.</p>
          </div>
        </section>

        <section className="auth-card">
          <h2 className="auth-card__title">{title}</h2>
          {subtitle ? <p className="auth-card__description">{subtitle}</p> : null}
          {children}
          {footerText ? (
            <p className="auth-switch">
              {footerText} {footerLink ? <Link to={footerLink}>{footerLinkLabel ?? 'aquí'}</Link> : null}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}