import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete a full booking flow', async ({ page }) => {
    // 1. Navigate to the landing page
    await page.goto('/');
    
    // 2. Click on a film card (the first one that is not the hero if possible, or just any)
    const filmCard = page.locator('.film-card').first();
    await filmCard.waitFor();
    const filmTitle = await filmCard.locator('.film-card__title').textContent();
    await filmCard.click();
    
    // 3. On Film Details Page, verify we are on the right page
    await expect(page).toHaveURL(/\/films\/\d+/);
    await expect(page.locator('.film-details__title')).toHaveText(filmTitle || '');
    
    // 4. Select a showing
    // We wait for showtimes to be visible
    const showtimeBox = page.locator('.film-details__showtime-box').first();
    await showtimeBox.waitFor();
    await showtimeBox.click();
    
    // 5. Click "Gå vidare"
    const continueBtn = page.locator('.film-details__continue-btn');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();
    
    // 6. On Ticket Picker Page
    await expect(page).toHaveURL(/\/booking\/\d+\/tickets/);
    
    // Add one adult ticket
    const plusBtn = page.locator('.ticketRow', { hasText: 'Vuxen' }).locator('.ticketBtn--plus');
    await plusBtn.click();
    
    // 7. Select a seat
    const availableSeat = page.locator('.seat:not(.booked)').first();
    await availableSeat.waitFor();
    await availableSeat.click();
    
    // 8. Click "Fortsätt"
    const finalContinueBtn = page.locator('button.slutfor-btn');
    await expect(finalContinueBtn).toBeEnabled();
    await finalContinueBtn.click();
    
    // 9. On Booking Form Page
    await expect(page).toHaveURL(/\/bookingformpage/i);
    
    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Click "Slutför"
    const bookBtn = page.getByRole('button', { name: 'Slutför' });
    await bookBtn.click();
    
    // 10. Verify Confirmation Page
    await expect(page).toHaveURL(/\/confirmation/);
    await expect(page.locator('.confirmation-page__title')).toHaveText('Tack!');
  });
});
