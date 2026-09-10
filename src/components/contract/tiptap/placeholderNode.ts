import { Node, mergeAttributes } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactNodeViewRenderer } from "@tiptap/react";
import PlaceholderNodeView from "./PlaceholderNodeView";
import { placeholderSuggestion } from "./placeholderSuggestion";

export interface PlaceholderNodeOptions {
  suggestion: typeof placeholderSuggestion;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    placeholder: {
      insertPlaceholder: (key: string) => ReturnType;
    };
  }
}

export const PlaceholderNode = Node.create<PlaceholderNodeOptions>({
  name: "placeholder",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      suggestion: placeholderSuggestion,
    };
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-placeholder-key"),
        renderHTML: (attributes) => ({
          "data-placeholder-key": attributes.key,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-placeholder-key]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlaceholderNodeView);
  },

  addCommands() {
    return {
      insertPlaceholder:
        (key: string) =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name, attrs: { key } })
            .run();
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
