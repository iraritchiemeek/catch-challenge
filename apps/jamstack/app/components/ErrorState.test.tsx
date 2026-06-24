import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("exposes an alert role so screen readers announce the failure", () => {
    const html = renderToStaticMarkup(<ErrorState retryHref="?page=1" />);
    expect(html).toContain('role="alert"');
  });

  it("offers a retry link back to the requested page", () => {
    const html = renderToStaticMarkup(<ErrorState retryHref="?page=3" />);
    expect(html).toContain('href="?page=3"');
    expect(html).toContain("Try again");
  });

  it("mentions GitHub's rate limit when the failure is a 403", () => {
    const html = renderToStaticMarkup(<ErrorState retryHref="?page=1" status={403} />);
    expect(html.toLowerCase()).toContain("rate limit");
  });
});
