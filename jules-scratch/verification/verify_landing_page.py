from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # --- Log In ---
    page.goto("http://localhost:3000/auth")

    # Ensure the sign-in tab is visible and get the form
    signin_tab = page.locator('div[role="tabpanel"][data-state="active"]')

    signin_tab.get_by_label("Email").fill("test@test.com")
    signin_tab.get_by_label("Password").fill("password")

    page.screenshot(path="jules-scratch/verification/login_form_filled.png")

    # Click the sign-in button within the form
    signin_tab.get_by_role("button", name="Sign In").click()

    # Wait for the login to complete and navigate to the home page
    expect(page).to_have_url("http://localhost:3000/")
    page.screenshot(path="jules-scratch/verification/after_login.png")

    # --- Verify Products Page ---
    # Wait for the main content to be visible
    expect(page.locator('.lg\\:col-span-2')).to_be_visible()
    page.screenshot(path="jules-scratch/verification/landing_page_initial.png")

    # Find the first "Add to Inquiry" button and click it
    add_to_inquiry_button = page.locator('button:has-text("Add to Inquiry")').first
    add_to_inquiry_button.click()

    # Wait for the toast message to appear
    expect(page.locator('text=Added to Inquiry')).to_be_visible()

    # Take a screenshot after adding an item to the cart
    page.screenshot(path="jules-scratch/verification/landing_page_with_item_in_cart.png")


    browser.close()

with sync_playwright() as playwright:
    run(playwright)
