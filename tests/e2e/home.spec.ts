import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/about/", title: "About" },
  { path: "/experience/", title: "Experience" },
  { path: "/projects/", title: "Projects" },
  { path: "/certificates/", title: "Certificates" },
  { path: "/contact/", title: "Contact" },
];

test("home page leads with the name and the terminal only", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Mohammad Afsharnejad");
  await expect(page.getByTestId("terminal")).toBeVisible();
  await expect(page.getByText("Data Analyst Nanodegree")).toHaveCount(0);
});

for (const { path, title } of PAGES) {
  test(`${title} has its own page, marked in the menu`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page).toHaveTitle(new RegExp(`^${title} · `));
    const menu = page.getByRole("navigation", { name: "Main" });
    await expect(menu.getByRole("link", { name: `./${path.slice(1, -1)}` })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
}

test("menu links move between pages", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "./projects" })
    .click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
});

test("interactive terminal answers commands", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel(/@portfolio/);
  const output = page.getByTestId("terminal-output");

  await input.fill("help");
  await input.press("Enter");
  await expect(output).toContainText("available commands");

  await input.fill("projects");
  await input.press("Enter");
  await expect(output).toContainText("01-portfolio/");

  await input.fill("clear");
  await input.press("Enter");
  await expect(output).not.toContainText("available commands");
});

test("'cd' in the terminal opens a page", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel(/@portfolio/);
  await input.fill("cd experience");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/experience\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experience");
});

test("quick command chips work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "skills" }).click();
  await expect(page.getByTestId("terminal-output")).toContainText("Oracle SQL");
});

test("project filters show only matching projects", async ({ page }) => {
  await page.goto("/projects/");
  const cards = page.locator(".projects > li");
  const total = await cards.count();
  await page.getByRole("button", { name: "live", exact: true }).click();
  await expect(page.getByRole("button", { name: "live", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await cards.count()).toBeLessThan(total);
  await expect(cards.first()).toContainText("[live]");
});

test("email button uses mailto", async ({ page }) => {
  await page.goto("/contact/");
  const email = page.getByRole("link", { name: "email me" });
  await expect(email).toHaveAttribute("href", /^mailto:/);
});

test("no horizontal scroll on any page", async ({ page }) => {
  for (const path of ["/", ...PAGES.map((p) => p.path)]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});

test("unknown pages show the 404 screen", async ({ page }) => {
  const res = await page.goto("/404.html");
  expect(res?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
});
