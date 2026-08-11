import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name}: searches, filters, inspects evidence, switches views, and resets`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Compare the ecosystems." }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("66 capabilities shown");

    const pageOverflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(pageOverflow.scrollWidth).toBeLessThanOrEqual(pageOverflow.clientWidth);

    const tableScroller = page.locator(".table-scroll");
    const tableOverflow = await tableScroller.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    if (viewport.name === "desktop") {
      expect(tableOverflow.scrollWidth).toBeGreaterThanOrEqual(
        tableOverflow.clientWidth,
      );
    } else {
      expect(tableOverflow.scrollWidth).toBeGreaterThan(tableOverflow.clientWidth);
      const horizontalPosition = await tableScroller.evaluate((element) => {
        element.scrollLeft = element.scrollWidth - element.clientWidth;
        return {
          maxScrollLeft: element.scrollWidth - element.clientWidth,
          scrollLeft: element.scrollLeft,
        };
      });
      expect(horizontalPosition.scrollLeft).toBe(horizontalPosition.maxScrollLeft);

      const verificationReachability = await page
        .getByRole("columnheader", { name: /verification & sources/i })
        .evaluate((header) => {
          const scroller = header.closest<HTMLElement>(".table-scroll");
          if (!scroller) return null;
          const headerRect = header.getBoundingClientRect();
          const scrollerRect = scroller.getBoundingClientRect();
          return {
            headerLeft: headerRect.left,
            headerRight: headerRect.right,
            scrollerLeft: scrollerRect.left,
            scrollerRight: scrollerRect.right,
          };
        });
      expect(verificationReachability).not.toBeNull();
      expect(verificationReachability!.headerLeft).toBeGreaterThanOrEqual(
        verificationReachability!.scrollerLeft - 1,
      );
      expect(verificationReachability!.headerRight).toBeLessThanOrEqual(
        verificationReachability!.scrollerRight + 1,
      );
    }

    await page
      .getByRole("searchbox", { name: /search capabilities/i })
      .fill("lifecycle hooks");
    const lifecycleRow = page.getByRole("row", { name: /lifecycle hooks/i });
    await expect(lifecycleRow).toBeVisible();
    await expect(page).toHaveURL(/q=lifecycle(?:\+|%20)hooks/);

    const evidenceButton = page.getByRole("button", {
      name: /show evidence for lifecycle hooks/i,
    });
    await evidenceButton.focus();
    await expect(evidenceButton).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("heading", { level: 2, name: "Anthropic evidence" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "OpenAI evidence" }),
    ).toBeVisible();

    const officialSource = page
      .getByRole("link", { name: /official source/i })
      .first();
    await expect(officialSource).toBeVisible();
    await expect(officialSource).toHaveAttribute("href", /^https:\/\//);

    await page.getByRole("button", { name: "Vendor comparison" }).click();
    await expect(
      page.getByRole("heading", {
        name: /anthropic and openai vendor comparison/i,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/view=vendors/);

    await page.getByRole("button", { name: /clear filters/i }).click();
    await expect(page.getByRole("status")).toHaveText("66 capabilities shown");
    await expect(page).not.toHaveURL(/q=/);

    await page.getByRole("button", { name: "Explorer" }).click();
    await page.getByRole("button", { name: /^Coding Agents 5$/ }).click();
    await expect(page).toHaveURL(/category=coding-agents/);
    await expect(page.getByRole("status")).toHaveText("5 capabilities shown");
    await expect(page.getByRole("row", { name: /primary coding agent/i })).toBeVisible();

    const filteredOverflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(filteredOverflow.scrollWidth).toBeLessThanOrEqual(
      filteredOverflow.clientWidth,
    );

    await page.getByRole("button", { name: /clear filters/i }).click();
    await expect(page.getByRole("status")).toHaveText("66 capabilities shown");
    await expect(page).not.toHaveURL(/category=/);
  });
}

test("desktop: preserves the accepted first-viewport table anatomy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const tableSummary = page.locator(".table-summary");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(tableSummary).toContainText("66 capabilities shown");
  await expect(tableSummary).toContainText("Evidence checked 11 Aug 2026");
  await expect(
    page.getByText(
      "Next: methodology, freshness rules, and public update provenance",
    ),
  ).toBeVisible();
});

test("desktop: comparison table rules do not style unrelated semantic tables", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const styles = await page.evaluate(() => {
    const table = document.createElement("table");
    table.setAttribute("aria-label", "Unrelated table");
    table.innerHTML =
      "<caption>Unrelated caption</caption><thead><tr><th>Label</th></tr></thead><tbody><tr><td>Value</td></tr></tbody>";
    document.body.append(table);
    const caption = table.querySelector("caption")!;
    const header = table.querySelector("th")!;
    return {
      minWidth: getComputedStyle(table).minWidth,
      captionPosition: getComputedStyle(caption).position,
      headerPosition: getComputedStyle(header).position,
    };
  });

  expect(styles).toEqual({
    minWidth: "0px",
    captionPosition: "static",
    headerPosition: "static",
  });
});

test("mobile: keeps the compact masthead actions on one line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "GitHub ↗", exact: true })).toBeVisible();
  const headerHeight = await page.locator(".site-header").evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(headerHeight).toBeLessThanOrEqual(60);
});

test("desktop: reaches evidence through natural Tab order with visible focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: /search capabilities/i });
  await search.fill("lifecycle hooks");
  await expect(search).toBeFocused();

  let focusedEvidence: {
    outlineStyle: string;
    outlineWidth: string;
    text: string;
  } | null = null;

  for (let index = 0; index < 45; index += 1) {
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        text: element.innerText.trim(),
      };
    });
    if (active?.text === "Show evidence for Lifecycle hooks") {
      focusedEvidence = active;
      break;
    }
  }

  expect(focusedEvidence).not.toBeNull();
  expect(focusedEvidence!.outlineStyle).not.toBe("none");
  expect(focusedEvidence!.outlineWidth).not.toBe("0px");

  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 2, name: "Anthropic evidence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /official source/i }).first(),
  ).toHaveAttribute("href", /^https:\/\//);
});
