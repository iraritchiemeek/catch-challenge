import { describe, expect, it } from "vitest";
// The browser render module is plain JS so the page and these tests share one
// implementation (esp. the HTML-escaping, which is the security-critical part).
import { escapeHtml, renderRows } from "../public/render.js";

const base = {
  id: 1,
  first_name: "Laura",
  last_name: "Richards",
  email: "laura@example.com",
  gender: "Female",
  ip_address: "81.192.7.99",
  company: "Meezzy",
  city: "Kallithéa",
  title: "Biostatistician III",
  website: "https://intel.com/a.png?x=1&y=2",
};

describe("escapeHtml", () => {
  it("neutralises HTML metacharacters", () => {
    expect(escapeHtml(`<script>"&'`)).toBe("&lt;script&gt;&quot;&amp;&#39;");
  });
});

describe("renderRows", () => {
  it("renders one row per customer with the expected fields", () => {
    const html = renderRows([base]);
    expect(html.match(/<tr/g)).toHaveLength(1);
    for (const value of ["Laura Richards", "laura@example.com", "Meezzy", "Kallithéa", "Female"]) {
      expect(html).toContain(value);
    }
  });

  it("escapes field values to prevent stored XSS", () => {
    const html = renderRows([
      { ...base, first_name: "<img src=x onerror=alert(1)>", last_name: "" },
    ]);
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });

  it("shows a dash for empty/missing fields", () => {
    const html = renderRows([{ ...base, company: "", title: null, last_name: "" }]);
    expect(html).toContain("—");
  });

  it("renders an http(s) website as a link to its host, escaping the href", () => {
    const html = renderRows([base]);
    expect(html).toContain('href="https://intel.com/a.png?x=1&amp;y=2"');
    expect(html).toContain(">intel.com<");
  });

  it("does NOT render a javascript: URL as a link (anti-XSS)", () => {
    const html = renderRows([{ ...base, website: "javascript:alert(1)" }]);
    expect(html).not.toContain("javascript:alert(1)");
    expect(html).not.toContain("<a");
  });
});
