import { test, expect } from '@playwright/test';

test('MailChat — tarefa 1: carregar conversa e localizar artefato', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ana Souza')).toBeVisible();
  await expect(page.getByText('Proposta Comercial — Projeto Aurora')).toBeVisible();
  await expect(page.getByText('Proposta_Comercial_Aurora_v2.pdf')).toBeVisible();
});

test('MailChat — tarefa 2: responder via Enter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Escreva sua resposta').fill('Recebido, vou revisar hoje.');
  await page.getByLabel('Enviar resposta').click();
  await expect(page.getByText('Recebido, vou revisar hoje.')).toBeVisible();
});

test('MailChat — tarefa 3: anexar e-mail a compromisso', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Anexar e-mail à agenda').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByPlaceholder('Ex.: Reunião de alinhamento').fill('Call com Ana — follow-up');
  await page.getByRole('button', { name: 'Salvar post-it' }).click();
  await expect(page.getByText('Call com Ana — follow-up')).toBeVisible();
});
