import { forwardRef, useImperativeHandle, useRef } from "react";
import type { JSONContent } from "@tiptap/react";
import ContractDocumentPreview from "./ContractDocumentPreview";
import type { ContractLayout } from "./LetterheadCanvas";
import type { PlaceholderRenderMode } from "./ContractPlaceholderContext";

export interface ContractPageData {
  content: JSONContent;
  layout: ContractLayout;
}

export interface ContractPagesPreviewHandle {
  getPageNodes: () => HTMLElement[];
}

interface Props {
  pages: ContractPageData[];
  mode: PlaceholderRenderMode;
  values?: Record<string, string | undefined>;
  onImageSelect?: (key: string, file: File) => void;
  watermark?: boolean;
}

// Renders every page of a multi-page contract, each on its own letterhead,
// and exposes the underlying DOM nodes so a parent can export/print all
// pages together (see exportNodesAsPdf/exportNodesAsPng).
const ContractPagesPreview = forwardRef<ContractPagesPreviewHandle, Props>(
  ({ pages, mode, values, onImageSelect, watermark }, ref) => {
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      getPageNodes: () => nodeRefs.current.filter((n): n is HTMLDivElement => !!n),
    }));

    return (
      <div className="space-y-6">
        {pages.map((page, index) => (
          <div key={index} className="space-y-1">
            {pages.length > 1 && (
              <p className="text-xs font-medium text-muted-foreground">
                Page {index + 1} of {pages.length}
              </p>
            )}
            <ContractDocumentPreview
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              content={page.content}
              layout={page.layout}
              mode={mode}
              values={values}
              onImageSelect={onImageSelect}
              watermark={watermark}
            />
          </div>
        ))}
      </div>
    );
  }
);

ContractPagesPreview.displayName = "ContractPagesPreview";

export default ContractPagesPreview;
