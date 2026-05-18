import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Login as owner
        await page.goto("http://localhost:4015/staff/login")
        # Use data-testid if available, otherwise fallback
        try:
            await page.fill('input[data-testid="staff-email-input"]', "owner@gmail.com")
            await page.fill('input[data-testid="staff-password-input"]', "Test@1234")
            await page.click('button[data-testid="staff-login-button"]')
        except:
            await page.fill('input[type="email"]', "owner@gmail.com")
            await page.fill('input[type="password"]', "Test@1234")
            await page.click('button[type="submit"]')

        await page.wait_for_timeout(5000)

        # Take screenshot of whatever page we are on
        await page.screenshot(path="/home/jules/verification/after_login.png")

        # Navigate to Branch Settings
        await page.goto("http://localhost:4015/staff/branch-settings")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="/home/jules/verification/branch_settings.png")

        # Open the modal (Add Branch button)
        # The button might have an icon or specific text
        buttons = await page.query_selector_all('button')
        for btn in buttons:
            text = await btn.inner_text()
            if "Add" in text or "Branch" in text:
                await btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path="/home/jules/verification/branch_modal.png")
                break

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
