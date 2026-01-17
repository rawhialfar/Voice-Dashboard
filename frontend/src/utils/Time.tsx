export const parseYMD = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const formatShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const nowMinus = (ms: number) => new Date(Date.now() - ms);
