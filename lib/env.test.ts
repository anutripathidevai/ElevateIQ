import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "./env";

describe("normalizeBaseUrl", () => {
  it("prepends https:// to a bare hostname (Azure default domain)", () => {
    expect(normalizeBaseUrl("app.azurewebsites.net")).toBe(
      "https://app.azurewebsites.net",
    );
  });

  it("leaves a value that already has https://", () => {
    expect(normalizeBaseUrl("https://app.azurewebsites.net")).toBe(
      "https://app.azurewebsites.net",
    );
  });

  it("leaves a value that already has http:// (local dev)", () => {
    expect(normalizeBaseUrl("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
  });

  it("treats the scheme check case-insensitively", () => {
    expect(normalizeBaseUrl("HTTPS://app.example.com")).toBe(
      "HTTPS://app.example.com",
    );
  });

  it("trims surrounding whitespace before normalizing", () => {
    expect(normalizeBaseUrl("  app.example.com  ")).toBe(
      "https://app.example.com",
    );
  });

  it("returns undefined for undefined", () => {
    expect(normalizeBaseUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for an empty/whitespace string", () => {
    expect(normalizeBaseUrl("   ")).toBeUndefined();
  });
});
