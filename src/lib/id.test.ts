import { describe, expect, it } from "vitest";
import { createId } from "./id";

describe("createId", () => {
  it("creates an id when crypto.randomUUID is missing", () => {
    const originalCrypto = globalThis.crypto;

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (bytes: Uint8Array) => {
          bytes.fill(7);
          return bytes;
        }
      }
    });

    expect(createId()).toMatch(/^[a-f0-9-]{36}$/);

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: originalCrypto
    });
  });
});
