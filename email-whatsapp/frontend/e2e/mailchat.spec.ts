import { test, expect } from '@playwright/test';

test('MailChat — tarefa 1: carregar conversa e localizar artefato', async ({ page }) => {
  await page.goto('/');
  // O nome e o assunto aparecem também na sidebar; escopar ao painel central evita a
  // ambiguidade entre a lista de contatos e o cabeçalho da conversa.
  const painel = page.getByRole('main');
  await expect(painel.getByText('Ana Souza', { exact: true })).toBeVisible();
  await expect(painel.getByText('Proposta Comercial — Projeto Aurora')).toBeVisible();
  await expect(painel.getByText('Proposta_Comercial_Aurora_v2.pdf', { exact: true })).toBeVisible();
});

test('MailChat — tarefa 2: responder via Enter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Escreva sua resposta').fill('Recebido, vou revisar hoje.');
  await page.getByLabel('Enviar resposta').click();
  // O texto enviado também vira preview na sidebar ("Você: ..."); a bolha da conversa
  // é o único elemento com o texto exato dentro do painel central.
  await expect(page.getByRole('main').getByText('Recebido, vou revisar hoje.', { exact: true })).toBeVisible();
});

test('MailChat — tarefa 3: anexar e-mail a compromisso', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Anexar e-mail à agenda').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByPlaceholder('Ex.: Reunião de alinhamento').fill('Call com Ana — follow-up');
  await page.getByRole('button', { name: 'Salvar post-it' }).click();
  await expect(page.getByText('Call com Ana — follow-up', { exact: true })).toBeVisible();
});
