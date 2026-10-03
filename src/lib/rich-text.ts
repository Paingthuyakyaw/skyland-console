export function isEmptyHtml(html: string) {
  return (
    html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]+>/g, "")
      .trim().length === 0
  )
}

const HTML_TAG = /<\/?[a-z][\s\S]*>/i
const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "DIV",
  "SPAN",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "DEL",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "A",
  "PRE",
  "CODE",
  "HR",
  "SUP",
  "SUB",
  "FIGURE",
  "FIGCAPTION",
  "SECTION",
  "ARTICLE",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "TH",
  "TD",
  "CAPTION",
  "IMG",
  "VIDEO",
  "SOURCE",
])
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  A: ["href", "name"],
  IMG: ["src", "alt", "title"],
  VIDEO: ["src", "controls", "poster"],
  SOURCE: ["src", "type"],
  TH: ["colspan", "rowspan"],
  TD: ["colspan", "rowspan"],
}

function safeUrl(value: string, allowContact: boolean) {
  const schemes = allowContact
    ? /^(https?:\/\/|mailto:|tel:)/i
    : /^https?:\/\//i
  return schemes.test(value.trim()) || /^\/(?!\/)/.test(value.trim())
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function richTextFromItems(items: string[]) {
  const values = items.filter((value) => value.trim())
  if (values.length === 1 && HTML_TAG.test(values[0])) return values[0]
  return values
    .map((value) =>
      HTML_TAG.test(value)
        ? value
        : `<p>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`
    )
    .join("")
}

export function sanitizeRichText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  for (const node of Array.from(doc.body.querySelectorAll("*"))) {
    if (
      ["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH"].includes(
        node.tagName
      )
    ) {
      node.remove()
      continue
    }
    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...node.childNodes)
      continue
    }
    const attributes = Array.from(node.attributes)
    for (const attribute of attributes) node.removeAttribute(attribute.name)
    for (const attribute of attributes) {
      if (!ALLOWED_ATTRIBUTES[node.tagName]?.includes(attribute.name)) continue
      if (
        ["src", "href", "poster"].includes(attribute.name) &&
        !safeUrl(attribute.value, node.tagName === "A")
      )
        continue
      node.setAttribute(attribute.name, attribute.value)
    }
    if (node.tagName === "A" && node.hasAttribute("href")) {
      node.setAttribute("rel", "noopener noreferrer")
      node.setAttribute("target", "_blank")
    }
  }
  return doc.body.innerHTML
}

export function richTextPlainText(items: string[]) {
  const doc = new DOMParser().parseFromString(
    sanitizeRichText(richTextFromItems(items)),
    "text/html"
  )
  for (const node of Array.from(
    doc.body.querySelectorAll("p, div, li, br, h2, h3")
  ))
    node.append(" ")
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim()
}
