import { forwardRef, useEffect } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PlaceholderNode } from "./tiptap/placeholderNode";
import { FontSize } from "./tiptap/fontSizeMark";
import { SignatureRow } from "./tiptap/signatureRowNode";
import { TextAlign } from "./tiptap/textAlign";
import { CONTRACT_CONTENT_CLASS } from "@/lib/contractEditorStyles";
import LetterheadCanvas, {
  DEFAULT_CONTRACT_LAYOUT,
  type ContractLayout,
} from "./LetterheadCanvas";
import {
  ContractPlaceholderProvider,
  type PlaceholderRenderMode,
} from "./ContractPlaceholderContext";

interface Props {
  content: JSONContent | null;
  layout?: ContractLayout;
  editableLayout?: boolean;
  onLayoutChange?: (layout: ContractLayout) => void;
  mode: PlaceholderRenderMode;
  values?: Record<string, string | undefined>;
  onImageSelect?: (key: string, file: File) => void;
  watermark?: boolean;
}

// Read-only, letterhead-positioned render of a contract document.
// Used for: admin's live preview while authoring, the template view dialog,
// and the intern's fill/sign/export view.
const ContractDocumentPreview = forwardRef<HTMLDivElement, Props>(
  (
    {
      content,
      layout = DEFAULT_CONTRACT_LAYOUT,
      editableLayout,
      onLayoutChange,
      mode,
      values = {},
      onImageSelect,
      watermark,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [StarterKit, PlaceholderNode, FontSize, SignatureRow, TextAlign],
      content: content || "",
      editable: false,
    });

    useEffect(() => {
      if (editor && content) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }, [editor, content]);

    return (
      <LetterheadCanvas
        ref={ref}
        layout={layout}
        editableLayout={editableLayout}
        onLayoutChange={onLayoutChange}
        watermark={watermark}
      >
        <ContractPlaceholderProvider value={{ mode, values, onImageSelect }}>
          <div className={`p-4 text-[13px] ${CONTRACT_CONTENT_CLASS}`}>
            <EditorContent editor={editor} />
          </div>
        </ContractPlaceholderProvider>
      </LetterheadCanvas>
    );
  }
);

ContractDocumentPreview.displayName = "ContractDocumentPreview";

export default ContractDocumentPreview;
