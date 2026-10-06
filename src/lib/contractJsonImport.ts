import type { JSONContent } from "@tiptap/react";
import { CONTRACT_PLACEHOLDERS } from "./contractPlaceholders";
import { DEFAULT_CONTRACT_LAYOUT, type ContractLayout } from "@/components/contract/LetterheadCanvas";

// Human-friendly JSON format for pasting whole contract pages at once:
//
// {
//   "pages": [
//     {
//       "layout": { "x": 5, "y": 8, "width": 90, "height": 80 },   // optional
//       "blocks": [
//         { "type": "heading", "level": 2, "text": "Title {{username}}" },
//         { "type": "paragraph", "align": "center", "text": "Starts {{startDate}}" },
//         { "type": "paragraph", "runs": ["Plain ", { "text": "bold", "bold": true, "size": "18px" }] },
//         { "type": "bulletList", "items": ["one", "two {{jobTitle}}"] },
//         { "type": "orderedList", "items": ["first", "second"] },
//         { "type": "signatureRow", "columns": [ ... ] }
//       ]
//     }
//   ]
// }
//
// Inline placeholders are written as {{key}} inside any text. Keys starting
// with "_" at the top level are ignored (used for notes in the sample).

export interface ImportedContractPage {
  content: JSONContent;
  layout: ContractLayout;
}

export type ContractJsonParseResult =
  | { pages: ImportedContractPage[]; errors?: undefined }
  | { pages?: undefined; errors: string[] };

