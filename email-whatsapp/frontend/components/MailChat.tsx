'use client';

import { Agenda } from '@/components/Agenda';
import { ConfiguracoesEmail } from '@/components/ConfiguracoesEmail';
import { Conversa } from '@/components/Conversa';
import { SidebarContatos } from '@/components/SidebarContatos';
import { PostItModal } from '@/components/PostItModal';
import { Toast } from '@/components/Toast';
import { useContatos, useConversa, useResponder } from '@/hooks/useMailChat';
import { useMailChatStore } from '@/store/useMailChatStore';

export function MailChat() {
  const { data } = useContatos();
  const contatos = data?.contatos ?? [];
  const contatoSelecionadoId = useMailChatStore((s) => s.contatoSelecionadoId);
  const { data: conversa } = useConversa(contatoSelecionadoId);
  const responder = useResponder();
  const chatMobileAberto = useMailChatStore((s) => s.chatMobileAberto);
  const abrirPostit = useMailChatStore((s) => s.abrirPostit);
  const fecharPostit = useMailChatStore((s) => s.fecharPostit);
  const notificar = useMailChatStore((s) => s.notificar);
  const postitModalAberto = useMailChatStore((s) => s.postitModalAberto);
  const postitEmailPreset = useMailChatStore((s) => s.postitEmailPreset);
  const configuracoesAbertas = useMailChatStore((s) => s.configuracoesAbertas);
  const fecharConfiguracoes = useMailChatStore((s) => s.fecharConfiguracoes);

  const selecionar = (id: number) => {
    useMailChatStore.getState().selecionarContato(id);
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      useMailChatStore.getState().abrirChatMobile();
    }
  };

  const enviar = (texto: string) => {
    if (contatoSelecionadoId == null) {
      notificar('Selecione uma conversa primeiro');
      return;
    }
    responder.mutate({ id: contatoSelecionadoId, texto });
  };

  const anexarAgenda = (emailId: number) => {
    abrirPostit(emailId);
  };

  const selectEmail = (emailId: number) => {
    const c = contatos.find((x) => x.id === emailId);
    if (c) selecionar(c.id);
  };

  return (
    <div className="mailchat-app flex h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text)]">
      <SidebarContatos contatos={contatos} onSelect={selecionar} />
      <main
        className={`mailchat-main flex h-full min-w-0 flex-1 flex-col bg-[var(--bg-chat)] ${
          chatMobileAberto ? 'mailchat-ativo' : ''
        }`}
      >
        <Conversa contato={conversa} onEnviar={enviar} onAnexarAgenda={anexarAgenda} />
      </main>
      <Agenda onSelectEmail={selectEmail} />
      <ConfiguracoesEmail open={configuracoesAbertas} onOpenChange={fecharConfiguracoes} />
      <PostItModal open={postitModalAberto} onOpenChange={fecharPostit} presetEmailId={postitEmailPreset} />
      <Toast />
    </div>
  );
}
