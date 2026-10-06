import { Extension } from "@tiptap/core";

export type TextAlignment = "left" | "center" | "right" | "justify";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignment) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

// Block-level text alignment stored as a `textAlign` attribute on paragraphs
// and headings. Implemented in-house (no @tiptap/extension-text-align dep).
export const TextAlign = Extension.create({
  name: "textAlign",

  addOptions() {
    return { types: ["heading", "paragraph"] as string[] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) =>
              attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) =>
          (this.options.types as string[])
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .some(Boolean),
      unsetTextAlign:
        () =>
        ({ commands }) =>
          (this.options.types as string[])
            .map((type) => commands.updateAttributes(type, { textAlign: null }))
            .some(Boolean),
    };
  },
});
