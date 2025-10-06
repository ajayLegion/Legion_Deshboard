import React, { useState, useRef, useEffect } from 'react';
import { Page } from '@/services/storage';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  Download,
  Upload,
  Search,
  Settings,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DialogContent } from '@radix-ui/react-dialog';
const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]
interface PageSidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (parentId: string | null) => void;
  onDeletePage: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const PageSidebar = ({
  pages,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onExport,
  onImport,
}: PageSidebarProps) => {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);

  // Toggle expand state
  const toggleExpanded = (pageId: string) => {
    const next = new Set(expandedPages);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    setExpandedPages(next);
  };

  const getChildPages = (parentId: string | null) =>
    pages.filter((p) => p.parentId === parentId).sort((a, b) => a.order - b.order);

  const renderPage = (page: Page, level: number) => {
    const hasChildren = pages.some((p) => p.parentId === page.id);
    const isExpanded = expandedPages.has(page.id);
    const isActive = currentPageId === page.id;

    return (
      <div key={page.id} className="select-none">
        <div
          className={`
            group flex items-center gap-1 rounded px-2 py-1 cursor-pointer text-sm
            ${isActive ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/70'}
          `}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(page.id);
              }}
              className="p-0.5 hover:bg-sidebar-accent/70 rounded shrink-0"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
          {!hasChildren && <div className="w-4 shrink-0" />}

          <FileText className="h-4 w-4 shrink-0 opacity-80" />

          <span onClick={() => onSelectPage(page.id)} className="flex-1 truncate">
            {page.title}
          </span>

          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onCreatePage(page.id);
              }}
              className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent/70"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage(page.id);
              }}
              className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && <div>{getChildPages(page.id).map((c) => renderPage(c, level + 1))}</div>}
      </div>
    );
  };

  // Pointer-based resize handling (works for mouse + touch)
  useEffect(() => {
    const minWidth = 180;
    const maxWidth = 600;

    const handlePointerMove = (ev: PointerEvent) => {
      if (!isResizing.current) return;
      const sidebarEl = sidebarRef.current;
      if (!sidebarEl) return;
      const rect = sidebarEl.getBoundingClientRect();
      // width = pointer x relative to sidebar left edge
      const raw = ev.clientX - rect.left;
      const newWidth = Math.min(Math.max(raw, minWidth), maxWidth);
      setSidebarWidth(newWidth);
    };

    const handlePointerUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        // restore text selection
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const onHandlePointerDown = (ev: React.PointerEvent<HTMLDivElement>) => {
    isResizing.current = true;
    // prevent accidental text selection while dragging
    document.body.style.userSelect = 'none';
    // try to capture pointer (best-effort)
    try {
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-screen" style={{ minHeight: 0 }}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="bg-sidebar-background border-r border-sidebar-border flex flex-col"
        style={{ width: `${sidebarWidth}px`, minWidth: 120 }}
      >
        

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-8 bg-sidebar-accent border-none text-sidebar-foreground placeholder:text-sidebar-foreground/50 h-8 text-sm"
            />
          </div>
        </div>

        {/* Main Nav */}
        <div className="px-2 pb-2 space-y-0.5">
         {/*<Button variant="ghost" className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>*/}
           <Dialog>
      <DialogTrigger asChild>
         <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-slate-800 border-slate-700">
        <Button variant="ghost" size="sm" onClick={onExport} className="flex-1 h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onImport} className="flex-1 h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent">
            <Upload className="h-3 w-3 mr-1" />
            Import
          </Button>
      </DialogContent>
    </Dialog>
        </div>

        <Separator className="bg-sidebar-border" />
{/* New Page */}
        <div className="p-2 border-t border-sidebar-border">
          <Button onClick={() => onCreatePage(null)} className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-8 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
        <Separator className="bg-sidebar-border" />
        {/* Pages */}
        <div className="px-2 pt-2 pb-1">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">Notes</span>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 pb-2">{getChildPages(null).map((p) => renderPage(p, 0))}</div>
        </ScrollArea>

        {/* Bottom Actions */}
        <Separator className="bg-sidebar-border" />  
      </div>
      {/* Resize handle */}
      <div
        onPointerDown={onHandlePointerDown}
        role="separator"
        aria-orientation="vertical"
        className="w-2 cursor-col-resize hover:bg-sidebar-accent/40 transition-colors"
        style={{ touchAction: 'none', userSelect: 'none' }}
      />
    </div>
  );
};
