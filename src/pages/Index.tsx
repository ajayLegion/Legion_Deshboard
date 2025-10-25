import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { storage, Page } from '@/services/storage';
import { PageSidebar } from '@/components/PageSidebar';
import { PageEditor } from '@/components/PageEditor';
import { exportToMarkdown, downloadMarkdown, parseMarkdownImport } from '@/utils/markdown';
import { useToast } from '@/hooks/use-toast';
import { FileText, Moon, Sun } from 'lucide-react';

// ✅ New views
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard'>('dashboard'); // ✅ View state
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
      <div className="flex justify-center border-b p-2 bg-card shadow-sm z-10">
      {/* User Profile */}
       
          <Button variant="ghost" className="w-full justify-start">
           <img src="/avatar.png" alt="avatar" className=' w-8'/>
            <span className="truncate text-sm font-medium">Legion Dashboard </span>
          </Button>
        

      {/* ✅ Top View Navigation */}
      
        
       
        {/* Theme Toggle */}
      <Button
            variant="ghost"
            onClick={handleToggleTheme}
            className="mx-2 px-4 py-2 rounded  text-sidebar-foreground hover:bg-sidebar-accent text-sm"
          >
            {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
      </div>

      {/* ✅ Main Content View */}
      <div className="flex-1 overflow-hidden">
        {view === 'notes' && (
          <div className="flex h-full">
           
          </div>
        )}

        {view === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
};

export default Index;
