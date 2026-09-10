import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bold, Italic, Heading2, List, ImagePlus, AtSign } from "lucide-react";
import { IMAGE_PLACEHOLDERS, MANUAL_PLACEHOLDERS } from "@/lib/contractPlaceholders";

const ToolbarButton = ({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant={active ? "secondary" : "ghost"}
    size="icon"
    title={title}
    onClick={onClick}
    className="h-8 w-8"
  >
    {children}
  </Button>
);

const ContractEditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1.5">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <AtSign className="h-3.5 w-3.5" />
            Insert Placeholder
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {MANUAL_PLACEHOLDERS.filter((p) => p.kind !== "image").map((p) => (
            <DropdownMenuItem
              key={p.key}
              onClick={() => editor.chain().focus().insertPlaceholder(p.key).run()}
            >
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <ImagePlus className="h-3.5 w-3.5" />
            Insert Image Area
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {IMAGE_PLACEHOLDERS.map((p) => (
            <DropdownMenuItem
              key={p.key}
              onClick={() => editor.chain().focus().insertPlaceholder(p.key).run()}
            >
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="ml-auto text-xs text-muted-foreground">
        Type <kbd className="rounded border px-1">@</kbd> to insert a placeholder
      </span>
    </div>
  );
};

export default ContractEditorToolbar;
