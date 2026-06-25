import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DotFillIcon, ForkIcon, IssueIcon, LawIcon, SortIcon, StarIcon } from "./icons";

describe("octicons", () => {
  it("each icon renders an aria-hidden svg of the requested size", () => {
    for (const Icon of [StarIcon, ForkIcon, IssueIcon, LawIcon, SortIcon, DotFillIcon]) {
      const html = renderToStaticMarkup(<Icon className="size-4" />);
      expect(html).toContain("<svg");
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('class="size-4"');
      expect(html).toContain("<path");
    }
  });

  it("lets the dot icon take a colour via inline style for the language indicator", () => {
    const html = renderToStaticMarkup(<DotFillIcon className="size-3" color="#3178c6" />);
    expect(html.toLowerCase()).toContain("#3178c6");
  });
});
