export const colorFor = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
  //const hue = Math.abs(hash) % 360;
  //return `hsl(${hue} 60% 55%)`;
  return generateRandomHexColor();
};

function generateRandomHexColor(): string {
  const randomNumber = Math.floor(Math.random() * 0xFFFFFF);
  let hexColor = randomNumber.toString(16);
  hexColor = hexColor.padStart(6, '0');

  return `#${hexColor.toUpperCase()}`;
}

export const cssVar = (name: string, fallback?: string) =>
  `var(${name}${fallback ? `, ${fallback}` : ""})`;

export const COLOR_PRIMARY = cssVar("--color-primary", "#3160df");
export const COLOR_SECONDARY = cssVar("--color-secondary", "#d6e22d");
export const COLOR_GRID = cssVar("--color-gray", "#e5e7eb");
export const COLOR_TEXT = cssVar("--color-text", "#111827");
