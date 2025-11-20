import { test, expect } from '@playwright/test';

test('loop drawing still exports a valid series', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByRole('img', { name: /interactive drawing canvas/i });
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not found');
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 30);
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 20);
  await page.mouse.up();
  const exportLocator = page.getByTestId('desmos-string');
  await expect(exportLocator).toContainText('y =');
});
