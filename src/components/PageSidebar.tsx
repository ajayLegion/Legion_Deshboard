import { useState } from 'react';
import { Page } from '@/services/storage';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  FileText, 
  Moon, 
  Sun, 
  Download, 
  Upload,
  Search,
  Home,
  Inbox,
  Settings,
  UserCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  isDark,
  onToggleTheme,
}: PageSidebarProps) => {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const getChildPages = (parentId: string | null) => {
    return pages
      .filter(p => p.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const renderPage = (page: Page, level: number) => {
    const hasChildren = pages.some(p => p.parentId === page.id);
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
              onClick={() => toggleExpanded(page.id)}
              className="p-0.5 hover:bg-sidebar-accent/70 rounded shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 shrink-0" />}
          
          <FileText className="h-4 w-4 shrink-0 opacity-80" />
          
          <span
            onClick={() => onSelectPage(page.id)}
            className="flex-1 truncate"
          >
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

        {hasChildren && isExpanded && (
          <div>
            {getChildPages(page.id).map((childPage) =>
              renderPage(childPage, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col h-screen">
      {/* User Profile Section */}
      <div className="p-3 border-b border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <UserCircle2 className="h-6 w-6 mr-2 shrink-0" />
          <span className="truncate text-sm font-medium">Legion Notes</span>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-sidebar-accent border-none text-sidebar-foreground placeholder:text-sidebar-foreground/50 h-8 text-sm"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-2 pb-2 space-y-0.5">
        <Button
          variant="ghost" 
          className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm"
        >
          <Inbox className="h-4 w-4 mr-2" />
          Inbox
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Pages Section */}
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">Private</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {getChildPages(null).map((page) => renderPage(page, 0))}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <Separator className="bg-sidebar-border" />
      <div className="p-2 space-y-0.5">
        <Button
          variant="ghost"
          onClick={onToggleTheme}
          className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm"
        >
          {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Export/Import Actions */}
      <div className="p-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="flex-1 h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          className="flex-1 h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Upload className="h-3 w-3 mr-1" />
          Import
        </Button>
      </div>

      {/* New Page Button */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          onClick={() => onCreatePage(null)}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 h-8 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>
    </div>
  );
};