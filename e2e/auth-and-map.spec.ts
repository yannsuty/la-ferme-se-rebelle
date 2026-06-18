import { test, expect } from "@playwright/test";

const OWNER = { email: "patron@ferme.local", password: "patron1234" };
const EMPLOYEE = { email: "employe@ferme.local", password: "employe1234" };
const FARM_REBELLE = "ferme-rebelle";
const FARM_DASHBOARD = `/f/${FARM_REBELLE}/tableau-de-bord`;
const FARM_CARTE = `/f/${FARM_REBELLE}/carte`;
const FARM_USERS = `/f/${FARM_REBELLE}/admin/utilisateurs`;

async function login(page: import("@playwright/test").Page, user: typeof OWNER) {
  await page.goto("/connexion");
  await page.getByTestId("login-email").fill(user.email);
  await page.getByTestId("login-password").fill(user.password);
  await page.getByTestId("login-submit").click();
}

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

  test("devrait afficher le sélecteur de fermes pour un multi-fermes", async ({
    page,
  }) => {
    await login(page, OWNER);
    await expect(page).toHaveURL(/\/fermes/);
    await expect(page.getByTestId("farm-list")).toBeVisible();
    await expect(page.getByTestId(`farm-link-${FARM_REBELLE}`)).toBeVisible();
    await expect(page.getByTestId("farm-link-ferme-des-collines")).toBeVisible();
  });

  test("devrait connecter un patron et accéder au tableau de bord", async ({
    page,
  }) => {
    await login(page, OWNER);
    await page.getByTestId(`farm-link-${FARM_REBELLE}`).click();
    await expect(page).toHaveURL(new RegExp(FARM_DASHBOARD));
    await expect(page.getByTestId("user-name")).toContainText("Jean");
    await expect(page.getByTestId("farm-role")).toContainText("Patron");
  });

  test("devrait connecter un employé", async ({ page }) => {
    await login(page, EMPLOYEE);
    await page.getByTestId(`farm-link-${FARM_REBELLE}`).click();
    await expect(page).toHaveURL(new RegExp(FARM_DASHBOARD));
    await expect(page.getByTestId("farm-role")).toContainText("Employé");
  });
});

test.describe("Gestion des comptes (patron)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, OWNER);
    await page.getByTestId(`farm-link-${FARM_REBELLE}`).click();
  });

  test("devrait afficher la page de gestion des utilisateurs", async ({
    page,
  }) => {
    await page.goto(FARM_USERS);
    await expect(page.getByTestId("users-table")).toBeVisible();
    await expect(page.getByTestId("create-user-form")).toBeVisible();
  });
});

test.describe("Carte des pâtures", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, EMPLOYEE);
    await page.getByTestId(`farm-link-${FARM_REBELLE}`).click();
  });

  test("devrait afficher la carte et le panneau de sortie", async ({ page }) => {
    await page.goto(FARM_CARTE);
    await expect(page.getByTestId("pasture-map")).toBeVisible();
    await expect(page.getByTestId("grazing-panel")).toBeVisible();
    await expect(page.getByTestId("session-morning")).toBeVisible();
    await expect(page.getByTestId("session-evening")).toBeVisible();
  });
});
