import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { storage, Page } from '@/services/storage';
import { PageSidebar } from '@/components/PageSidebar';
import { PageEditor } from '@/components/PageEditor';
import { exportToMarkdown, downloadMarkdown, parseMarkdownImport } from '@/utils/markdown';
import { useToast } from '@/hooks/use-toast';
import { FileText, Moon, Sun, UserCircle2 } from 'lucide-react';

// ✅ New views
import Dashboard from '@/components/Dashboard';
import WorkflowPage from '@/components/WorkflowPage';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'notes' | 'dashboard' | 'workflow'>('notes'); // ✅ View state
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const initStorage = async () => {
      const loadedPages = await storage.getAllPages();

      if (loadedPages.length === 0) {
        const welcomePage: Page = {
          id: crypto.randomUUID(),
          title: 'Welcome to Legion Notes',
          content: '<p>Start writing your notes here!</p>',
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: 0,
        };
        await storage.savePage(welcomePage);
        setPages([welcomePage]);
        setCurrentPage(welcomePage);
      } else {
        setPages(loadedPages);
        setCurrentPage(loadedPages[0]);
      }
    };

    initStorage();

    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || savedTheme === null;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, [isAuthenticated]);

  const handleCreatePage = async (parentId: string | null) => {
    const newPage: Page = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '',
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: pages.filter(p => p.parentId === parentId).length,
    };

    await storage.savePage(newPage);
    const updatedPages = await storage.getAllPages();
    setPages(updatedPages);
    setCurrentPage(newPage);

    toast({
      title: 'Page created',
      description: 'New page has been created successfully.',
    });
  };

  const handleUpdatePage = async (updatedPage: Page) => {
    await storage.savePage(updatedPage);
    const updatedPages = await storage.getAllPages();
    setPages(updatedPages);
    setCurrentPage(updatedPage);
  };

  const handleDeletePage = async (id: string) => {
    const deletePageAndChildren = async (pageId: string) => {
      const children = pages.filter(p => p.parentId === pageId);
      for (const child of children) {
        await deletePageAndChildren(child.id);
      }
      await storage.deletePage(pageId);
    };

    await deletePageAndChildren(id);
    const updatedPages = await storage.getAllPages();
    setPages(updatedPages);

    if (currentPage?.id === id) {
      setCurrentPage(updatedPages[0] || null);
    }

    toast({
      title: 'Page deleted',
      description: 'Page and its children have been deleted.',
    });
  };

  const handleSelectPage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    const markdown = exportToMarkdown(pages);
    downloadMarkdown(markdown);

    toast({
      title: 'Export successful',
      description: 'Your notes have been exported to markdown.',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const content = await file.text();
      const importedPages = parseMarkdownImport(content);

      const pageIdMap = new Map<number, string>();

      for (let i = 0; i < importedPages.length; i++) {
        const pageData = importedPages[i];
        const newId = crypto.randomUUID();
        pageIdMap.set(i, newId);

        let parentId: string | null = null;
        if ('__parentIndex' in pageData) {
          const parentIndex = (pageData as any).__parentIndex;
          parentId = pageIdMap.get(parentIndex) || null;
        }

        const newPage: Page = {
          title: pageData.title,
          content: pageData.content,
          parentId,
          id: newId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: pages.length + i,
        };
        await storage.savePage(newPage);
      }

      const updatedPages = await storage.getAllPages();
      setPages(updatedPages);

      toast({
        title: 'Import successful',
        description: `Imported ${importedPages.length} page(s) from markdown.`,
      });
    };

    input.click();
  };

  const handleToggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex justify-center border-b p-3 bg-card shadow-sm z-10">
      {/* User Profile */}
       
          <Button variant="ghost" className="w-full justify-start h-auto p-2 text-sidebar-foreground hover:bg-sidebar-accent">
            <UserCircle2 className="h-6 w-6 mr-2 shrink-0" />
            <span className="truncate text-sm font-medium">Legion Notes</span>
          </Button>
        

      {/* ✅ Top View Navigation */}
      
        <button
          className={`mx-2 px-4 py-2 rounded text-sm font-medium ${view === 'notes' ? 'bg-muted text-primary' : 'hover:bg-accent'}`}
          onClick={() => setView('notes')}
        >
          Notes
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded text-sm font-medium ${view === 'dashboard' ? 'bg-muted text-primary' : 'hover:bg-accent'}`}
          onClick={() => setView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded text-sm font-medium ${view === 'workflow' ? 'bg-muted text-primary' : 'hover:bg-accent'}`}
          onClick={() => setView('workflow')}
        >
          Workflow
        </button>
        {/* Theme Toggle */}
      <Button
            variant="ghost"
            onClick={handleToggleTheme}
            className="justify-start h-8 px-2 text-sidebar-foreground hover:bg-sidebar-accent text-sm"
          >
            {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
      </div>

      {/* ✅ Main Content View */}
      <div className="flex-1 overflow-hidden">
        {view === 'notes' && (
          <div className="flex h-full">
            <PageSidebar
              pages={pages}
              currentPageId={currentPage?.id || null}
              onSelectPage={handleSelectPage}
              onCreatePage={handleCreatePage}
              onDeletePage={handleDeletePage}
              onExport={handleExport}
              onImport={handleImport}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
            />
            {currentPage ? (
              <PageEditor
                key={currentPage.id}
                page={currentPage}
                onUpdate={handleUpdatePage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No page selected</p>
                  <p className="text-sm">Create a new page to get started</p>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'dashboard' && <Dashboard />}
        {view === 'workflow' && <WorkflowPage />}
      </div>
    </div>
  );
};

export default Index;
