import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/Dashboard';
import NotionPage from '@/components/notion';

const Index = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'notion'>('dashboard'); // Default to dashboard view

  // ✅ Authentication check
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate('/login');
      setIsAuthenticated(true);
      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setIsAuthenticated(true);
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // ✅ Load pages + theme once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // ✅ Initialize Theme
    const saved = localStorage.getItem('theme');
    const darkMode = saved === 'dark' || saved === null;
    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [isAuthenticated]);

  // ✅ Theme toggle
  const handleToggleTheme = () => {
    const dark = !isDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ✅ Top Bar */}
      <div className="flex justify-between items-center border-b p-2 bg-card shadow-sm z-10">
        <Button variant="ghost" className="flex items-center space-x-2">
          <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium">Legion Dashboard</span>
        </Button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              view === 'dashboard' ? 'bg-muted text-primary' : 'hover:bg-accent'
            }`}
          >
            Dashboard
          </button>
        <button
          onClick={() => setView('notion')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            view === 'notion' ? 'bg-muted text-primary' : 'hover:bg-accent'
          }`}
        >
            Notion
          </button>

          <Button variant="ghost" onClick={handleToggleTheme} className="px-4 py-2 text-sm">
            {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'dashboard' && <Dashboard />}
        {view === 'notion' && <NotionPage />}
      </div>
    </div>
  );
};

export default Index;
