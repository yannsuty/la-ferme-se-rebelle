const PRODUCTION_AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Vrai uniquement sur l'environnement de production (projet Vercel prod). */
export function isProductionApp(): boolean {
  const authUrl = process.env.AUTH_URL;

  if (authUrl) {
    return normalizeUrl(authUrl) === PRODUCTION_AUTH_URL;
  }

  return process.env.NODE_ENV === "production";
}

/** Afficher les identifiants de démo sur dev, staging et en local. */
export function shouldShowDemoCredentials(): boolean {
  return !isProductionApp();
}