const PLACEHOLDER_KEYS = CONTRACT_PLACEHOLDERS.map((p) => p.key);
const PLACEHOLDER_SET = new Set(PLACEHOLDER_KEYS);
const TOKEN_RE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const ALIGNMENTS = ["left", "center", "right", "justify"];
const BLOCK_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "signatureRow"];

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const textToInline = (text: string, path: string, errors: string[]): JSONContent[] => {
  const nodes: JSONContent[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push({ type: "text", text: text.slice(last, index) });
    const key = match[1];
    if (PLACEHOLDER_SET.has(key)) {
      nodes.push({ type: "placeholder", attrs: { key } });
    } else {
      errors.push(`${path}: unknown placeholder "{{${key}}}". Valid keys: ${PLACEHOLDER_KEYS.join(", ")}`);
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
};

const runsToInline = (runs: unknown[], path: string, errors: string[]): JSONContent[] => {
  const nodes: JSONContent[] = [];
  runs.forEach((run, i) => {
    const runPath = `${path}.runs[${i}]`;
    if (typeof run === "string") {
      nodes.push(...textToInline(run, runPath, errors));
      return;
    }
    if (!isObject(run)) {
      errors.push(`${runPath}: expected a string or an object`);
      return;
    }
    if (typeof run.placeholder === "string") {
      if (PLACEHOLDER_SET.has(run.placeholder)) {
        nodes.push({ type: "placeholder", attrs: { key: run.placeholder } });
      } else {
        errors.push(`${runPath}: unknown placeholder "${run.placeholder}". Valid keys: ${PLACEHOLDER_KEYS.join(", ")}`);
      }
      return;
    }
    if (typeof run.text !== "string") {
      errors.push(`${runPath}: needs "text" or "placeholder"`);
      return;
    }
    const marks: JSONContent["marks"] = [];
    if (run.bold) marks.push({ type: "bold" });
    if (run.italic) marks.push({ type: "italic" });
    if (typeof run.size === "string") marks.push({ type: "fontSize", attrs: { size: run.size } });
    for (const node of textToInline(run.text, runPath, errors)) {
      nodes.push(marks.length ? { ...node, marks } : node);
    }
  });
  return nodes;
};

const inlineOf = (block: Record<string, any>, path: string, errors: string[]): JSONContent[] => {
  if (Array.isArray(block.runs)) return runsToInline(block.runs, path, errors);
  if (typeof block.text === "string") return textToInline(block.text, path, errors);
  return [];
};

const alignAttrs = (block: Record<string, any>, path: string, errors: string[]) => {
  if (block.align === undefined) return null;
  if (!ALIGNMENTS.includes(block.align)) {
    errors.push(`${path}: "align" must be one of ${ALIGNMENTS.join(", ")}`);
    return null;
  }
  return { textAlign: block.align };
};

const listNode = (type: "bulletList" | "orderedList", block: Record<string, any>, path: string, errors: string[]): JSONContent => {
  const items: unknown[] = Array.isArray(block.items) ? block.items : [];
  if (!items.length) errors.push(`${path}: "items" must be a non-empty array`);
  return {
    type,
    content: items.map((item, i) => {
      const itemPath = `${path}.items[${i}]`;
      const itemBlock = typeof item === "string" ? { text: item } : isObject(item) ? item : {};
      return {
        type: "listItem",
        content: [{ type: "paragraph", content: inlineOf(itemBlock, itemPath, errors) }],
      };
    }),
  };
};

const signatureRowNode = (block: Record<string, any>, path: string, errors: string[]): JSONContent | null => {
  if (!Array.isArray(block.columns) || block.columns.length === 0) {
    errors.push(`${path}: "columns" must be a non-empty array`);
    return null;
  }
  const columns = block.columns.map((col: unknown, i: number) => {
    const colPath = `${path}.columns[${i}]`;
    if (!isObject(col)) {
      errors.push(`${colPath}: expected an object`);
      return null;
    }
    const name = typeof col.name === "string" ? col.name : "";
    const designation = typeof col.designation === "string" ? col.designation : "";
    if (col.mode === "fixed") {
      return { mode: "fixed", name, designation, imageUrl: typeof col.imageUrl === "string" ? col.imageUrl : "" };
    }
    if (col.mode === "fillable") {
      return { mode: "fillable", name, designation, placeholderKey: "signatureImage" };
    }
    errors.push(`${colPath}: "mode" must be "fixed" or "fillable"`);
    return null;
  });
  if (columns.includes(null)) return null;
  return { type: "signatureRow", attrs: { columns } };
};

const blockToNode = (block: unknown, path: string, errors: string[]): JSONContent | null => {
  if (!isObject(block)) {
    errors.push(`${path}: expected an object`);
    return null;
  }
  switch (block.type) {
    case "paragraph": {
      const attrs = alignAttrs(block, path, errors);
      const content = inlineOf(block, path, errors);
      return { type: "paragraph", ...(attrs ? { attrs } : {}), ...(content.length ? { content } : {}) };
    }
    case "heading": {
      const level = [1, 2, 3].includes(block.level) ? block.level : 2;
      const attrs = { level, ...(alignAttrs(block, path, errors) ?? {}) };
      return { type: "heading", attrs, content: inlineOf(block, path, errors) };
    }
    case "bulletList":
    case "orderedList":
      return listNode(block.type, block, path, errors);
    case "signatureRow":
      return signatureRowNode(block, path, errors);
    default:
      errors.push(`${path}: unknown block type "${block.type}". Valid types: ${BLOCK_TYPES.join(", ")}`);
      return null;
  }
};

const layoutOf = (value: unknown, path: string, errors: string[]): ContractLayout => {
  if (value === undefined) return DEFAULT_CONTRACT_LAYOUT;
  if (!isObject(value)) {
    errors.push(`${path}.layout: expected {x, y, width, height}`);
    return DEFAULT_CONTRACT_LAYOUT;
  }
  const fields = ["x", "y", "width", "height"] as const;
  const bad = fields.filter((f) => typeof value[f] !== "number" || !Number.isFinite(value[f]));
  if (bad.length) {
    errors.push(`${path}.layout: ${bad.join(", ")} must be numbers`);
    return DEFAULT_CONTRACT_LAYOUT;
  }
  return { x: value.x, y: value.y, width: value.width, height: value.height };
};

export const parseContractPagesJson = (raw: string): ContractJsonParseResult => {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return { errors: [`Invalid JSON: ${(error as Error).message}`] };
  }

  const pagesRaw = Array.isArray(data) ? data : isObject(data) ? data.pages : undefined;
  if (!Array.isArray(pagesRaw) || pagesRaw.length === 0) {
    return { errors: ['Expected a "pages" array with at least one page'] };
  }

  const errors: string[] = [];
  const pages: ImportedContractPage[] = pagesRaw.map((page, i) => {
    const path = `pages[${i}]`;
    if (!isObject(page) || !Array.isArray(page.blocks)) {
      errors.push(`${path}: needs a "blocks" array`);
      return { content: { type: "doc", content: [{ type: "paragraph" }] }, layout: DEFAULT_CONTRACT_LAYOUT };
    }
    const nodes = page.blocks
      .map((block: unknown, j: number) => blockToNode(block, `${path}.blocks[${j}]`, errors))
      .filter((node: JSONContent | null): node is JSONContent => node !== null);
    return {
      content: { type: "doc", content: nodes.length ? nodes : [{ type: "paragraph" }] },
      layout: layoutOf(page.layout, path, errors),
    };
  });

  return errors.length ? { errors } : { pages };
};

const SAMPLE_PLACEHOLDER_NOTES = CONTRACT_PLACEHOLDERS.map(
  (p) => `${p.key} (${p.kind}${p.auto ? ", filled automatically" : ", filled per intern/certificate"})`
);

export const buildSampleContractJson = () => ({
  _help:
    "Paste this structure into the Bulk Paste JSON dialog. Put placeholders inside any text as {{key}}. Use runs for bold/italic/size, align for left/center/right/justify. Delete any _ keys before importing if you want, they are ignored.",
  _placeholderKeys: SAMPLE_PLACEHOLDER_NOTES,
  _blockTypes: BLOCK_TYPES,
  pages: [
    {
      layout: { x: 6, y: 14, width: 88, height: 70 },
      blocks: [
        { type: "heading", level: 2, align: "center", text: "INTERNSHIP AGREEMENT" },
        {
          type: "paragraph",
          text: "This agreement is entered into on {{signedAtDate}} between {{userFullName}} ({{username}}, {{userEmail}}) of {{userAddress}}, and the Company.",
        },
        {
          type: "paragraph",
          align: "justify",
          runs: [
            "The Intern will work as ",
            { text: "{{jobTitle}}", bold: true },
            " in the {{department}} department for the position of ",
            { text: "{{internshipTitle}}", italic: true, size: "14px" },
          ],
        },
        { type: "paragraph", text: "Start date: {{startDate}}. End date: {{endDate}}." },
        { type: "paragraph", text: "Required working hours: {{requiredWorkingHours}}. Weekly hours: {{weeklyHoursRequired}}. Total days: {{totalDays}}." },
        { type: "paragraph", text: "Mentor: {{mentorName}}." },
        { type: "heading", level: 3, text: "Terms" },
        {
          type: "bulletList",
          items: [
            "The Intern follows Company policies.",
            "Working hours are tracked through check-in/check-out.",
            "Leave is governed by the assigned leave policy.",
          ],
        },
        {
          type: "orderedList",
          items: ["Confidentiality applies for the full term.", "Either party may end the agreement with notice."],
        },
        { type: "paragraph", align: "right", text: "Signed on {{signedAtDate}}" },
        {
          type: "signatureRow",
          columns: [
            { mode: "fixed", name: "Hari Sharma", designation: "Head of HR", imageUrl: "" },
            { mode: "fillable", designation: "Intern" },
          ],
        },
      ],
    },
    {
      blocks: [
        { type: "heading", level: 2, text: "Page 2 - Continued" },
        { type: "paragraph", align: "center", text: "Signature for the Company" },
        {
          type: "signatureRow",
          columns: [
            { mode: "fixed", name: "Sita Rai", designation: "Director", imageUrl: "" },
            { mode: "fixed", name: "Ram Thapa", designation: "Mentor", imageUrl: "" },
            { mode: "fillable", designation: "Intern" },
          ],
        },
      ],
    },
  ],
});
