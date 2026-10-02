import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SignatureRowNodeView from "./SignatureRowNodeView";

export interface SignatureColumn {
  mode: "fillable" | "fixed";
  name: string;
  designation: string;
  // fixed columns (e.g. HR, CEO): an image uploaded once at template-authoring
  // time, identical for every instance of the contract.
  imageUrl?: string;
  // fillable columns (e.g. the intern): resolved at fill time the same way
  // the inline signatureImage placeholder works. Always "signatureImage" in
  // practice today (the sign flow only collects one signature), kept as an
  // attribute so a future flow with multiple signers has somewhere to put it.
  placeholderKey?: string;
}

export const DEFAULT_SIGNATURE_COLUMNS: SignatureColumn[] = [
  { mode: "fixed", name: "", designation: "", imageUrl: "" },
  { mode: "fillable", name: "", designation: "", placeholderKey: "signatureImage" },
];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    signatureRow: {
      insertSignatureRow: () => ReturnType;
    };
  }
}

// A horizontal row of signature columns (e.g. "HR | Intern") placed as a
// block in the contract content. Each column is either a fixed signature
// (uploaded once by the admin while authoring) or a fillable one (the
// intern's own signature, collected at sign time) - with a name + designation
// shown below.
export const SignatureRow = Node.create({
  name: "signatureRow",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      columns: {
        default: DEFAULT_SIGNATURE_COLUMNS,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-columns");
          if (!raw) return DEFAULT_SIGNATURE_COLUMNS;
          try {
            return JSON.parse(raw);
          } catch {
            return DEFAULT_SIGNATURE_COLUMNS;
          }
        },
        renderHTML: (attributes) => ({
          "data-columns": JSON.stringify(attributes.columns),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-signature-row]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-signature-row": "true" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SignatureRowNodeView);
  },

  addCommands() {
    return {
      insertSignatureRow:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name, attrs: { columns: DEFAULT_SIGNATURE_COLUMNS } })
            .run();
        },
    };
  },
});
