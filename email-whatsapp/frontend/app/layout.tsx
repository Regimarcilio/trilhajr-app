import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'MailChat — E-mail em estilo conversa',
  description:
    'Cliente de e-mail com experiência de conversa estilo WhatsApp: conversas em bolhas, artefatos, agenda com post-its e temas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="whatsapp">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
