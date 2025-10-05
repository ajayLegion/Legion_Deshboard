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
  Image as ImageIcon,
  MessageSquare,
  X,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PageEditorProps {
  page: Page;
  onUpdate: (page: Page) => void;
}

// 1. Add Icon Modal Component (embedded)
const AddIconModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
}> = ({ isOpen, onClose, onSelectIcon }) => {
  const [search, setSearch] = useState('');
  const commonEmojis = [
    '😀', '😂', '🤔', '👍', '❤️', '🔥', '📝', '💡', '🚀', '🌟',
    '📱', '💻', '📚', '🎯', '⚡', '🛡️', '🎨', '🔒', '📊', '🗓️'
  ].filter(emoji => !search || emoji.includes(search)); // Fixed filter

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

// 3. Add Comment Modal Component (embedded)
const AddCommentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (comment: string) => void;
}> = ({ isOpen, onClose, onAddComment }) => {
  const [comment, setComment] = useState('');

  const handleAdd = () => {
    if (comment.trim()) {
      onAddComment(comment);
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Comment
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[100px] mb-4"
        />
        <div className="flex gap-2">
          <Button onClick={handleAdd} disabled={!comment.trim()} className="flex-1">
            Add Comment
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
  const [content, setContent] = useState(page.content);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Smart features states
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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

  const insertImage = async () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = `<img src="${url}" alt="Image" class="max-w-full h-auto my-2" />`;
      document.execCommand('insertHTML', false, img);
      handleContentChange();
    }
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
      span.contentEditable = 'true';
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

    if (e.key === ' ' && !showSuggestion && !aiLoading) {
      // Trigger AI after space (debounce could be added)
      setTimeout(triggerAI, 100);
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
  const handleAddIcon = (icon: string) => {
    const newTitle = `${icon} ${title}`;
    setTitle(newTitle);
    onUpdate({ ...page, title: newTitle, updatedAt: Date.now() });
  };

  const handleAddCover = (url: string) => {
    // Insert cover image at the top of content
    const coverHtml = `<div class="cover-image mb-4"><img src="${url}" alt="Cover" class="w-full h-48 object-cover rounded" /></div>`;
    if (editorRef.current) {
      editorRef.current.innerHTML = coverHtml + editorRef.current.innerHTML;
      handleContentChange();
    }
  };

  const handleAddComment = (comment: string) => {
    // Insert a comment block
    const commentHtml = `<div class="comment bg-muted p-2 rounded my-2 text-sm"><strong>Comment:</strong> ${comment}</div>`;
    document.execCommand('insertHTML', false, commentHtml);
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
            onClick={() => setShowIconModal(true)}
          >
            <Smile className="h-4 w-4 mr-1.5" />
            Add icon
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-sm hover:bg-accent"
            onClick={() => setShowCoverModal(true)}
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            Add cover
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-sm hover:bg-accent"
            onClick={() => setShowCommentModal(true)}
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
          onKeyDown={handleKeyDown}
          className="editor-content min-h-[500px] outline-none text-base leading-relaxed"
          data-placeholder="Write, press 'space' for AI, '/' for commands..."
          suppressContentEditableWarning
        />

        {/* Formatting Toolbar */}
        <div className="mt-4 flex items-center gap-1 p-1 bg-card rounded-lg shadow-lg border">
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

        {/* Slash Command Menu */}
        {showSlashMenu && (
          <div
            className="absolute bg-card border rounded-lg shadow-lg p-2 z-50 max-w-xs"
            style={{
              top: slashPosition.top,
              left: slashPosition.left,
            }}
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start"
                onClick={() => {
                  applyFormat('formatBlock', '<h1>');
                  setShowSlashMenu(false);
                }}
              >
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start"
                onClick={() => {
                  applyFormat('formatBlock', '<h2>');
                  setShowSlashMenu(false);
                }}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start"
                onClick={() => {
                  applyFormat('insertUnorderedList');
                  setShowSlashMenu(false);
                }}
              >
                <List className="h-4 w-4 mr-2" />
                Bullet list
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start"
                onClick={() => {
                  applyFormat('insertOrderedList');
                  setShowSlashMenu(false);
                }}
              >
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered list
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start"
                onClick={() => {
                  insertCheckbox();
                  setShowSlashMenu(false);
                }}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start col-span-2"
                onClick={() => {
                  insertImage();
                  setShowSlashMenu(false);
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start col-span-2"
                onClick={() => {
                  triggerAI();
                  setShowSlashMenu(false);
                }}
                disabled={aiLoading}
              >
                🤖 AI Complete
              </Button>
            </div>
          </div>
        )}

        {/* AI Suggestion Instructions (if active) */}
        {showSuggestion && (
          <div className="fixed bottom-4 right-4 bg-muted p-2 rounded-lg text-sm text-muted-foreground z-40">
            Press Enter to accept, Esc to reject
          </div>
        )}

        {/* Modals */}
        <AddIconModal
          isOpen={showIconModal}
          onClose={() => setShowIconModal(false)}
          onSelectIcon={handleAddIcon}
        />
        <AddCoverModal
          isOpen={showCoverModal}
          onClose={() => setShowCoverModal(false)}
          onAddCover={handleAddCover}
        />
        <AddCommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};