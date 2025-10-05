import { useState, useEffect, useRef } from 'react';
import { Page } from '@/services/storage';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  CheckSquare,
  Smile,
  Image,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PageEditorProps {
  page: Page;
  onUpdate: (page: Page) => void;
}

export const PageEditor = ({ page, onUpdate }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = page.content;
    }
  }, [page.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...page, title: newTitle, updatedAt: Date.now() });
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onUpdate({ ...page, content: newContent, updatedAt: Date.now() });
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const insertCheckbox = () => {
    const checkbox = '<input type="checkbox" class="mr-2 align-middle" />';
    document.execCommand('insertHTML', false, checkbox);
    handleContentChange();
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="max-w-[900px] mx-auto px-24 py-16">
        {/* Action buttons above title */}
        <div className="flex items-center gap-3 mb-4 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-sm hover:bg-accent"
          >
            <Smile className="h-4 w-4 mr-1.5" />
            Add icon
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-sm hover:bg-accent"
          >
            <Image className="h-4 w-4 mr-1.5" />
            Add cover
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-sm hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Add comment
          </Button>
        </div>

        {/* Page Title */}
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="text-[40px] font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-2 h-auto py-1"
        />

        {/* Content Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="editor-content min-h-[500px] outline-none text-base leading-relaxed"
          data-placeholder="Write, press 'space' for AI, '/' for commands..."
          suppressContentEditableWarning
        />

        {/* Formatting Toolbar - Hidden by default, could be shown on selection */}
        <div className="hidden items-center gap-1 p-1 bg-card rounded-lg shadow-lg border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('bold')}
            className="h-7 w-7 p-0"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('italic')}
            className="h-7 w-7 p-0"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h1>')}
            className="h-7 w-7 p-0"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h2>')}
            className="h-7 w-7 p-0"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h3>')}
            className="h-7 w-7 p-0"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('insertUnorderedList')}
            className="h-7 w-7 p-0"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('insertOrderedList')}
            className="h-7 w-7 p-0"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCheckbox}
            className="h-7 w-7 p-0"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </Button>
           </div>
      </div>
    </div>
  );
};
