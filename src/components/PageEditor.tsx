import { useState, useEffect, useRef } from 'react';
import { Page } from '@/services/storage';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, CheckSquare } from 'lucide-react';
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
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="text-4xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-4"
        />

        <div className="flex items-center gap-1 mb-4 pb-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('formatBlock', '<h3>')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFormat('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCheckbox}
            title="Checkbox"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="editor-content min-h-[500px] outline-none"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
};
