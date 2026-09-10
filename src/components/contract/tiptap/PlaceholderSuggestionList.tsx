import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { PlaceholderDef } from "@/lib/contractPlaceholders";
import { ImageIcon, TypeIcon } from "lucide-react";

export interface PlaceholderSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Props {
  items: PlaceholderDef[];
  command: (item: { id: string }) => void;
}

const PlaceholderSuggestionList = forwardRef<PlaceholderSuggestionListRef, Props>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command({ id: item.key });
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-md border bg-popover p-2 text-sm text-muted-foreground shadow-md">
          No placeholders found
        </div>
      );
    }

    return (
      <div className="max-h-64 w-64 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
        {items.map((item, index) => (
          <button
            type="button"
            key={item.key}
            onClick={() => selectItem(index)}
            className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm cursor-pointer ${
              index === selectedIndex ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            {item.kind === "image" ? (
              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <TypeIcon className="h-3.5 w-3.5 shrink-0" />
            )}
            {item.label}
          </button>
        ))}
      </div>
    );
  }
);

PlaceholderSuggestionList.displayName = "PlaceholderSuggestionList";

export default PlaceholderSuggestionList;
