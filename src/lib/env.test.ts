import { afterEach, describe, expect, it } from "vitest";
import {
  canResetDatabase,
  isDevelopApp,
  isProductionApp,
  isStagingApp,
  shouldAutoResetOnDeploy,
  shouldShowDemoCredentials,
} from "./env";

const originalAuthUrl = process.env.AUTH_URL;
const originalNodeEnv = process.env.NODE_ENV;
const originalRunDbPurge = process.env.RUN_DB_PURGE;

afterEach(() => {
  if (originalAuthUrl === undefined) {
    delete process.env.AUTH_URL;
  } else {
    process.env.AUTH_URL = originalAuthUrl;
  }
  process.env.NODE_ENV = originalNodeEnv;
  if (originalRunDbPurge === undefined) {
    delete process.env.RUN_DB_PURGE;
  } else {
    process.env.RUN_DB_PURGE = originalRunDbPurge;
  }
});

describe("isProductionApp", () => {
  it("devrait détecter la production via AUTH_URL", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";
    expect(isProductionApp()).toBe(true);
  });

  it("devrait ignorer le slash final de AUTH_URL", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle.vercel.app/";
    expect(isProductionApp()).toBe(true);
  });

  it("devrait exclure l'environnement dev", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";
    expect(isProductionApp()).toBe(false);
  });

  it("devrait exclure l'environnement staging", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-staging.vercel.app";
    expect(isProductionApp()).toBe(false);
  });

  it("devrait traiter localhost comme non-production", () => {
    process.env.AUTH_URL = "http://localhost:3000";
    expect(isProductionApp()).toBe(false);
  });

  it("devrait considérer NODE_ENV=production sans AUTH_URL comme production", () => {
    delete process.env.AUTH_URL;
    process.env.NODE_ENV = "production";
    expect(isProductionApp()).toBe(true);
  });
});

describe("shouldShowDemoCredentials", () => {
  it("devrait masquer les comptes en production", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";
    expect(shouldShowDemoCredentials()).toBe(false);
  });

  it("devrait afficher les comptes hors production", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";
    expect(shouldShowDemoCredentials()).toBe(true);
  });
});

describe("isStagingApp", () => {
  it("devrait détecter staging", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-staging.vercel.app";
    expect(isStagingApp()).toBe(true);
  });
});

describe("isDevelopApp", () => {
  it("devrait détecter develop", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";
    expect(isDevelopApp()).toBe(true);
  });
});

describe("canResetDatabase", () => {
  it("devrait interdire la purge en production", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";
    expect(canResetDatabase()).toBe(false);
  });

  it("devrait autoriser la purge hors production", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-staging.vercel.app";
    expect(canResetDatabase()).toBe(true);
  });
});

describe("shouldAutoResetOnDeploy", () => {
  it("devrait activer le reset auto sur develop", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";
    delete process.env.RUN_DB_PURGE;
    expect(shouldAutoResetOnDeploy()).toBe(true);
  });

  it("devrait désactiver le reset auto sur staging par défaut", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-staging.vercel.app";
    delete process.env.RUN_DB_PURGE;
    expect(shouldAutoResetOnDeploy()).toBe(false);
  });

  it("devrait respecter RUN_DB_PURGE=false", () => {
    process.env.AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";
    process.env.RUN_DB_PURGE = "false";
    expect(shouldAutoResetOnDeploy()).toBe(false);
  });
});
