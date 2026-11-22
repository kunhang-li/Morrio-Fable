const { test, expect } = require('@playwright/test');

const prompts = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  text: `Test prompt ${i + 1}`,
  order_index: i + 1,
}));

async function mockOnboarding(page) {
  await page.route('**/api/prompts', route =>
    route.fulfill({ json: prompts })
  );

  await page.route('**/api/stories', route =>
    route.fulfill({
      status: 201,
      json: { id: 100, title: 'Test story' },
    })
  );
}

test('shows all four onboarding prompts before editor', async ({ page }) => {
  await mockOnboarding(page);
  await page.goto('/');

  for (let step = 1; step <= 4; step++) {
    await expect(
      page.getByText(`Step ${step} of 4`)
    ).toBeVisible();

    await page.getByPlaceholder('Write your response…')
      .fill(`Answer ${step}`);

    if (step < 4) {
      await page.getByRole('button', { name: 'Next' }).click();
    }
  }

  await expect(
    page.getByRole('button', { name: 'Finish' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(
    page.getByRole('heading', { name: 'Story Editor' })
  ).toBeVisible();
});

test('one upload produces exactly one media card', async ({ page }) => {
  await mockOnboarding(page);

  await page.route('**/api/stories/100/media', async route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] });
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    return route.fulfill({
      status: 201,
      json: {
        id: 501,
        story_id: 100,
        media_type: 'image',
        url: '/uploads/test.png',
      },
    });
  });

  await page.goto('/');

  for (let step = 1; step <= 4; step++) {
    await expect(
      page.getByText(`Step ${step} of 4`, { exact: true })
    ).toBeVisible();
  
    const textarea = page.getByPlaceholder('Write your response…');
  
    await textarea.fill(`Answer ${step}`);

    await expect(textarea).toHaveValue(`Answer ${step}`);
  
    const buttonName = step === 4 ? 'Finish' : 'Next';
  
    const button = page.getByRole('button', {
      name: buttonName,
      exact: true
    });
  
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  
    await button.click();
    if (step < 4) {
      await expect(
        page.getByText(`Step ${step + 1} of 4`, { exact: true })
      ).toBeVisible();
    }
  }
  await expect(
    page.getByRole('heading', { name: 'Story Editor' })
  ).toBeVisible();

await page.getByPlaceholder('Story title').fill('Upload Test');

await page.getByRole('button', {
  name: 'Save',
  exact: true
}).click();

await expect(
  page.getByRole('heading', { name: 'Media Timeline' })
).toBeVisible();
await page.getByRole('button', {
    name: 'Finish',
    exact: true
  }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=',
      'base64'
    ),
  });

  await expect(
    page.getByText('image', { exact: true })
  ).toHaveCount(1);
});