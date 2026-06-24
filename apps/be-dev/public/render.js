// Render customer rows for the table. Plain ESM (no framework, no build step)
// so the same code runs in the browser and in unit tests. Markup/classes are
// from the Tailwind Plus "Tables → With hidden columns on mobile" block; see
// docs/tailwind-plus-sources.md.

const DASH = "—";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape a value for safe interpolation into HTML text or an attribute. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

// Per-column <td> classes from the block. Order matches the <thead> in
// index.html. The first column is the bold primary cell; later columns hide at
// the sm/lg breakpoints exactly as the block defines.
const ALWAYS = "px-3 py-4 text-sm whitespace-nowrap text-gray-500";
const SM = `hidden ${ALWAYS} sm:table-cell`;
const LG = `hidden ${ALWAYS} lg:table-cell`;

function text(value) {
  return value == null || value === "" ? DASH : escapeHtml(value);
}

function fullName(c) {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return name === "" ? DASH : escapeHtml(name);
}

// Only http(s) URLs become links (a `javascript:` URL would be an XSS vector);
// link text is the host so a 600-char query string can't blow out the layout.
function website(url) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return DASH;
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    return DASH;
  }
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-900">${escapeHtml(host)}</a>`;
}

export function renderRows(customers) {
  return customers
    .map(
      (c) => `<tr>
  <td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">${fullName(c)}</td>
  <td class="${ALWAYS}">${text(c.email)}</td>
  <td class="${SM}">${text(c.company)}</td>
  <td class="${SM}">${text(c.title)}</td>
  <td class="${LG}">${text(c.city)}</td>
  <td class="${LG}">${text(c.gender)}</td>
  <td class="${LG}">${text(c.ip_address)}</td>
  <td class="${LG}">${website(c.website)}</td>
</tr>`,
    )
    .join("");
}
