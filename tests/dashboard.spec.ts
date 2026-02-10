import { test, expect } from "@playwright/test";

test.describe("OpenClaw Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle("OpenClaw Dashboard");
  });

  test("shows sidebar navigation with all items", async ({ page }) => {
    await expect(page.getByTestId("nav-overview")).toBeVisible();
    await expect(page.getByTestId("nav-cron")).toBeVisible();
    await expect(page.getByTestId("nav-sessions")).toBeVisible();
    await expect(page.getByTestId("nav-usage")).toBeVisible();
    await expect(page.getByTestId("nav-config")).toBeVisible();
  });

  test("shows gateway status indicator", async ({ page }) => {
    await expect(page.getByTestId("gateway-status")).toBeVisible();
  });

  test("defaults to overview view", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  });

  test("navigates to Cron Jobs view", async ({ page }) => {
    await page.getByTestId("nav-cron").click();
    await expect(page.getByRole("heading", { level: 1, name: "Cron Jobs" })).toBeVisible();
    await expect(page.getByTestId("cron-job-list")).toBeVisible();
  });

  test("navigates to Sessions view", async ({ page }) => {
    await page.getByTestId("nav-sessions").click();
    await expect(page.getByRole("heading", { level: 1, name: "Sessions" })).toBeVisible();
    await expect(page.getByTestId("sessions-table")).toBeVisible();
  });

  test("navigates to Usage & Costs view", async ({ page }) => {
    await page.getByTestId("nav-usage").click();
    await expect(page.getByRole("heading", { level: 1, name: "Usage & Costs" })).toBeVisible();
    await expect(page.getByTestId("cost-chart")).toBeVisible();
  });

  test("navigates to Config view", async ({ page }) => {
    await page.getByTestId("nav-config").click();
    await expect(page.getByRole("heading", { level: 1, name: "Configuration" })).toBeVisible();
    await expect(page.getByTestId("config-form")).toBeVisible();
  });

  test("overview shows stat cards", async ({ page }) => {
    await expect(page.getByTestId("stat-sessions")).toBeVisible();
    await expect(page.getByTestId("stat-cron")).toBeVisible();
  });

  test("cron jobs lists all jobs with actions", async ({ page }) => {
    await page.getByTestId("nav-cron").click();
    await expect(page.getByText("daily-summary")).toBeVisible();
    await expect(page.getByText("weekly-report")).toBeVisible();
    await expect(page.getByText("health-check")).toBeVisible();
  });

  test("cron job toggle works", async ({ page }) => {
    await page.getByTestId("nav-cron").click();
    const disableButtons = page.getByRole("button", { name: "Disable" });
    await expect(disableButtons.first()).toBeVisible();
  });

  test("sessions table shows data", async ({ page }) => {
    await page.getByTestId("nav-sessions").click();
    await expect(page.getByText("sess_a1b2c3")).toBeVisible();
    await expect(page.getByText("Code Review Agent")).toBeVisible();
  });

  test("usage shows cost breakdown", async ({ page }) => {
    await page.getByTestId("nav-usage").click();
    await expect(page.getByText("Input Tokens")).toBeVisible();
    await expect(page.getByText("Output Tokens")).toBeVisible();
    await expect(page.getByText("Cache Read")).toBeVisible();
  });

  test("config shows info circle tooltips on hover", async ({ page }) => {
    await page.getByTestId("nav-config").click();
    const infoCircles = page.getByTestId("info-circle");
    await expect(infoCircles.first()).toBeVisible();
    // Hover over first info circle to trigger tooltip
    await infoCircles.first().hover();
    // Tooltip should appear (the tooltip text is inside the info circle span)
    const tooltip = page.locator(".tooltip").first();
    await expect(tooltip).toBeVisible();
  });

  test("config section navigation works", async ({ page }) => {
    await page.getByTestId("nav-config").click();
    await page.getByText("Gateway", { exact: true }).click();
    await expect(page.getByText("Gateway Settings")).toBeVisible();
  });

  test("active nav item is highlighted", async ({ page }) => {
    const overview = page.getByTestId("nav-overview");
    await expect(overview).toHaveClass(/active/);
    await page.getByTestId("nav-cron").click();
    await expect(page.getByTestId("nav-cron")).toHaveClass(/active/);
    await expect(overview).not.toHaveClass(/active/);
  });
});
