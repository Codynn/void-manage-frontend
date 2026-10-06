import { useState } from "react";
import { FileJson, Plus, Trash2 } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ContractRichTextEditor from "./ContractRichTextEditor";
import ContractDocumentPreview from "./ContractDocumentPreview";
import { DEFAULT_CONTRACT_LAYOUT, type ContractLayout } from "./LetterheadCanvas";
import BulkPasteJsonDialog from "./BulkPasteJsonDialog";

export interface ContractPageData {
  content: JSONContent;
  layout: ContractLayout;
}

export const EMPTY_PAGE_CONTENT: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export const createEmptyPage = (): ContractPageData => ({
  content: EMPTY_PAGE_CONTENT,
  layout: DEFAULT_CONTRACT_LAYOUT,
});

interface Props {
  pages: ContractPageData[];
  onChange: (pages: ContractPageData[]) => void;
}

// Authoring UI for a multi-page contract template: one editable page card per
// letterhead page, each with its own rich text editor and drag-positioned preview.
const ContractPagesEditor = ({ pages, onChange }: Props) => {
  const updatePage = (index: number, patch: Partial<ContractPageData>) => {
    onChange(pages.map((page, i) => (i === index ? { ...page, ...patch } : page)));
  };

  const [showBulkPaste, setShowBulkPaste] = useState(false);

  const addPage = () => onChange([...pages, createEmptyPage()]);

  const handleBulkImport = (imported: ContractPageData[], mode: "replace" | "append") => {
    onChange(mode === "replace" ? imported : [...pages, ...imported]);
  };
  const removePage = (index: number) => onChange(pages.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setShowBulkPaste(true)}>
          <FileJson className="h-4 w-4" />
          Bulk paste JSON
        </Button>
      </div>

      <BulkPasteJsonDialog
        open={showBulkPaste}
        onOpenChange={setShowBulkPaste}
        hasExistingPages={pages.some((p) => p.content?.content?.some((n: any) => n.type !== "paragraph" || n.content))}
        onImport={handleBulkImport}
      />

      {pages.map((page, index) => (
        <Card key={index} className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Page {index + 1}</h3>
            {pages.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:text-red-700"
                onClick={() => removePage(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Page
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ContractRichTextEditor
              content={page.content}
              onChange={(content) => updatePage(index, { content })}
            />
            <ContractDocumentPreview
              content={page.content}
              layout={page.layout}
              editableLayout
              onLayoutChange={(layout) => updatePage(index, { layout })}
              mode="template"
            />
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addPage} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Page
      </Button>
    </div>
  );
};

export default ContractPagesEditor;
