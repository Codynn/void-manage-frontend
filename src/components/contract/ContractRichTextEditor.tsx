import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { PlaceholderNode } from "./tiptap/placeholderNode";
import { FontSize } from "./tiptap/fontSizeMark";
import { SignatureRow } from "./tiptap/signatureRowNode";
import { TextAlign } from "./tiptap/textAlign";
import ContractEditorToolbar from "./ContractEditorToolbar";
import { ContractPlaceholderProvider } from "./ContractPlaceholderContext";
import { CONTRACT_CONTENT_CLASS } from "@/lib/contractEditorStyles";

interface Props {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
}

const ContractRichTextEditor = ({ content, onChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, PlaceholderNode, FontSize, SignatureRow, TextAlign],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          `min-h-[400px] p-4 focus:outline-none ${CONTRACT_CONTENT_CLASS}`,
      },
    },
  });

  // Keep editor content in sync if `content` is replaced from outside (e.g. loading edit data)
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, content]);

  return (
    <div className="overflow-hidden rounded-md border">
      <ContractEditorToolbar editor={editor} />
      <ContractPlaceholderProvider value={{ mode: "template", values: {} }}>
        <EditorContent editor={editor} />
      </ContractPlaceholderProvider>
    </div>
  );
};

export default ContractRichTextEditor;
