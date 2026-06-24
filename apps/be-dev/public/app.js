// Browser controller: asynchronously load a page of customers from the API and
// render it into the table. Pure rendering (and escaping) lives in render.js so
// it can be unit-tested in Node.
import { renderRows } from "./render.js";

const COLSPAN = 8;

const rows = document.getElementById("rows");
const status = document.getElementById("status");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const errorBox = document.getElementById("error");

// Start from ?page= in the URL so a page is shareable/bookmarkable.
let page = Math.max(1, Number(new URLSearchParams(location.search).get("page")) || 1);

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  rows.setAttribute("aria-busy", "false");
}

function messageRow(message) {
  rows.innerHTML = `<tr><td colspan="${COLSPAN}" class="px-3 py-8 text-center text-sm text-gray-500">${message}</td></tr>`;
}

async function load() {
  errorBox.hidden = true;
  rows.setAttribute("aria-busy", "true");
  prev.disabled = true;
  next.disabled = true;

  let body;
  try {
    const res = await fetch(`/api/customers?page=${page}&pageSize=25`);
    body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status}).`);
  } catch (cause) {
    showError(`Could not load customers: ${cause.message}`);
    messageRow("Failed to load.");
    return;
  }

  if (body.data.length === 0) {
    messageRow("No customers on this page.");
  } else {
    rows.innerHTML = renderRows(body.data);
  }

  if (body.data.length === 0) {
    status.textContent = `No results on this page · ${body.total} total`;
  } else {
    const from = (body.page - 1) * body.pageSize + 1;
    const to = from + body.data.length - 1;
    status.textContent = `Showing ${from}–${to} of ${body.total} · page ${body.page} of ${body.totalPages}`;
  }

  prev.disabled = !body.hasPrev;
  next.disabled = !body.hasNext;
  rows.setAttribute("aria-busy", "false");

  // Reflect the current page in the URL without reloading.
  const url = new URL(location.href);
  url.searchParams.set("page", String(body.page));
  history.replaceState({}, "", url);
}

prev.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    load();
  }
});
next.addEventListener("click", () => {
  page += 1;
  load();
});

load();
