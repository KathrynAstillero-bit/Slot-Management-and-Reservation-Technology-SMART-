// Derive scoped dark colors from the screen styles without changing their light palette.
// Run after adding colors to a screen: node scripts/generate-dark-theme.cjs
const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");
const root = path.resolve(__dirname, "..");
const scope = '.reference-shell[data-theme="dark"]';
const files = [
  "styles.css",
  "App.css",
  ...[
    "Shell",
    "Dashboard",
    "Booking",
    "Staff",
    "Profile",
    "Balance",
    "About",
    "HelpCenter",
    "Ticket",
    "Modal",
    "PortalFooter",
  ].map((name) => `components/${name}.css`),
];

function hsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2;
  if (!d) return [210, 0, l];
  let h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return [h * 60, d / (1 - Math.abs(2 * l - 1)), l];
}
function rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2;
  const parts =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return parts.map((v) => Math.round((v + m) * 255));
}
function convert(r, g, b, a, kind) {
  let [h, s, l] = hsl(r, g, b);
  const semantic = s > 0.18 && (h < 65 || h > 290 || (h > 85 && h < 175));
  if (kind === "shadow") return `rgba(0, 0, 0, ${Math.min(0.6, a * 0.8)})`;
  if (kind === "line") {
    h = semantic ? h : 210;
    s = semantic ? Math.min(s, 0.45) : 0.25;
    l = 0.3;
  } else if (kind === "surface") {
    if (l > 0.65) {
      h = semantic ? h : 215;
      s = semantic ? 0.3 : 0.34;
      l = semantic ? 0.19 : 0.145;
    } else if (l > 0.25) {
      s = Math.min(s, 0.6);
      l = Math.min(l, 0.22);
    }
  } else {
    if (s < 0.15) {
      h = 210;
      s = 0.22;
    }
    l = l < 0.3 ? 0.91 : l < 0.7 ? 0.76 : Math.max(0.86, l);
    s = Math.min(s, semantic ? 0.65 : 0.38);
  }
  const result = rgb(h, s, l);
  return a < 1
    ? `rgba(${result.join(", ")}, ${a})`
    : `rgb(${result.join(", ")})`;
}
function recolor(value, kind) {
  value = value.replace(
    /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi,
    (_, hex) => {
      if (hex.length < 5)
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      return convert(
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        hex.length === 8
          ? Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(3))
          : 1,
        kind,
      );
    },
  );
  value = value.replace(
    /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/g,
    (_, r, g, b, a) => convert(+r, +g, +b, a === undefined ? 1 : +a, kind),
  );
  return value
    .replace(/\bwhite\b/g, convert(255, 255, 255, 1, kind))
    .replace(/\bblack\b/g, convert(0, 0, 0, 1, kind));
}
const output = postcss.root();
function walk(input, parent) {
  for (const node of input.nodes || []) {
    if (node.type === "atrule") {
      if (
        !node.nodes ||
        /keyframes/i.test(node.name) ||
        /print/.test(node.params)
      )
        continue;
      const copy = postcss.atRule({ name: node.name, params: node.params });
      walk(node, copy);
      if (copy.nodes?.length) parent.append(copy);
    } else if (node.type === "rule") {
      const selectors = node.selectors
        .filter((s) => !/^body|^html/.test(s))
        .map((selector) => {
          if (
            selector === ":root" ||
            selector === ".app-shell" ||
            selector === ".reference-shell"
          )
            return scope;
          if (selector.includes(".reference-shell"))
            return selector.replace(/\.reference-shell/g, scope);
          return `${scope} ${selector}`;
        });
      if (!selectors.length) continue;
      const copy = postcss.rule({ selectors });
      for (const declaration of node.nodes || []) {
        if (declaration.type !== "decl") continue;
        const prop = declaration.prop;
        if (
          !/^(?:color|background(?:-color)?|border(?:-[\w-]+)?|outline(?:-color)?|box-shadow|text-shadow|fill|stroke|accent-color|caret-color|--[\w-]+)$/.test(
            prop,
          )
        )
          continue;
        if (
          !/#(?:[\da-f]{3,8})\b|rgba?\(|\bwhite\b|\bblack\b/i.test(
            declaration.value,
          )
        ) {
          // Preserve later resets so an earlier colored declaration cannot leak back in.
          if (
            /^(?:transparent|none|inherit|currentColor)$/.test(
              declaration.value,
            )
          )
            copy.append(declaration.clone());
          continue;
        }
        const kind = /shadow/.test(prop)
          ? "shadow"
          : /border|outline|line/.test(prop)
            ? "line"
            : /background|surface|canvas|glass/.test(prop)
              ? "surface"
              : "text";
        copy.append({
          prop,
          value: recolor(declaration.value, kind),
          important: declaration.important,
        });
      }
      if (copy.nodes?.length) parent.append(copy);
    }
  }
}
for (const file of files)
  walk(
    postcss.parse(fs.readFileSync(path.join(root, "src", file), "utf8")),
    output,
  );
