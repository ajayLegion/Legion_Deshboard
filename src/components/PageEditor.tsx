import { useState, useEffect, useRef } from 'react';
import { Page } from '@/services/storage';
import { Smile,Image as ImageIcon,X, Upload} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ToolbarDialog from "@/components/ToolbarDialog";


// Inside your component's return:
interface PageEditorProps {
  page: Page & { icon?: string; cover?: string }; // Extend Page to include optional icon and cover
  onUpdate: (page: Page & { icon?: string; cover?: string }) => void;
}
// 1. Add Icon Modal Component (embedded)
const AddIconModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
}> = ({ isOpen, onClose, onSelectIcon }) => {
  const [search, setSearch] = useState('');
  const commonEmojis = [
    '','😀', '😂', '🤔', '👍', '❤️', '🔥', '📝', '💡', '🚀', '🌟',
    '📱', '💻', '📚', '🎯', '⚡', '🛡️', '🎨', '🔒', '📊', '🗓️',
  ].filter(emoji => !search || emoji.includes(search));

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Add Icon
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="mb-4"
        />
        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto mb-4">
          {commonEmojis.map((emoji, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-2xl"
              onClick={() => {
                onSelectIcon(emoji);
                onClose();
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};
// 2. Add Cover Modal Component (embedded)
const AddCoverModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddCover: (url: string) => void;
}> = ({ isOpen, onClose, onAddCover }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onAddCover(imageUrl);
        onClose();
      };
      reader.readAsDataURL(file);
    } else if (url) {
      onAddCover(url);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Add Cover
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste image URL..."
          className="mb-4"
        />
        <div className="flex items-center gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!url && !file} className="flex-1">
            Add Cover
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
export const PageEditor = ({ page, onUpdate }: PageEditorProps) => {
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon || '');
  const [cover, setCover] = useState(page.cover || '');
  const [content, setContent] = useState(page.content);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
// Modal states
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
 // Smart features states
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
   

  useEffect(() => {
    setTitle(page.title);
    setIcon(page.icon || '');
    setCover(page.cover || '');
    setContent(page.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = page.content;
    }
  }, [page.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ ...page, title: newTitle, updatedAt: Date.now() });
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    onUpdate({ ...page, icon: newIcon, updatedAt: Date.now() });
  };

  const handleCoverChange = (newCover: string) => {
    setCover(newCover);
    onUpdate({ ...page, cover: newCover, updatedAt: Date.now() });
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

  const insertImage = async () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = `<img src="${url}" alt="Image" class="max-w-full h-auto my-2 rounded-lg" />`;
      document.execCommand('insertHTML', false, img);
      handleContentChange();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      const text = window.getSelection()?.toString() || 'Link';
      const link = `<a href="${url}" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">${text}</a>`;
      document.execCommand('insertHTML', false, link);
      handleContentChange();
    }
  };

  const insertCodeBlock = () => {
    const code = '<pre class="bg-muted p-4 rounded-lg my-2 overflow-x-auto"><code contenteditable="true">// Your code here</code></pre>';
    document.execCommand('insertHTML', false, code);
    handleContentChange();
  };

  const insertInlineCode = () => {
    const selection = window.getSelection()?.toString() || 'code';
    const code = `<code class="bg-muted px-2 py-1 rounded text-sm font-mono">${selection}</code>`;
    document.execCommand('insertHTML', false, code);
    handleContentChange();
  };
   const insertTable = (tableHTML?: string) => {
    const table = tableHTML || `
      <table class="border-collapse border border-border my-4 w-full">
        <thead>
          <tr>
            <th class="border border-border px-4 py-2 bg-muted">Header 1</th>
            <th class="border border-border px-4 py-2 bg-muted">Header 2</th>
            <th class="border border-border px-4 py-2 bg-muted">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-border px-4 py-2">Cell 1</td>
            <td class="border border-border px-4 py-2">Cell 2</td>
            <td class="border border-border px-4 py-2">Cell 3</td>
          </tr>
          <tr>
            <td class="border border-border px-4 py-2">Cell 4</td>
            <td class="border border-border px-4 py-2">Cell 5</td>
            <td class="border border-border px-4 py-2">Cell 6</td>
          </tr>
        </tbody>
      </table>
    `;
    
    if (editorRef.current) {
      editorRef.current.focus();
      // Ensure focus is established before inserting
      requestAnimationFrame(() => {
        document.execCommand('insertHTML', false, table);
        handleContentChange();
      });
    }
  };
  const insertBlockquote = () => {
    applyFormat('formatBlock', '<blockquote>');
    editorRef.current?.querySelectorAll('blockquote').forEach((q) => {
      q.className = 'border-l-4 border-primary pl-4 italic my-2 text-muted-foreground';
    });
    handleContentChange();
  };

  const insertHorizontalRule = () => {
    const hr = '<hr class="my-4 border-t-2 border-muted" />';
    document.execCommand('insertHTML', false, hr);
    handleContentChange();
  };

  
  const convertMarkdownSyntax = (text: string) => {
    // Auto-convert markdown syntax
    if (text.endsWith('**') && text.length > 2) {
      const match = text.match(/\*\*([^*]+)\*\*$/);
      if (match) {
        const boldText = match[1];
        document.execCommand('insertHTML', false, `<strong>${boldText}</strong>`);
        return true;
      }
    }
    if (text.endsWith('*') && text.length > 1) {
      const match = text.match(/\*([^*]+)\*$/);
      if (match) {
        const italicText = match[1];
        document.execCommand('insertHTML', false, `<em>${italicText}</em>`);
        return true;
      }
    }
    if (text.endsWith('`') && text.length > 1) {
      const match = text.match(/`([^`]+)`$/);
      if (match) {
        const codeText = match[1];
        document.execCommand('insertHTML', false, `<code class="bg-muted px-2 py-1 rounded text-sm font-mono">${codeText}</code>`);
        return true;
      }
    }
    if (text.endsWith('~~') && text.length > 2) {
      const match = text.match(/~~([^~]+)~~$/);
      if (match) {
        const strikeText = match[1];
        document.execCommand('insertHTML', false, `<s>${strikeText}</s>`);
        return true;
      }
    }
    return false;
  };

  const triggerAI = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setAiLoading(false);
      return;
    }
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer as Text;
    const textBefore = textNode.textContent?.slice(0, range.startOffset).trim() || '';
    if (textBefore.length < 5) {
      setAiLoading(false);
      return;
    }

    try {
      // For xAI Grok API integration, get your API key from https://x.ai/api
      const apiKey = process.env.REACT_APP_XAI_API_KEY || 'your-xai-api-key-here';
      if (apiKey === 'your-xai-api-key-here') {
        console.warn('xAI API key not set. Using mock completion.');
        // Mock completion for testing
        const mockCompletion = ' This is a mock AI completion to continue your thought.';
        insertSuggestion(mockCompletion);
        return;
      }
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: `Complete the following text naturally: ${textBefore}` }],
          max_tokens: 100,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const completion = data.choices[0].message.content.trim();

      if (completion) {
        insertSuggestion(completion);
      }
    } catch (err) {
      console.error('AI completion error:', err);
      // Fallback: insert a placeholder
      document.execCommand('insertText', false, ' [AI suggestion unavailable]');
    } finally {
      setAiLoading(false);
    }
  };

  const insertSuggestion = (completion: string) => {
    const suggestSpan = document.createElement('span');
    suggestSpan.className = 'suggestion-text text-gray-400 italic inline';
    suggestSpan.textContent = completion;
    suggestSpan.contentEditable = 'false';
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(suggestSpan);
      setSuggestion(completion);
      setShowSuggestion(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const acceptSuggestion = () => {
    const span = editorRef.current?.querySelector('.suggestion-text');
    if (span) {
      span.classList.remove('suggestion-text', 'text-gray-400', 'italic');
      (span as HTMLElement).contentEditable = 'true';
      // Make it selectable
      const range = document.createRange();
      range.selectNodeContents(span);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setShowSuggestion(false);
    handleContentChange();
  };

  const rejectSuggestion = () => {
    const span = editorRef.current?.querySelector('.suggestion-text');
    if (span) {
      span.remove();
    }
    setShowSuggestion(false);
    handleContentChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Markdown keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        insertLink();
        return;
      }
      if (e.key === 'e') {
        e.preventDefault();
        insertInlineCode();
        return;
      }
    }

    if (e.key === '/') {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashPosition({
          top: rect.bottom + window.scrollY + 5,
          left: rect.left + window.scrollX,
        });
        setShowSlashMenu(true);
      }
      // Insert the / back
      document.execCommand('insertText', false, '/');
      return;
    }

    if (showSlashMenu && e.key !== '/') {
      setShowSlashMenu(false);
    }

    // Auto-convert markdown syntax on space
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer as Text;
        const text = textNode.textContent?.slice(0, range.startOffset) || '';
        
        if (convertMarkdownSyntax(text)) {
          e.preventDefault();
          return;
        }
      }
      
      if (!showSuggestion && !aiLoading) {
        setTimeout(triggerAI, 100);
      }
      return;
    }

    if (showSuggestion) {
      if (e.key === 'Enter') {
        e.preventDefault();
        acceptSuggestion();
        return;
      }
      if (e.key === 'Escape') {
        rejectSuggestion();
        return;
      }
      // Allow backspace to delete suggestion
      if (e.key === 'Backspace') {
        const span = editorRef.current?.querySelector('.suggestion-text');
        if (span && window.getSelection()?.focusOffset <= 0) {
          rejectSuggestion();
          return;
        }
      }
    }
  };

  const hideMenus = () => {
    setShowSlashMenu(false);
    if (showSuggestion) rejectSuggestion();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        hideMenus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal handlers
  const handleAddIcon = (newIcon: string) => {
    handleIconChange(newIcon);
  };

  const handleAddCover = (newCover: string) => {
    handleCoverChange(newCover);
  };


  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="max-w-[900px] mx-auto px-24 py-16 relative">
        {/* Page Cover - Notion-style */}
        {cover && (
          <div
            className=""
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 'auto',
              gridRowStart: 1,
              gridRowEnd: 'auto',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              alt=""
              src={cover}
              referrerPolicy="same-origin"
              style={{
                display: 'block',
                objectFit: 'cover',
                borderRadius: '0px',
                width: '100%',
                height: '30vh',
                maxHeight: '280px',
                opacity: 1,
                objectPosition: 'center 70%',
              }}
            />
          </div>
        )}
     {/* Page Icon - Notion-style */}
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-center h-[78px] w-[78px] rounded-[0.25em] flex-shrink-0 relative z-[1] ms-3 -mt-[42px] pointer-events-auto"
          aria-label={`${icon} Change page icon`}
          onClick={() => setShowIconModal(true)}
          onKeyDown={(e) => e.key === 'Enter' && setShowIconModal(true)}
          style={{ userSelect: 'none' }}
        >
          <div className="flex items-center justify-center h-[78px] w-[78px]">
            <div
              className="flex items-center justify-center h-[78px] w-[78px] text-[78px] leading-[1] -ms-[5px] text-gray-600 dark:text-gray-400"
              style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{icon}</span>
            </div>
          </div>
        </div>
 {/* Action buttons above title - Conditionally render Add icon if no icon */}
        <div className="flex items-center gap-3 mb-4 text-muted-foreground">
           <ToolbarDialog
  applyFormat={applyFormat}
  insertInlineCode={insertInlineCode}
  insertCheckbox={insertCheckbox}
  insertBlockquote={insertBlockquote}
  insertLink={insertLink}
  insertCodeBlock={insertCodeBlock}
  insertTable={insertTable}
  insertHorizontalRule={insertHorizontalRule}
/>

          {!icon && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-sm hover:bg-accent"
              onClick={() => setShowIconModal(true)}
            >
              <Smile className="h-4 w-4 mr-1.5" />
              Add icon
            </Button>
          )}
          {!cover && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-sm hover:bg-accent"
              onClick={() => setShowCoverModal(true)}
            >
              <ImageIcon className="h-4 w-4 mr-1.5" />
              Add cover
            </Button>

          )}

          
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
          onKeyDown={handleKeyDown}
          className="editor-content min-h-[500px] outline-none text-base leading-relaxed"
          data-placeholder="Type '/' for commands, or use markdown: **bold**, *italic*, `code`, ~~strikethrough~~"
          suppressContentEditableWarning
        />

        {/* Formatting Toolbar */}
      
       <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide"></div> <Button variant="ghost" size="sm" className="h-9 justify-start w-full" onClick={() => { triggerAI(); setShowSlashMenu(false); }} disabled={aiLoading} >AI</Button>
  
        {/* AI Suggestion Instructions (if active) */}
        {showSuggestion && (
          <div className="fixed bottom-4 right-4 bg-muted p-2 rounded-lg text-sm text-muted-foreground z-40">
            Press Enter to accept, Esc to reject
          </div>
        )}
        {/* Modals */}
        <AddIconModal isOpen={showIconModal} onClose={() => setShowIconModal(false)} onSelectIcon={handleAddIcon} />
        <AddCoverModal isOpen={showCoverModal} onClose={() => setShowCoverModal(false)} onAddCover={handleAddCover} />
      </div>
    </div>
  );
};