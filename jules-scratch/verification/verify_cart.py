from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Admin test
    page.goto("http://localhost:3001/auth")
    page.get_by_label("Email").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.locator('form').get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    page.goto("http://localhost:3001/dashboard")
    page.wait_for_load_state("networkidle")

    page.goto("http://localhost:3001/admin/products")
    page.wait_for_selector('h1:has-text("Manage Products")')
    page.get_by_role("button", name="Open menu").first.click()
    page.get_by_role("menuitem", name="Add to Cart").click()
    page.get_by_role("menuitem", name="Go to Cart").click()

    expect(page.locator("text=Cart (1)")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/admin_cart.png")

    page.get_by_role("button", name="Sign Out").click()

    # Business owner test
    page.goto("http://localhost:3001/auth")
    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("password")
    page.locator('form').get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    page.goto("http://localhost:3001/dashboard")
    page.wait_for_load_state("networkidle")

    page.goto("http://localhost:3001/products")
    page.wait_for_selector('h1:has-text("Products")')
    page.get_by_role("button", name="Add to Cart").first.click()
    page.get_by_role("link", name="View Cart & Send Inquiry").click()

    expect(page.locator("text=Cart (1)")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/user_cart.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