const overrides = `
${scope} { color-scheme: dark; --ink: #e3edf7; --muted: #adbed0; --border: #30415a; --surface: #142238; --canvas: #0b1424; --navy: #2586cb; --shadow: 0 6px 22px #0003; color: #e3edf7; background: linear-gradient(115deg,#0b1628f5,#101a2bf5),url('/assets/portal-gradient.jpg') center / cover fixed; }
${scope} .reference-rail { background: linear-gradient(160deg,#345b78,#26465f); border-color: #6c90aa; box-shadow: 0 12px 32px #0003; }
${scope} .ref-dashboard { --dash-ink: #e3edf7; --dash-muted: #afc0d2; }
${scope} .help-center { --help-navy: #e3edf7; --help-muted: #afc0d2; --help-cyan: #77c6eb; --help-line: #30415a; --help-glass: #15263de8; }
${scope} .button.primary, ${scope} .help-primary-action { color: #fff; background: #237fc0; border-color: #388fcb; }
${scope} .button.primary:hover, ${scope} .help-primary-action:hover { background: #3093d6; }
${scope} .reference-main-nav .nav-item.active { color: #fff; background: #527c9a; }
${scope} .reference-rail .nav-item, ${scope} .reference-rail .side-label, ${scope} .reference-rail .sidebar-footnote, ${scope} .reference-rail .rail-account-copy small { color: #e3eef6; }
${scope} .reference-rail .sidebar-appearance-label { color: #d6e7f4; }
${scope} .reference-rail .sidebar-theme-options { background: #16334b50; }
${scope} .reference-rail .sidebar-theme-options > button { color: #e3eef6; }
${scope} .sidebar-theme-options > button[aria-pressed="true"] { background: #355573; color: #fff; border-color: #6d94b4; }
${scope} .reference-brand .brand-logo, ${scope} .heading-logo { background: #f1f7ff; border-radius: 9px; padding: 4px; }
${scope} .qr-code { background: #fff; padding: 8px; }
${scope} input, ${scope} select, ${scope} textarea { color-scheme: dark; }
${scope} .date-button:not(:disabled), ${scope} .time-button:not(:disabled) { color: #e1f2ff; background: #213f57; border-color: #426780; }
${scope} .date-button.selected, ${scope} .time-button.selected { color: #fff; background: #267db7; border-color: #93d0f6; }
${scope} .date-button:disabled { color: #708196; background: #172334; border-color: #28364a; opacity: 1; }
${scope} .office-card:disabled, ${scope} .service-card:disabled, ${scope} .ref-office-link:disabled, ${scope} .time-button:disabled { color: #8392a3; background: #1c293c; border-color: #28364a; }
${scope} .legend-dot { background: #213f57; border-color: #426780; }
${scope} .legend-dot.selected { background: #267db7; border-color: #93d0f6; }
${scope} .legend-dot.disabled { background: #172334; border-color: #28364a; }
${scope} .button.primary:disabled { color: #8e9eb1; background: #243347; border-color: #30415a; }
`;
fs.writeFileSync(
  path.join(root, "src/components/DarkTheme.css"),
  "/* Generated by scripts/generate-dark-theme.cjs; screen-only so printed tickets stay legible. */\n@media screen {\n" +
    output.toString() +
    "\n" +
    overrides +
    "\n}\n",
);
console.log(`Generated dark appearance for ${files.length} stylesheets.`);
