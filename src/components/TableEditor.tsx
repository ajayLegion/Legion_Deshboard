import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  ImageIcon,
  Link,
  Code,
  Table,
  Minus,
} from "lucide-react";

interface SlashMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applyFormat: (command: string, value?: string) => void;
  insertBlockquote: () => void;
  insertCheckbox: () => void;
  insertImage: () => void;
  insertLink: () => void;
  insertCodeBlock: () => void;
  insertTable: () => void;
  insertHorizontalRule: () => void;
  triggerAI: () => void;
  aiLoading?: boolean;
}

export const SlashMenuDialog: React.FC<SlashMenuDialogProps> = ({
  open,
  onOpenChange,
  applyFormat,
  insertBlockquote,
  insertCheckbox,
  insertImage,
  insertLink,
  insertCodeBlock,
  insertTable,
  insertHorizontalRule,
  triggerAI,
  aiLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Insert Block</DialogTitle>
        </DialogHeader>

        {/* --- Basic Blocks --- */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            Basic Blocks
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                applyFormat("formatBlock", "<h1>");
                onOpenChange(false);
              }}
            >
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                applyFormat("formatBlock", "<h2>");
                onOpenChange(false);
              }}
            >
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                applyFormat("formatBlock", "<h3>");
                onOpenChange(false);
              }}
            >
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertBlockquote();
                onOpenChange(false);
              }}
            >
              <Quote className="h-4 w-4 mr-2" /> Quote
            </Button>
          </div>
        </div>

        {/* --- Lists --- */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            Lists
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                applyFormat("insertUnorderedList");
                onOpenChange(false);
              }}
            >
              <List className="h-4 w-4 mr-2" /> Bullet List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                applyFormat("insertOrderedList");
                onOpenChange(false);
              }}
            >
              <ListOrdered className="h-4 w-4 mr-2" /> Numbered List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertCheckbox();
                onOpenChange(false);
              }}
            >
              <CheckSquare className="h-4 w-4 mr-2" /> To-do List
            </Button>
          </div>
        </div>

        {/* --- Media & Advanced --- */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            Media & Advanced
          </div>
          <div className="grid grid-cols-2 gap-1 text-sm mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertImage();
                onOpenChange(false);
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertLink();
                onOpenChange(false);
              }}
            >
              <Link className="h-4 w-4 mr-2" /> Link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertCodeBlock();
                onOpenChange(false);
              }}
            >
              <Code className="h-4 w-4 mr-2" /> Code Block
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertTable();
                onOpenChange(false);
              }}
            >
              <Table className="h-4 w-4 mr-2" /> Table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start"
              onClick={() => {
                insertHorizontalRule();
                onOpenChange(false);
              }}
            >
              <Minus className="h-4 w-4 mr-2" /> Divider
            </Button>
          </div>
        </div>

        {/* --- AI Section --- */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            AI
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 justify-start w-full"
            onClick={() => {
              triggerAI();
              onOpenChange(false);
            }}
            disabled={aiLoading}
          >
            🤖 AI Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
