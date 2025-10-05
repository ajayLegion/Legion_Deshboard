import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [goal, setGoal] = useState(localStorage.getItem("dailyGoal") || "");
  const [quote, setQuote] = useState(localStorage.getItem("dailyQuote") || "");
  const [balance, setBalance] = useState(localStorage.getItem("balance") || "₹0.00");
  const [lastUpdated, setLastUpdated] = useState(localStorage.getItem("lastUpdated") || "");
  const [links, setLinks] = useState(
    JSON.parse(localStorage.getItem("quickLinks") || "[]")
  );
  const [matrixActive, setMatrixActive] = useState(
    localStorage.getItem("matrixActive") === "1"
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState(() => {
    const saved = localStorage.getItem("searchEngine");
    return saved
      ? JSON.parse(saved)
      : {
          url: "https://www.google.com/search?q=",
          icon: "https://www.google.com/favicon.ico",
        };
  });
  const [query, setQuery] = useState("");

  // Check authentication
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



  // LocalStorage sync
  useEffect(() => localStorage.setItem("dailyGoal", goal), [goal]);
  useEffect(() => localStorage.setItem("dailyQuote", quote), [quote]);
  useEffect(() => {
    localStorage.setItem("balance", balance);
    localStorage.setItem("lastUpdated", lastUpdated);
  }, [balance, lastUpdated]);
  useEffect(() => localStorage.setItem("quickLinks", JSON.stringify(links)), [links]);
  useEffect(() => {
    localStorage.setItem("matrixActive", matrixActive ? "1" : "0");
  }, [matrixActive]);

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
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
     

      <main className="flex flex-col md:flex-row justify-between items-start p-8 gap-8">
        {/* Left Section */}
        <section className="flex-1 space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold">{greeting}</h1>
            <p className="text-gray-400">{date}</p>
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
                  localStorage.setItem("searchEngine", JSON.stringify(map[choice]));
                }
              }}
              className="bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2"
            >
              <img src={engine.icon} alt="engine" className="w-5 h-5" />
              ▼
            </button>
            <input
              type="text"
              className="flex-1 bg-gray-800 p-2 rounded-md"
              placeholder="Type and press Enter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            />
            <button
              onClick={doSearch}
              className="bg-indigo-500 px-3 py-2 rounded-md font-semibold"
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
                  className="flex flex-col items-center bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  {link.icon ? (
                    <img src={link.icon} alt={link.title} className="w-6 h-6 mb-1" />
                  ) : (
                    <span className="text-xl font-bold">{link.title[0]}</span>
                  )}
                  <span className="text-sm">{link.title}</span>
                </a>
              ))}
              <button
                onClick={addQuickLink}
                className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Quote & Goal */}
          <div>
            <h3 className="font-semibold text-lg">Today's Quote:</h3>
            <input
              className="bg-gray-800 p-2 w-full rounded-md mt-1"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Write your quote..."
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Today's Goal:</h3>
            <input
              className="bg-gray-800 p-2 w-full rounded-md mt-1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Write your goal..."
            />
          </div>

          {/* Balance Section */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Current Bank Balance</h3>
              <button
                onClick={() => {
                  const newBalance = prompt("Enter new balance:", balance);
                  if (newBalance) handleBalanceChange(newBalance);
                }}
                className="text-indigo-400 hover:underline"
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
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Right Section */}
        
      </main>
    </div>
  );
};

export default Dashboard;
