'use client';

import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContatos, useCriarPostIt } from '@/hooks/useMailChat';
import { useMailChatStore } from '@/store/useMailChatStore';
import type { PostItCor } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Informe um título'),
  day: z.string(),
  time: z.string(),
  color: z.enum(['yellow', 'pink', 'blue', 'green']),
  emailId: z.string(),
});

type FormValues = z.infer<typeof schema>;

const CORES: { id: PostItCor; bg: string }[] = [
  { id: 'yellow', bg: '#FDE68A' },
  { id: 'pink', bg: '#F9A8D4' },
  { id: 'blue', bg: '#93C5FD' },
  { id: 'green', bg: '#6EE7B7' },
];

interface PostItModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetEmailId: number | null;
}

export function PostItModal({ open, onOpenChange, presetEmailId }: PostItModalProps) {
  const { data: contatosData } = useContatos();
  const contatos = contatosData?.contatos ?? [];
  const criarPostIt = useCriarPostIt();
  const diaSelecionado = useMailChatStore((s) => s.diaSelecionado);
  const notificar = useMailChatStore((s) => s.notificar);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      day: diaSelecionado,
      time: '10:00',
      color: 'yellow',
      emailId: presetEmailId ? String(presetEmailId) : '',
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        day: diaSelecionado,
        time: '10:00',
        color: 'yellow',
        emailId: presetEmailId ? String(presetEmailId) : '',
      });
    }
  }, [open, presetEmailId, diaSelecionado, reset]);

  const onSubmit = (values: FormValues) => {
    const title = values.title.trim();
    if (!title) {
      notificar('Informe um título');
      return;
    }
    criarPostIt.mutate(
      {
        day: values.day || diaSelecionado,
        time: values.time || '10:00',
        title,
        color: values.color,
        emailId: values.emailId ? Number(values.emailId) : null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          notificar('Post-it criado na agenda');
        },
      },
    );
  };

  const fieldLabel = (text: string, htmlFor: string) => (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-wider">
      {text}
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] gap-0 p-0 sm:rounded-2xl">
        <DialogTitle className="px-5 pt-5 text-[16px]">Novo post-it</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 p-5">
          <div className="field">
            {fieldLabel('Título do compromisso', 'pi-title')}
            <Controller
              control={control}
              name="title"
              render={({ field }) => <Input id="pi-title" placeholder="Ex.: Reunião de alinhamento" {...field} />}
            />
          </div>
          <div className="flex gap-3">
            <div className="field flex-1">
              {fieldLabel('Data', 'pi-day')}
              <Controller
                control={control}
                name="day"
                render={({ field }) => <Input id="pi-day" type="date" {...field} />}
              />
            </div>
            <div className="field flex-1">
              {fieldLabel('Horário', 'pi-time')}
              <Controller
                control={control}
                name="time"
                render={({ field }) => <Input id="pi-time" type="time" {...field} />}
              />
            </div>
          </div>
          <div className="field">
            {fieldLabel('Cor', 'pi-cor')}
            <div className="flex gap-2.5">
              {CORES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-testid={`postit-cor-${c.id}`}
                  aria-label={`Cor ${c.id}`}
                  onClick={() => setValue('color', c.id, { shouldValidate: true })}
                  className={`h-8 w-8 rounded-full border-2 transition-transform focus-visible:outline-none ${
                    values?.color === c.id ? 'scale-110 border-[var(--text)]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.bg }}
                />
              ))}
            </div>
          </div>
          <div className="field">
            {fieldLabel('E-mail anexado', 'pi-email')}
            <Controller
              control={control}
              name="emailId"
              render={({ field }) => (
                <select
                  id="pi-email"
                  {...field}
                  className="flex h-10 w-full items-center rounded-full border border-[var(--border)] bg-[var(--bg-app)] px-4 text-[13.5px] text-[var(--text)] outline-none focus-visible:outline-none"
                >
                  <option value="">Sem e-mail anexado</option>
                  {contatos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.assunto}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div className="mt-1 flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar post-it</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
