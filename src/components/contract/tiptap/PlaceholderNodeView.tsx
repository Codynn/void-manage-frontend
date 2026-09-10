import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef } from "react";
import { ImageIcon } from "lucide-react";
import { getPlaceholderDef } from "@/lib/contractPlaceholders";
import { useContractPlaceholder } from "../ContractPlaceholderContext";

const PlaceholderNodeView = ({ node }: NodeViewProps) => {
  const key = node.attrs.key as string;
  const def = getPlaceholderDef(key);
  const { mode, values, onImageSelect } = useContractPlaceholder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const value = values[key];
  const label = def?.label ?? key;

  if (!def) {
    return (
      <NodeViewWrapper as="span" className="text-destructive underline decoration-wavy">
        Unknown placeholder: {key}
      </NodeViewWrapper>
    );
  }

  // Template authoring / preview mode: always show a labeled chip, never a fake value.
  if (mode === "template") {
    if (def.kind === "image") {
      return (
        <NodeViewWrapper
          as="span"
          className="inline-flex h-16 w-40 items-center justify-center gap-1 rounded border border-dashed border-primary/50 bg-primary/5 align-middle text-xs font-medium text-primary"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {label}
        </NodeViewWrapper>
      );
    }
    return (
      <NodeViewWrapper
        as="span"
        className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 align-middle text-sm font-medium text-primary"
      >
        {label}
      </NodeViewWrapper>
    );
  }

  // Fill mode: show the real (or pending) value.
  if (def.kind === "image") {
    const interactive = !value && !!onImageSelect;
    return (
      <NodeViewWrapper as="span" className="inline-block align-middle">
        {value ? (
          <img
            src={value}
            alt={label}
            className="inline-block h-16 max-w-[12rem] object-contain"
          />
        ) : interactive ? (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-40 cursor-pointer items-center justify-center gap-1 rounded border-2 border-dashed border-muted-foreground/40 bg-muted/40 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Click to attach {label.toLowerCase()}
            </button>
            <input
              ref={fileInputRef}
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
          <span className="flex h-16 w-40 items-center justify-center rounded border border-dashed border-muted-foreground/30 text-xs text-muted-foreground">
            {label} pending
          </span>
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="align-middle">
      {value || <span className="text-muted-foreground/60">[{label}]</span>}
    </NodeViewWrapper>
  );
};

export default PlaceholderNodeView;
