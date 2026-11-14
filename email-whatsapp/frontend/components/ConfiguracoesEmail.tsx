'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMailChatStore } from '@/store/useMailChatStore';

const schema = z.object({
  nome: z.string().min(1, 'Informe o nome da conta'),
  email: z.string().email('E-mail inválido'),
  imapServidor: z.string().min(3, 'Informe o servidor IMAP'),
  imapPorta: z.number().int().min(1).max(65535),
  smtpServidor: z.string().min(3, 'Informe o servidor SMTP'),
  smtpPorta: z.number().int().min(1).max(65535),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

interface ConfiguracoesEmailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfiguracoesEmail({ open, onOpenChange }: ConfiguracoesEmailProps) {
  const configuracao = useMailChatStore((s) => s.configuracao);
  const salvarConfiguracao = useMailChatStore((s) => s.salvarConfiguracao);
  const notificar = useMailChatStore((s) => s.notificar);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: configuracao.nome,
      email: configuracao.email,
      imapServidor: configuracao.imapServidor,
      imapPorta: configuracao.imapPorta,
      smtpServidor: configuracao.smtpServidor,
      smtpPorta: configuracao.smtpPorta,
      senha: configuracao.senha,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: configuracao.nome,
        email: configuracao.email,
        imapServidor: configuracao.imapServidor,
        imapPorta: configuracao.imapPorta,
        smtpServidor: configuracao.smtpServidor,
        smtpPorta: configuracao.smtpPorta,
        senha: configuracao.senha,
      });
    }
  }, [open, configuracao, reset]);

  const onSubmit = (values: FormValues) => {
    salvarConfiguracao({
      nome: values.nome.trim(),
      email: values.email.trim(),
      imapServidor: values.imapServidor.trim(),
      imapPorta: values.imapPorta,
      smtpServidor: values.smtpServidor.trim(),
      smtpPorta: values.smtpPorta,
      senha: values.senha,
    });
    onOpenChange(false);
    notificar('Configurações de e-mail salvas');
  };

  const loadDemo = () => {
    setValue('nome', 'Ana Clara');
    setValue('email', 'ana.clara@mailchat.com');
    setValue('imapServidor', 'imap.mailchat.com');
    setValue('imapPorta', 993);
    setValue('smtpServidor', 'smtp.mailchat.com');
    setValue('smtpPorta', 587);
    setValue('senha', 'demo1234');
    notificar('Credenciais de demonstração carregadas');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] gap-0 p-0 sm:rounded-2xl">
        <DialogTitle className="px-5 pt-5 text-[16px]">Configurações de e-mail</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3.5 overflow-y-auto p-5">
          <div className="field">
            <label
              htmlFor="cfg-nome"
              className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
            >
              Nome da conta
            </label>
            <Controller
              control={control}
              name="nome"
              render={({ field }) => <Input id="cfg-nome" placeholder="Ex.: Ana Clara" {...field} />}
            />
          </div>
          <div className="field">
            <label
              htmlFor="cfg-email"
              className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
            >
              Endereço de e-mail
            </label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => <Input id="cfg-email" type="email" placeholder="voce@dominio.com" {...field} />}
            />
          </div>
          <div className="flex gap-3">
            <div className="field flex-1">
              <label
                htmlFor="cfg-imap"
                className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
              >
                Servidor IMAP
              </label>
              <Controller
                control={control}
                name="imapServidor"
                render={({ field }) => <Input id="cfg-imap" placeholder="imap.dominio.com" {...field} />}
              />
            </div>
            <div className="field w-28">
              <label
                htmlFor="cfg-imap-porta"
                className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
              >
                Porta
              </label>
              <Controller
                control={control}
                name="imapPorta"
                render={({ field }) => <Input id="cfg-imap-porta" type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="field flex-1">
              <label
                htmlFor="cfg-smtp"
                className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
              >
                Servidor SMTP
              </label>
              <Controller
                control={control}
                name="smtpServidor"
                render={({ field }) => <Input id="cfg-smtp" placeholder="smtp.dominio.com" {...field} />}
              />
            </div>
            <div className="field w-28">
              <label
                htmlFor="cfg-smtp-porta"
                className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
              >
                Porta
              </label>
              <Controller
                control={control}
                name="smtpPorta"
                render={({ field }) => <Input id="cfg-smtp-porta" type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />}
              />
            </div>
          </div>
          <div className="field">
            <label
              htmlFor="cfg-senha"
              className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider"
            >
              Senha
            </label>
            <Controller
              control={control}
              name="senha"
              render={({ field }) => <Input id="cfg-senha" type="password" placeholder="••••••••" {...field} />}
            />
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 pt-1">
            <Button type="button" variant="outline" onClick={loadDemo}>
              Carregar demonstração
            </Button>
            <Button type="submit">Salvar configurações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
