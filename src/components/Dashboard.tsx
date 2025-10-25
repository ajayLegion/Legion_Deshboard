import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface Contact {
  name: string;
  phone: string;
}

interface QuickLink {
  href: string;
  title: string;
  icon: string;
}

interface SearchEngine {
  url: string;
  icon: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("dark");
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [goal, setGoal] = useState("");
  const [quote, setQuote] = useState("");
  const [balance, setBalance] = useState("₹0.00");
  const [lastUpdated, setLastUpdated] = useState("");
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [engine, setEngine] = useState<SearchEngine>({
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/favicon.ico",
  });
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [weatherLocation, setWeatherLocation] = useState("Delhi, India");

  // ✅ Load dashboard settings from database
  const loadDashboardSettings = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("dashboard_settings")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        console.error("Error loading dashboard settings:", error.message);
        throw error;
      }

      if (data) {
        setGoal(data.daily_goal || "");
        setQuote(data.daily_quote || "");
        setBalance(data.balance || "₹0.00");
        setLastUpdated(data.last_updated || "");
        setLinks(data.quick_links || []);
        setContacts(data.contacts || []);
        setEngine(data.search_engine || {
          url: "https://www.google.com/search?q=",
          icon: "https://www.google.com/favicon.ico",
        });
        setNotes(data.notes || "");
        setTodos(data.todos || []);
        setWeatherLocation(data.weather_location || "Delhi, India");
      } else {
        // default settings
        await supabase.from("dashboard_settings").insert({
          user_id: uid,
          balance: "₹0.00",
          quick_links: [],
          contacts: [],
          search_engine: { url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" },
          notes: "",
          todos: [],
          weather_location: "Delhi, India",
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
      // Check if the record exists
      const { data, error: fetchError } = await supabase
        .from("dashboard_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching dashboard settings:", fetchError.message);
        return;
      }

      const updateData = {
        daily_goal: goal,
        daily_quote: quote,
        balance,
        last_updated: lastUpdated,
        quick_links: links,
        contacts,
        search_engine: engine,
        notes,
        todos,
        weather_location: weatherLocation,
      };

      if (data) {
        // Update existing record
        const { error } = await supabase
          .from("dashboard_settings")
          .update(updateData)
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating dashboard settings:", error.message);
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from("dashboard_settings")
          .insert({
            user_id: userId,
            ...updateData,
          });

        if (error) {
          console.error("Error saving dashboard settings:", error.message);
        }
      }
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
  }, [goal, quote, balance, lastUpdated, links, contacts, engine, notes, todos, weatherLocation, isAuthenticated, userId]);

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

  const addContact = () => {
    const name = prompt("Enter contact name:");
    const phone = prompt("Enter phone number:");
    if (!name || !phone) return;
    setContacts([...contacts, { name, phone }]);
  };

  const deleteContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const addTodo = () => {
    const text = prompt("Enter todo item:");
    if (!text) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
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
      <main className="flex flex-col lg:flex-row justify-between items-start p-8 gap-10">
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
                const map: Record<string, SearchEngine> = {
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Balance history: (Coming soon)
            </p>
          </div>
        </section>

        {/* ✅ Right Section - Useful Things */}
        <aside className="w-full lg:w-80 space-y-6">
           {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
          {/* Contacts Section */}
          <div className="bg-white dark:bg-[#151820] p-4 rounded-lg border border-gray-200 dark:border-[#2a2e3a] shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Important Contacts</h3>
              <button
                onClick={addContact}
                className="text-indigo-500 hover:underline text-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No contacts added yet.</p>
              ) : (
                contacts.map((contact, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-[#1a1d25] rounded-md">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{contact.phone}</p>
                    </div>
                    <button
                      onClick={() => deleteContact(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Notes Section */}
          <div className="bg-white dark:bg-[#151820] p-4 rounded-lg border border-gray-200 dark:border-[#2a2e3a] shadow-md">
            <h3 className="font-semibold mb-3">Quick Notes</h3>
            <textarea
              className="w-full h-32 bg-gray-50 dark:bg-[#1a1d25] border border-gray-300 dark:border-[#2a2e3a] p-2 rounded-md text-gray-900 dark:text-gray-100 text-sm resize-none"
              placeholder="Jot down quick notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Todo List Section */}
          <div className="bg-white dark:bg-[#151820] p-4 rounded-lg border border-gray-200 dark:border-[#2a2e3a] shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Today's Todos</h3>
              <button
                onClick={addTodo}
                className="text-indigo-500 hover:underline text-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todos.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No todos added yet.</p>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="flex items-center p-2 bg-gray-50 dark:bg-[#1a1d25] rounded-md">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="mr-2"
                    />
                    <span className={`${todo.completed ? 'line-through text-gray-500' : ''} flex-1`}>{todo.text}</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weather Section 
          <div className="bg-white dark:bg-[#151820] p-4 rounded-lg border border-gray-200 dark:border-[#2a2e3a] shadow-md text-center">
            <h3 className="font-semibold mb-2">Weather</h3>
            <p className="text-gray-500 dark:text-gray-400">Sunny, 28°C</p>
            <p className="text-sm text-gray-400">{weatherLocation}</p>
            <input
              type="text"
              className="mt-2 bg-gray-50 dark:bg-[#1a1d25] border border-gray-300 dark:border-[#2a2e3a] p-1 rounded-md text-xs w-full text-center text-gray-900 dark:text-gray-100"
              value={weatherLocation}
              onChange={(e) => setWeatherLocation(e.target.value)}
              placeholder="Update location..."
            />
            <button className="text-indigo-500 hover:underline text-xs mt-1 block mx-auto">Refresh Weather</button>
          </div>*/}
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;