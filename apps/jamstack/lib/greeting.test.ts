import { describe, expect, it } from "vitest";
import { greeting } from "./greeting";

describe("greeting", () => {
  it("greets the given name", () => {
    expect(greeting("Catch")).toBe("Hello, Catch!");
  });
});
