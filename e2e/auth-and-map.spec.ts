import { test, expect } from "@playwright/test";

const OWNER = { email: "patron@ferme.local", password: "patron1234" };
const EMPLOYEE = { email: "employe@ferme.local", password: "employe1234" };

test.describe("Authentification", () => {
  test("devrait afficher les comptes de test hors production", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByTestId("demo-credentials")).toBeVisible();
    await expect(page.getByTestId("demo-email-patron")).toContainText("patron@ferme.local");
    await expect(page.getByTestId("demo-password-patron")).toContainText("patron1234");
  });

  test("devrait refuser des identifiants invalides", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByTestId("login-email").fill("invalide@test.local");
    await page.getByTestId("login-password").fill("mauvaismdp");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("devrait connecter un patron et accéder au tableau de bord", async ({
    page,
  }) => {
    await page.goto("/connexion");
    await page.getByTestId("login-email").fill(OWNER.email);
    await page.getByTestId("login-password").fill(OWNER.password);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/tableau-de-bord/);
    await expect(page.getByTestId("user-name")).toContainText("Jean");
  });

  test("devrait connecter un employé", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByTestId("login-email").fill(EMPLOYEE.email);
    await page.getByTestId("login-password").fill(EMPLOYEE.password);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/tableau-de-bord/);
  });
});

test.describe("Gestion des comptes (patron)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion");
    await page.getByTestId("login-email").fill(OWNER.email);
    await page.getByTestId("login-password").fill(OWNER.password);
    await page.getByTestId("login-submit").click();
  });

  test("devrait afficher la page de gestion des utilisateurs", async ({
    page,
  }) => {
    await page.goto("/admin/utilisateurs");
    await expect(page.getByTestId("users-table")).toBeVisible();
    await expect(page.getByTestId("create-user-form")).toBeVisible();
  });
});

test.describe("Carte des pâtures", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion");
    await page.getByTestId("login-email").fill(EMPLOYEE.email);
    await page.getByTestId("login-password").fill(EMPLOYEE.password);
    await page.getByTestId("login-submit").click();
  });

  test("devrait afficher la carte et le panneau de sortie", async ({ page }) => {
    await page.goto("/carte");
    await expect(page.getByTestId("pasture-map")).toBeVisible();
    await expect(page.getByTestId("grazing-panel")).toBeVisible();
    await expect(page.getByTestId("session-morning")).toBeVisible();
    await expect(page.getByTestId("session-evening")).toBeVisible();
  });
});
