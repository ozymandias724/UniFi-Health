export function formatFinanceLabel(label: string, category: string): string {
  const prefix = {
    Revenue: "Revenue: ",
    Expenditures: "Expenditures: ",
    Assets: "Assets: ",
  }[category];

  return prefix && label.startsWith(prefix)
    ? label.slice(prefix.length)
    : label;
}
