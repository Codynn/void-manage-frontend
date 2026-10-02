import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadFile } from "@/services/api/documents.api";
import { useContractPlaceholder } from "../ContractPlaceholderContext";
import type { SignatureColumn } from "./signatureRowNode";

const emptyColumn = (mode: SignatureColumn["mode"]): SignatureColumn =>
  mode === "fixed"
    ? { mode: "fixed", name: "", designation: "", imageUrl: "" }
    : { mode: "fillable", name: "", designation: "", placeholderKey: "signatureImage" };

const SignatureRowNodeView = ({ node, updateAttributes, editor }: NodeViewProps) => {
  const columns = (node.attrs.columns || []) as SignatureColumn[];
  const { mode, values, onImageSelect } = useContractPlaceholder();
  const { mutateAsync: uploadFile } = useUploadFile();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fillInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setColumns = (next: SignatureColumn[]) => updateAttributes({ columns: next });
  const updateColumn = (index: number, patch: Partial<SignatureColumn>) =>
    setColumns(columns.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const addColumn = () => setColumns([...columns, emptyColumn("fixed")]);
  const removeColumn = (index: number) => setColumns(columns.filter((_, i) => i !== index));

  const handleFixedImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await uploadFile(formData);
      updateColumn(index, { imageUrl: uploaded.url });
    } finally {
      setUploadingIndex(null);
    }
  };

  // ----- Authoring: full editing controls (only in the real, editable editor) -----
  if (editor.isEditable) {
    return (
      <NodeViewWrapper
        className="my-3 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3"
        contentEditable={false}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-primary">Signature Row</span>
          <Button type="button" size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={addColumn}>
            <Plus className="h-3 w-3" />
            Add Column
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {columns.map((col, index) => (
            <div key={index} className="min-w-[160px] flex-1 space-y-2 rounded border bg-white p-2">
              <div className="flex items-center justify-between gap-1">
                <Select
                  value={col.mode}
                  onValueChange={(v) =>
                    updateColumn(
                      index,
                      v === "fixed"
                        ? { mode: "fixed", imageUrl: col.imageUrl || "" }
                        : { mode: "fillable", placeholderKey: "signatureImage" }
                    )
                  }
                >
                  <SelectTrigger className="h-7 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Signature</SelectItem>
                    <SelectItem value="fillable">Intern Signs</SelectItem>
                  </SelectContent>
                </Select>
                {columns.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-red-700"
                    onClick={() => removeColumn(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {col.mode === "fixed" ? (
                <div className="flex h-14 items-center justify-center rounded border border-dashed bg-muted/40">
                  {col.imageUrl ? (
                    <img src={col.imageUrl} alt="" className="h-full object-contain" />
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingIndex === index ? "Uploading..." : "Upload signature"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFixedImageUpload(index, file);
                        }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="flex h-14 items-center justify-center rounded border border-dashed bg-muted/40 text-[10px] text-muted-foreground">
                  <ImageIcon className="mr-1 h-3.5 w-3.5" />
                  Filled by intern
                </div>
              )}

              {col.mode === "fillable" ? (
                <p className="text-[10px] italic text-muted-foreground">
                  Name shown here is the signer's name automatically
                </p>
              ) : (
                <Input
                  placeholder="Name"
                  value={col.name}
                  onChange={(e) => updateColumn(index, { name: e.target.value })}
                  className="h-7 text-xs"
                />
              )}
              <Input
                placeholder="Designation"
                value={col.designation}
                onChange={(e) => updateColumn(index, { designation: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
          ))}
        </div>
      </NodeViewWrapper>
    );
  }

  // ----- Template preview (read-only mirror, no real data yet) -----
  if (mode === "template") {
    return (
      <NodeViewWrapper className="my-3 flex flex-wrap gap-6" contentEditable={false}>
        {columns.map((col, index) => (
          <div key={index} className="flex min-w-[120px] flex-1 flex-col items-center gap-1 text-center">
            <div className="flex h-12 w-full items-center justify-center rounded border border-dashed border-muted-foreground/40 text-[10px] text-muted-foreground">
              {col.mode === "fixed" ? (
                col.imageUrl ? (
                  <img src={col.imageUrl} alt="" className="h-full object-contain" />
                ) : (
                  "Signature"
                )
              ) : (
                "Intern signs here"
              )}
            </div>
            <div className="w-full border-t pt-1 text-xs font-medium">
              {col.mode === "fillable" ? "(Signer's Name)" : col.name || " "}
            </div>
            <div className="text-[11px] text-muted-foreground">{col.designation || " "}</div>
          </div>
        ))}
      </NodeViewWrapper>
    );
  }

  // ----- Fill mode: real signed/fillable contract instance -----
  return (
    <NodeViewWrapper className="my-3 flex flex-wrap gap-6" contentEditable={false}>
      {columns.map((col, index) => {
        if (col.mode === "fixed") {
          return (
            <div key={index} className="flex min-w-[120px] flex-1 flex-col items-center gap-1 text-center">
              <div className="flex h-14 w-full items-center justify-center">
                {col.imageUrl && (
                  <img src={col.imageUrl} alt={col.name} className="h-full max-w-[10rem] object-contain" />
                )}
              </div>
              <div className="w-full border-t pt-1 text-xs font-medium">{col.name}</div>
              <div className="text-[11px] text-muted-foreground">{col.designation}</div>
            </div>
          );
        }

        const key = col.placeholderKey || "signatureImage";
        const value = values[key];
        const interactive = !value && !!onImageSelect;

        return (
          <div key={index} className="flex min-w-[120px] flex-1 flex-col items-center gap-1 text-center">
            {value ? (
              <img src={value} alt={col.name || "Signature"} className="h-14 max-w-[10rem] object-contain" />
            ) : interactive ? (
              <>
                <button
                  type="button"
                  onClick={() => fillInputRefs.current[index]?.click()}
                  className="flex h-14 w-full items-center justify-center rounded border-2 border-dashed border-muted-foreground/40 text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <ImageIcon className="mr-1 h-3 w-3" />
                  Click to sign
                </button>
                <input
                  ref={(el) => {
                    fillInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelect?.(key, file);
                  }}
                />
              </>
            ) : (
              <div className="flex h-14 w-full items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                Pending
              </div>
            )}
            {/* Fillable columns show the actual signer's name, not the
                static template text - that's per-instance data, resolved
                the same way the username placeholder already is. */}
            <div className="w-full border-t pt-1 text-xs font-medium">
              {values.username || col.name}
            </div>
            <div className="text-[11px] text-muted-foreground">{col.designation}</div>
          </div>
        );
      })}
    </NodeViewWrapper>
  );
};

export default SignatureRowNodeView;
