export type ExportTable = {
  headers: readonly string[];
  rows: readonly (readonly (string | number)[])[];
};

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function toCsv(table: ExportTable): string {
  const lines = [table.headers.map(escapeCsvCell).join(",")];
  for (const row of table.rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return String.fromCharCode(0xfeff) + lines.join("\r\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function toExcelXml(table: ExportTable): string {
  const allRows = [table.headers, ...table.rows];
  const body = allRows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const isNumber = typeof cell === "number";
          const type = isNumber ? "Number" : "String";
          return (
            '<Cell><Data ss:Type="' +
            type +
            '">' +
            escapeXml(String(cell)) +
            "</Data></Cell>"
          );
        })
        .join("");
      return "<Row>" + cells + "</Row>";
    })
    .join("");

  return (
    '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' +
    '<Worksheet ss:Name="Atlas"><Table>' +
    body +
    "</Table></Worksheet>\n</Workbook>"
  );
}

export function downloadFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
