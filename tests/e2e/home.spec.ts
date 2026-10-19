import { expect, test } from "@playwright/test";

// The chat invitation pops up after a second and can cover buttons near the bottom.
// Mark it as seen, except in the tests about the invitation itself.
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes("invitation")) return;
  await page.addInitScript(() => sessionStorage.setItem("chat-teaser-seen", "1"));
});

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

test("chat bot opens, closes and shows contact details", async ({ page }) => {
  await page.goto("/about/");
  const launcher = page.getByRole("button", { name: "ask_mohammad.ai" });
  await launcher.click();
  const panel = page.getByRole("dialog", { name: /portfolio bot/ });
  await expect(panel).toBeVisible();
  await expect(page.getByLabel("Your question")).toBeFocused();
  await expect(panel.getByRole("link", { name: /@/ })).toHaveAttribute("href", /^mailto:/);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test("chat bot falls back to contact details when the API is not set up", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ask_mohammad.ai" }).click();
  await page.getByRole("button", { name: "how do I contact him?" }).click();
  await expect(page.getByTestId("chat-log")).toContainText("chat is offline");
});

test("chat bot sends the question and shows the answer", async ({ page }) => {
  let sent: { messages: { role: string; content: string }[] } | undefined;
  await page.route("**/chat-config.json", (route) =>
    route.fulfill({ json: { url: "https://chat.test/" } }),
  );
  await page.route("https://chat.test/", (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({
      json: { reply: "He is a Data & Automation Analyst in Calgary." },
      headers: { "access-control-allow-origin": "*" },
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "ask_mohammad.ai" }).click();
  const input = page.getByLabel("Your question");
  await input.fill("what does he do?");
  await input.press("Enter");
  await expect(page.getByTestId("chat-log")).toContainText("Data & Automation Analyst in Calgary");
  expect(sent?.messages).toEqual([{ role: "user", content: "what does he do?" }]);
});

test("chat invitation pops up once and opens the chat", async ({ page }) => {
  await page.goto("/");
  const teaser = page.getByRole("complementary", { name: "Chat invitation" });
  await expect(teaser).toBeVisible();
  await teaser.getByRole("button", { name: "start chat" }).click();
  await expect(page.getByRole("dialog", { name: /portfolio bot/ })).toBeVisible();
  await expect(page.getByLabel("Your question")).toBeFocused();

  await page.goto("/about/");
  await page.waitForTimeout(1600);
  await expect(teaser).toBeHidden();
});

test("chat invitation can be dismissed", async ({ page }) => {
  await page.goto("/");
  const teaser = page.getByRole("complementary", { name: "Chat invitation" });
  await teaser.getByRole("button", { name: "Dismiss chat invitation" }).click();
  await expect(teaser).toBeHidden();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
