import React from 'react';

interface MailChatBannerProps {
  appName?: string;
  tagline?: string;
  showDemo?: boolean;
  onCtaClick?: () => void;
}

const EX_RED = '#ff6b6b';
const EX_RED_DARK = '#ee5a5a';
const EX_PURPLE = '#667eea';
const EX_PURPLE_DARK = '#764ba2';
const EX_GRADIENT = `linear-gradient(45deg, ${EX_PURPLE}, ${EX_PURPLE_DARK})`;
const EX_BADGE_GRADIENT = `linear-gradient(45deg, ${EX_RED}, ${EX_RED_DARK})`;

export const MailChatBanner: React.FC<MailChatBannerProps> = ({
  appName = 'MailChat',
  tagline = 'Sua caixa de e-mail reorganizada como conversas do WhatsApp',
  showDemo = true,
  onCtaClick
}) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: 600,
        width: '90%',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          display: 'inline-block',
          background: EX_BADGE_GRADIENT,
          color: '#fff',
          padding: '0.3rem 0.8rem',
          borderRadius: 20,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          marginBottom: '1rem'
        }}
      >
        EX TECHNOLOGIES
      </div>

      <h1
        style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          background: EX_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          letterSpacing: '-0.5px'
        }}
      >
        {appName}
      </h1>

      <p
        style={{
          color: '#666',
          fontSize: '1.1rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
          opacity: 0.9
        }}
      >
        {tagline}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0' }}>
        <li style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ width: 24, height: 24, background: EX_GRADIENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
            <span style={{ width: 12, height: 12, background: '#fff', borderRadius: 4 }} />
          </span>
          Interface intuitiva inspirada no WhatsApp
        </li>
        <li style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ width: 24, height: 24, background: EX_GRADIENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
            <span style={{ width: 12, height: 12, background: '#fff', borderRadius: 4 }} />
          </span>
          Sincronização em tempo real com Gmail
        </li>
        <li style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0' }}>
          <span style={{ width: 24, height: 24, background: EX_GRADIENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
            <span style={{ width: 12, height: 12, background: '#fff', borderRadius: 4 }} />
          </span>
          Organização em conversas e post-its
        </li>
        <li style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #eee' }}>
          <span style={{ width: 24, height: 24, background: EX_GRADIENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
            <span style={{ width: 12, height: 12, background: '#fff', borderRadius: 4 }} />
          </span>
          Compatível com dispositivos móveis
        </li>
      </ul>

      <button
        onClick={onCtaClick}
        style={{
          display: 'inline-block',
          background: EX_GRADIENT,
          color: '#fff',
          padding: '0.8rem 2rem',
          borderRadius: 50,
          fontWeight: 600,
          fontSize: '1rem',
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {showDemo ? 'Começar agora' : 'Continuar'}
      </button>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', color: '#999', fontSize: '0.85rem' }}>
        Desenvolvido por <strong>EX Technologies</strong> &copy; 2026
      </div>
    </div>
  );
};
