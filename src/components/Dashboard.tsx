import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
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

  // ✅ Load dashboard settings from database
  const loadDashboardSettings = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("dashboard_settings")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTheme((data.theme as "light" | "dark") || "light");
        setGoal(data.daily_goal || "");
        setQuote(data.daily_quote || "");
        setBalance(data.balance || "₹0.00");
        setLastUpdated(data.last_updated || "");
        setLinks(data.quick_links || []);
        setEngine(
          data.search_engine || {
            url: "https://www.google.com/search?q=",
            icon: "https://www.google.com/favicon.ico",
          }
        );
      } else {
        // default settings
        await supabase.from("dashboard_settings").insert({
          user_id: uid,
          theme: "light",
          balance: "₹0.00",
          quick_links: [],
          search_engine: { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" },
        });
      }
    } catch (error) {
      console.error("Error loading dashboard settings:", error);
    }
  };

  // ✅ Save dashboard settings
  const saveDashboardSettings = async () => {
    if (!userId) return;
    try {
      await supabase.from("dashboard_settings").upsert({
        user_id: userId,
        daily_goal: goal,
        daily_quote: quote,
        balance,
        last_updated: lastUpdated,
        quick_links: links,
        search_engine: engine,
        theme,
      });
    } catch (error) {
      console.error("Error saving dashboard settings:", error);
    }
  };

  // ✅ Theme setup
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // ✅ Authentication and settings
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        loadDashboardSettings(session.user.id);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      else {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        loadDashboardSettings(session.user.id);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // ✅ Greeting and Date
  useEffect(() => {
    if (!isAuthenticated) return;
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      const g =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      setGreeting(g);
      setDate(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ✅ Auto-save (debounced)
  useEffect(() => {
    if (isAuthenticated && userId) {
      const timeoutId = setTimeout(() => saveDashboardSettings(), 1000);
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
    setLinks([...links, { href: url, title: name, icon }]);
  };

  const handleBalanceChange = (newBalance: string) => {
    setBalance(newBalance);
    setLastUpdated(new Date().toLocaleString());
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-gray-100">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );

  if (!isAuthenticated) return null;

  return (
    <div id="root" className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#0f1117]">
      <main className="flex flex-col md:flex-row justify-between items-start p-8 gap-10">
        {/* ✅ Left Section */}
        <section className="flex-1 space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold">{greeting}</h1>
            <p className="text-gray-500 dark:text-gray-400">{date}</p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const choice = prompt("Search engine (google/bing/ddg/chatgpt):", "google");
                const map: Record<string, any> = {
                  google: { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" },
                  bing: { url: "https://www.bing.com/search?q=", icon: "https://www.bing.com/favicon.ico" },
                  ddg: { url: "https://duckduckgo.com/?q=", icon: "https://duckduckgo.com/favicon.ico" },
                  chatgpt: { url: "https://chat.openai.com/?q=", icon: "https://chat.openai.com/favicon.ico" },
                };
                if (choice && map[choice]) setEngine(map[choice]);
              }}
              className="bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <img src={engine.icon} alt="engine" className="w-5 h-5" />
              ▼
            </button>
            <input
              type="text"
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            />
            <button
              onClick={doSearch}
              className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-3 py-2 rounded-md font-semibold text-white shadow-md"
            >
              Search
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  className="flex flex-col items-center bg-white dark:bg-[#1a1d25] p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232732] border border-gray-200 dark:border-[#2d313f]"
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
                className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Quote & Goal */}
          <div>
            <h3 className="font-semibold text-lg">Today's Quote:</h3>
            <input
              className="bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-[#2a2e3a] p-2 w-full rounded-md mt-1 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Write your quote..."
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Today's Goal:</h3>
            <input
              className="bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-[#2a2e3a] p-2 w-full rounded-md mt-1 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Write your goal..."
            />
          </div>

          {/* Balance Section */}
          <div className="bg-white dark:bg-[#151820] p-4 rounded-lg border border-gray-200 dark:border-[#2a2e3a] shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Current Bank Balance</h3>
              <button
                onClick={() => {
                  const newBalance = prompt("Enter new balance:", balance);
                  if (newBalance) handleBalanceChange(newBalance);
                }}
                className="text-indigo-500 hover:underline"
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

        {/* ✅ Right Section (Profile / Branding) */}
        <section className="flex-1 flex flex-col items-center justify-center relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-transparent dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 opacity-40 blur-2xl" />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>

          <div className="relative z-10 text-center space-y-6">
           
            <h1 className="text-6xl font-extrabold ">
              Ajay Legion
            </h1>
              </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
