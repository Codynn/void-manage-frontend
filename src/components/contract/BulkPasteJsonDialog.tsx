import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileJson } from "lucide-react";
import {
  buildSampleContractJson,
  parseContractPagesJson,
  type ImportedContractPage,
} from "@/lib/contractJsonImport";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasExistingPages: boolean;
  onImport: (pages: ImportedContractPage[], mode: "replace" | "append") => void;
}

const SAMPLE_JSON = JSON.stringify(buildSampleContractJson(), null, 2);

const BulkPasteJsonDialog = ({ open, onOpenChange, hasExistingPages, onImport }: Props) => {
  const [text, setText] = useState("");

  const result = useMemo(() => (text.trim() ? parseContractPagesJson(text) : null), [text]);
  const pageCount = result?.pages?.length ?? 0;

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contract-sample.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const apply = (mode: "replace" | "append") => {
    if (!result?.pages) return;
    onImport(result.pages, mode);
    setText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Bulk paste JSON
          </DialogTitle>
          <DialogDescription>
            Paste a JSON document with one or more pages. Each page has a list of blocks (paragraphs,
            headings, lists, signature rows). Placeholders go inside text as {"{{key}}"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={downloadSample}>
            <Download className="h-4 w-4" />
            Download sample JSON
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setText(SAMPLE_JSON)}>
            Load sample into box
          </Button>
        </div>

        <Textarea
          className="font-mono text-xs"
          rows={18}
          placeholder='{ "pages": [ { "blocks": [ { "type": "paragraph", "text": "Hello {{username}}" } ] } ] }'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {result?.errors && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="mb-1 font-medium">Fix these before importing:</p>
            <ul className="list-disc space-y-0.5 pl-5">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {result?.pages && (
          <p className="text-sm text-green-700">
            Ready: {pageCount} page{pageCount === 1 ? "" : "s"} parsed.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasExistingPages && (
            <Button variant="outline" disabled={!result?.pages} onClick={() => apply("append")}>
              Append {pageCount || ""} page{pageCount === 1 ? "" : "s"}
            </Button>
          )}
          <Button disabled={!result?.pages} onClick={() => apply("replace")}>
            {hasExistingPages ? "Replace all pages" : `Import ${pageCount || ""} page${pageCount === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPasteJsonDialog;
