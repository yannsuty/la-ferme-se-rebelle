const PRODUCTION_AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";
const STAGING_AUTH_URL = "https://la-ferme-se-rebelle-staging.vercel.app";
const DEVELOP_AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function getAuthUrl(): string | undefined {
  const authUrl = process.env.AUTH_URL;
  return authUrl ? normalizeUrl(authUrl) : undefined;
}

/** Vrai uniquement sur l'environnement de production (projet Vercel prod). */
export function isProductionApp(): boolean {
  const authUrl = getAuthUrl();

  if (authUrl) {
    return authUrl === PRODUCTION_AUTH_URL;
  }

  return process.env.NODE_ENV === "production";
}

/** Vrai sur l'environnement staging Vercel. */
export function isStagingApp(): boolean {
  return getAuthUrl() === STAGING_AUTH_URL;
}

/** Vrai sur l'environnement develop Vercel. */
export function isDevelopApp(): boolean {
  return getAuthUrl() === DEVELOP_AUTH_URL;
}

/** Afficher les identifiants de démo sur dev, staging et en local. */
export function shouldShowDemoCredentials(): boolean {
  return !isProductionApp();
}

/** Autoriser la purge / réinitialisation de la base (interdit en production). */
export function canResetDatabase(): boolean {
  return !isProductionApp();
}

export const ADMIN_EMAIL_NON_PROD = "admin@test.local";
export const ADMIN_PASSWORD_NON_PROD = "admin12345678";

/** Mot de passe admin production : variable d'environnement obligatoire (≥ 16 car.). */
export function getProductionAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 16) {
    throw new Error(
      "ADMIN_PASSWORD requis en production (16 caractères minimum)",
    );
  }
  return password;
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? ADMIN_EMAIL_NON_PROD;
}
