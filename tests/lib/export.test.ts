import { toCsv, toExcelXml, type ExportTable } from "@/lib/export";

describe("export", () => {
  const table: ExportTable = {
    headers: ["Name", "Count"],
    rows: [
      ["Alpha", 1],
      ["Beta, Inc.", 2],
      ['Quote "test"', 3],
    ],
  };

  it("escapes CSV cells containing commas and quotes", () => {
    const csv = toCsv(table);

    expect(csv).toContain('"Beta, Inc."');
    expect(csv).toContain('"Quote ""test"""');
  });

  it("prepends a UTF-8 BOM for Excel compatibility", () => {
    expect(toCsv(table).charCodeAt(0)).toBe(0xfeff);
  });

  it("emits a SpreadsheetML workbook with escaped cells", () => {
    const xml = toExcelXml(table);

    expect(xml).toContain('<?xml version="1.0"?>');
    expect(xml).toContain("<Workbook");
    expect(xml).toContain("<Worksheet");
    expect(xml).toContain("Beta, Inc.");
    expect(xml).toContain("&quot;");
  });
});
