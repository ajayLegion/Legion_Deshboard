import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Palette,
  X,
  Plus,
} from "lucide-react";

interface ToolbarDialogProps {
  applyFormat: (command: string, value?: string) => void;
  insertInlineCode: () => void;
  insertCheckbox: () => void;
  insertBlockquote: () => void;
  insertLink: () => void;
  insertCodeBlock: () => void;
  insertTable: (html: string) => void;
  insertHorizontalRule: () => void;
}

// Table Dialog Component
const TableDialog: React.FC<{ onInsert: (html: string) => void }> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(5);

  const handleInsert = () => {
    const headerRow = hasHeaderRow ? `
      <thead>
        <tr class="bg-muted/30">
          ${Array(cols).fill(0).map((_, i) => `
          <th class="border-b border-r border-border p-3 text-left font-medium text-sm hover:bg-muted/50 transition-colors last:border-r-0" contenteditable="true" style="min-width: 150px;">
            Header ${i + 1}
          </th>
          `).join('')}
        </tr>
      </thead>
    ` : '';

    const bodyRows = Array(rows).fill(0).map((_, rowIdx) => `
      <tr class="hover:bg-muted/20 transition-colors">
        ${Array(cols).fill(0).map((_, colIdx) => `
        <td class="border-b border-r border-border p-3 text-sm last:border-r-0" contenteditable="true">
          Cell ${rowIdx * cols + colIdx + 1}
        </td>
        `).join('')}
      </tr>
    `).join('');

    const table = `
      <table class="w-full my-4 border-collapse rounded-lg overflow-hidden" style="border-spacing: 0;">
        ${headerRow}
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    `;
    
    onInsert(table);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Table">
          <Table className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-slate-800 border-slate-700">
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-slate-700">
          <Input
            type="text"
            placeholder="Search actions..."
            className="w-full bg-slate-700 text-white border-blue-500 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Menu Items */}
        <div className="py-2 max-h-96 overflow-y-auto">
          {/* Header Row Toggle */}
          <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <div className="flex items-center gap-3">
              <Table className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              <span className="text-sm text-white">Header row</span>
            </div>
            <Switch
              checked={hasHeaderRow}
              onCheckedChange={setHasHeaderRow}
            />
          </div>

          {/* Color */}
          <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              <span className="text-sm text-white">Color</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
          </div>

          {/* Insert Above */}
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            <span className="text-sm text-white">Insert above</span>
          </div>

          {/* Insert Below */}
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            <span className="text-sm text-white">Insert below</span>
          </div>

          {/* Duplicate */}
          <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <div className="flex items-center gap-3">
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              <span className="text-sm text-white">Duplicate</span>
            </div>
            <span className="text-xs text-slate-500">⌘D</span>
          </div>

          {/* Clear Contents */}
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <X className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            <span className="text-sm text-white">Clear contents</span>
          </div>

          {/* Delete */}
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded cursor-pointer group transition-colors">
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
            <span className="text-sm text-red-400 group-hover:text-red-300">Delete</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <div className="text-xs text-slate-500 mb-3 leading-relaxed">
            Last edited by Ajay Legion<br />
            Jul 18, 2025 at 6:29 PM
          </div>
          
          {/* Row and Column Inputs */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <Label className="text-xs text-slate-400 mb-1.5 font-medium">Rows</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="bg-slate-700 text-white border-slate-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-slate-400 mb-1.5 font-medium">Columns</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="bg-slate-700 text-white border-slate-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Insert Table
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ToolbarDialog: React.FC<ToolbarDialogProps> = ({
  applyFormat,
  insertInlineCode,
  insertCheckbox,
  insertBlockquote,
  insertLink,
  insertCodeBlock,
  insertTable,
  insertHorizontalRule,
}) => {
  const handleTableInsert = (tableHTML: string) => {
    insertTable(tableHTML);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          <Plus className="h-4 w-4"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tools</DialogTitle>
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
            
            {/* Integrated Table Dialog */}
            <TableDialog onInsert={handleTableInsert} />
            
            <Button variant="ghost" size="sm" onClick={insertHorizontalRule} title="Divider">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolbarDialog;