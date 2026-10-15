import { expect, test } from "@playwright/test";

test("home page shows the name and every section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Mohammad Afsharnejad");
  for (const id of [
    "terminal",
    "about",
    "ai",
    "experience",
    "projects",
    "certificates",
    "contact",
  ]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test("interactive terminal answers commands", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel(/@portfolio/);
  await input.fill("help");
  await input.press("Enter");
  const output = page.getByTestId("terminal-output");
  await expect(output).toContainText("available commands");

  await input.fill("projects");
  await input.press("Enter");
  await expect(output).toContainText("01-portfolio/");

  await input.fill("clear");
  await input.press("Enter");
  await expect(output).not.toContainText("available commands");
});

test("quick command chips work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "skills" }).click();
  await expect(page.getByTestId("terminal-output")).toContainText("Oracle SQL");
});

test("email button uses mailto", async ({ page }) => {
  await page.goto("/");
  const email = page.getByRole("link", { name: "email me" });
  await expect(email).toHaveAttribute("href", /^mailto:/);
});

test("no horizontal scroll on the page", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("unknown pages show the 404 screen", async ({ page }) => {
  const res = await page.goto("/404.html");
  expect(res?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
});
