import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link,
  Table,
  Minus,
} from "lucide-react";

interface ToolbarDialogProps {
  applyFormat: (command: string, value?: string) => void;
  insertInlineCode: () => void;
  insertCheckbox: () => void;
  insertBlockquote: () => void;
  insertLink: () => void;
  insertCodeBlock: () => void;
  insertTable: () => void;
  insertHorizontalRule: () => void;
    insertImage: () => void;
}

const ToolbarDialog: React.FC<ToolbarDialogProps> = ({
  applyFormat,
  insertInlineCode,
  insertCheckbox,
  insertBlockquote,
  insertLink,
  insertCodeBlock,
  insertTable,
  insertImage,
  insertHorizontalRule,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          Open Formatting Tools
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Formatting Tools</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap items-center gap-2 p-3 bg-card rounded-lg border shadow-sm">
          {/* Text Styles */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button variant="ghost" size="sm" onClick={() => applyFormat("bold")} title="Bold (Ctrl+B)">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyFormat("italic")} title="Italic (Ctrl+I)">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyFormat("strikethrough")} title="Strikethrough">
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertInlineCode} title="Inline Code (Ctrl+E)">
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button variant="ghost" size="sm" onClick={() => applyFormat("formatBlock", "<h1>")} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyFormat("formatBlock", "<h2>")} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyFormat("formatBlock", "<h3>")} title="Heading 3">
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button variant="ghost" size="sm" onClick={() => applyFormat("insertUnorderedList")} title="Bullet List">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyFormat("insertOrderedList")} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertCheckbox} title="Checkbox">
              <CheckSquare className="h-4 w-4" />
            </Button>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={insertBlockquote} title="Quote">
              <Quote className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertLink} title="Link (Ctrl+K)">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertCodeBlock} title="Code Block">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertTable} title="Table">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertHorizontalRule} title="Divider">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertImage} title="Image (Ctrl+Shift+I)">
                <img src="https://img.icons8.com/ios-glyphs/30/000000/image.png" alt="Image" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolbarDialog;
