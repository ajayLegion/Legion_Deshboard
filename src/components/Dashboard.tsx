import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [goal, setGoal] = useState("");
  const [quote, setQuote] = useState("");
  const [balance, setBalance] = useState("₹0.00");
  const [lastUpdated, setLastUpdated] = useState("");
  const [links, setLinks] = useState<Array<{ href: string; title: string; icon: string }>>([]);
  const [engine, setEngine] = useState({
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/favicon.ico",
  });
  const [query, setQuery] = useState("");

  // Load dashboard settings from database
  const loadDashboardSettings = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTheme((data.theme as 'light' | 'dark') || 'light');
        setGoal(data.daily_goal || "");
        setQuote(data.daily_quote || "");
        setBalance(data.balance || "₹0.00");
        setLastUpdated(data.last_updated || "");
        setLinks((data.quick_links as Array<{ href: string; title: string; icon: string }>) || []);
        setEngine((data.search_engine as { url: string; icon: string }) || { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" });
      } else {
        // Create default settings if none exist
        const { error: insertError } = await supabase
          .from('dashboard_settings')
          .insert({
            user_id: uid,
            theme: 'light',
            balance: '₹0.00',
            quick_links: [],
            search_engine: { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" }
          });
        if (insertError) console.error('Error creating dashboard settings:', insertError);
      }
    } catch (error) {
      console.error('Error loading dashboard settings:', error);
    }
  };

  // Save dashboard settings to database
  const saveDashboardSettings = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('dashboard_settings')
        .upsert({
          user_id: userId,
          daily_goal: goal,
          daily_quote: quote,
          balance,
          last_updated: lastUpdated,
          quick_links: links,
          search_engine: engine,
          theme
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
    }
  };

  // Theme setup
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Check authentication and load settings
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        loadDashboardSettings(session.user.id);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        loadDashboardSettings(session.user.id);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Greeting and Date
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      let g = "Good morning";
      if (hour >= 12 && hour < 17) g = "Good afternoon";
      else if (hour >= 17) g = "Good evening";
      setGreeting(g);
      setDate(now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Auto-save to database when settings change
  useEffect(() => {
    if (isAuthenticated && userId) {
      const timeoutId = setTimeout(() => {
        saveDashboardSettings();
      }, 1000); // Debounce saves by 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [goal, quote, balance, lastUpdated, links, engine, theme, isAuthenticated, userId]);
  

  const doSearch = () => {
    if (!query.trim()) return;
    window.open(engine.url + encodeURIComponent(query.trim()), "_blank");
    setQuery("");
  };

  const addQuickLink = () => {
    const url = prompt("Enter URL:");
    const name = prompt("Enter name:");
    if (!url || !name) return;
    const icon = prompt("Enter icon URL (optional):") || "";
    const newLink = { href: url, title: name, icon };
    setLinks([...links, newLink]);
  };

  const handleBalanceChange = (newBalance: string) => {
    setBalance(newBalance);
    setLastUpdated(new Date().toLocaleString());
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="root" className="relative min-h-screen overflow-hidden">

      <main className="flex flex-col md:flex-row justify-between items-start p-8 gap-8">
        {/* Left Section */}
       
        <section className="flex-1 space-y-8">
          {/* Greeting */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
              <p className="text-gray-500 dark:text-gray-400">{date}</p>
            </div>
            
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const choice = prompt("Choose search engine (google/bing/ddg/chatgpt):", "google");
                const map: Record<string, any> = {
                  google: { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" },
                  bing: { url: "https://www.bing.com/search?q=", icon: "https://www.bing.com/favicon.ico" },
                  ddg: { url: "https://duckduckgo.com/?q=", icon: "https://duckduckgo.com/favicon.ico" },
                  chatgpt: { url: "https://chat.openai.com/?q=", icon: "https://chat.openai.com/favicon.ico" },
                };
                if (choice && map[choice]) {
                  setEngine(map[choice]);
                }
              }}
              className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <img src={engine.icon} alt="engine" className="w-5 h-5" />
              ▼
            </button>
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Type and press Enter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            />
            <button
              onClick={doSearch}
              className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md font-semibold text-white"
            >
              Search
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  className="flex flex-col items-center bg-white dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                >
                  {link.icon ? (
                    <img src={link.icon} alt={link.title} className="w-6 h-6 mb-1" />
                  ) : (
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{link.title[0]}</span>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">{link.title}</span>
                </a>
              ))}
              <button
                onClick={addQuickLink}
                className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-700"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Quote & Goal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Today's Quote:</h3>
            <input
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md mt-1 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Write your quote..."
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Today's Goal:</h3>
            <input
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md mt-1 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Write your goal..."
            />
          </div>

          {/* Balance Section */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Current Bank Balance</h3>
              <button
                onClick={() => {
                  const newBalance = prompt("Enter new balance:", balance);
                  if (newBalance) handleBalanceChange(newBalance);
                }}
                className="text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                Edit
              </button>
            </div>
            <p
              className={`text-2xl ${
                parseFloat(balance.replace(/[₹,]/g, "")) < 10000
                  ? "text-red-400"
                  : parseFloat(balance.replace(/[₹,]/g, "")) <= 50000
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {balance}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
          
        </section>

        {/* Right Section */}
     <section className="flex-1 text-center flex flex-col items-center justify-center relative overflow-hidden py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-300/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8 px-4">
        {/* Logo with hover effect */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-white via-gray-200 to-white rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <img
            src="/public/avatar.png"
            alt="Ajay Legion Logo"
            className="w-64 h-auto relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Name with gradient and animation */}
        <div className="space-y-3">
          <h1 className="text-7xl font-bold tracking-tight dark:text-white">
            <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent dark:text-white">
              Ajay
            </span>
            <span className="italic bg-gradient-to-r from-black via-black to-black bg-clip-text text-transparent dark:text-white">
              Legion
            </span>
          </h1>
          
          {/* Role with enhanced gradient */}
          <p className="text-3xl font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
            Web Developer
          </p>
        </div>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        </div>
      </div>


      {/* Bottom gradient fade */}
     </section>
      </main>
    </div>
  );
};

export default Dashboard;