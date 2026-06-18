import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("devrait hasher et vérifier un mot de passe", async () => {
    const hash = await hashPassword("motdepasse123");
    expect(hash).not.toBe("motdepasse123");
    await expect(verifyPassword("motdepasse123", hash)).resolves.toBe(true);
    await expect(verifyPassword("mauvais", hash)).resolves.toBe(false);
  });
});
