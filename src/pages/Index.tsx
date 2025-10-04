import { useState, useEffect } from 'react';
import { storage, Page } from '@/services/storage';
import { PageSidebar } from '@/components/PageSidebar';
import { PageEditor } from '@/components/PageEditor';
import { exportToMarkdown, downloadMarkdown, parseMarkdownImport } from '@/utils/markdown';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

const Index = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initStorage = async () => {
      await storage.init();
      const loadedPages = await storage.getAllPages();
      
      if (loadedPages.length === 0) {
        const welcomePage: Page = {
          id: crypto.randomUUID(),
          title: 'Welcome to Legion Notes',
          content: '<p>Start writing your notes here! Use the formatting toolbar to style your text.</p><p><br></p><p>You can:</p><ul><li>Create nested pages</li><li>Format text with <b>bold</b>, <i>italic</i>, and more</li><li>Add lists and checkboxes</li><li>Export and import markdown files</li></ul>',
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

    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleCreatePage = async (parentId: string | null) => {
    const newPage: Page = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '<p>Start writing...</p>',
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

      for (const pageData of importedPages) {
        const newPage: Page = {
          ...pageData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: pages.length,
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
  );
};

export default Index;
