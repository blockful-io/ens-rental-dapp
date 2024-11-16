export function shortenAddress(address: string) {
  if (!address) return "";

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return `${start}...${end}`;
}