import React, { useState, useEffect } from 'react';
import './App.css';


// --- MOCK DATABASE (Local Storage) ---
// In a real Node/Express app, this would be your MongoDB connection.
// Here, we simulate it using the browser's storage so it works instantly.

const SIMULATED_DELAY = 500; // Fake network delay (ms)

export default function BasicBistro() {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');

  // 1. Simulate Auth (Auto-login)
  useEffect(() => {
    setTimeout(() => {
      setUser({ uid: "local-dev-user-001" });
    }, 500);
  }, []);

  // 2. Simulate "GET /api/menu" (Fetch from Local Storage)
  useEffect(() => {
    if (!user) return;

    // Simulate API call delay
    setTimeout(() => {
      const storedMenu = localStorage.getItem('burnt_bobs_menu');
      if (storedMenu) {
        setMenu(JSON.parse(storedMenu));
      } else {
        // Default seed data if empty
        setMenu([]);
      }
      setLoading(false);
    }, SIMULATED_DELAY);
  }, [user]);

  // Helper to save to "DB"
  const saveToDb = (newMenu) => {
    localStorage.setItem('burnt_bobs_menu', JSON.stringify(newMenu));
    setMenu(newMenu);
  };

  // 3. Actions (Simulating POST and DELETE)
  const addItem = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert('Please fill out name and price');

    const newItem = {
      id: Date.now().toString(), // Mock ID generation
      name, 
      description: desc || 'No description provided.',
      price: parseFloat(price),
      createdAt: new Date().toISOString()
    };

    // Simulate Network Request
    const updatedMenu = [newItem, ...menu];
    saveToDb(updatedMenu);
    
    // Clear form
    setName('');
    setDesc('');
    setPrice('');
  };

  const deleteItem = async (id) => {
    if (window.confirm("Delete this item?")) {
      const updatedMenu = menu.filter(item => item.id !== id);
      saveToDb(updatedMenu);
    }
  };

  if (!user) return <div className="p-10 font-mono animate-pulse">Connecting to server...</div>;

  return (
    <div className="p-5 font-mono max-w-3xl mx-auto bg-gray-50 min-h-screen border-x-2 border-gray-300">
      
      {/* HEADER: Hackathon Style */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold text-indigo-800 underline decoration-wavy">Burnt Bob's Bistro</h1>
        <div className="flex justify-between items-end mt-2">
          <div>
             <p className="text-sm text-gray-600 font-bold">Stack: React + LocalStorage (No Backend)</p>
             <p className="text-xs text-gray-500">v1.0.0-local</p>
          </div>
          <div className="bg-green-100 px-3 py-1 border border-green-500 text-green-800 text-xs font-bold rounded-full">
            System Online
          </div>
        </div>
      </header>

      {/* ADMIN TOGGLE */}
      <div className="mb-8 flex items-center gap-4 bg-white p-3 border border-gray-300 shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className={`w-5 h-5 border-2 border-black flex items-center justify-center ${isAdmin ? 'bg-red-500' : 'bg-white'}`}>
             {isAdmin && <span className="text-white text-xs">✓</span>}
          </div>
          <input 
            type="checkbox" 
            className="hidden"
            checked={isAdmin} 
            onChange={(e) => setIsAdmin(e.target.checked)} 
          />
          <span className="font-bold uppercase tracking-wider text-sm">Enable Admin Mode</span>
        </label>
        <div className="text-xs text-gray-400 border-l pl-4">
          (Check this to add/delete items)
        </div>
      </div>

      {/* ADD FORM: The "Post" Request */}
      {isAdmin && (
        <div className="bg-blue-50 p-6 border-2 border-blue-200 mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <h3 className="font-bold mb-4 text-blue-900 border-b border-blue-200 pb-2">CREATE NEW ITEM</h3>
          <form onSubmit={addItem} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                className="border-2 border-gray-300 p-2 focus:border-blue-500 outline-none" 
                placeholder="Item Name (e.g. Burnt Toast)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input 
                type="number"
                className="border-2 border-gray-300 p-2 focus:border-blue-500 outline-none" 
                placeholder="Price ($)"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <input 
              className="border-2 border-gray-300 p-2 focus:border-blue-500 outline-none" 
              placeholder="Description (Optional)"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <button className="bg-blue-600 text-white p-3 font-bold hover:bg-blue-700 transition shadow-md active:shadow-none active:translate-y-1">
              + ADD TO DATABASE
            </button>
          </form>
        </div>
      )}

      {/* MENU LIST: The "Get" Request */}
      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-bold bg-gray-800 text-white p-3">
           Current Menu ({menu.length} Items)
        </h2>
        
        {loading ? (
           <div className="text-center py-10 text-gray-400">Loading data...</div>
        ) : menu.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
            Database is empty.<br/>Switch to Admin Mode to add items.
          </div>
        ) : (
          menu.map((item) => (
            <div key={item.id} className="border-2 border-gray-200 bg-white p-4 hover:shadow-lg transition flex justify-between group">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold text-xl font-serif">{item.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">#{item.id.slice(-4)}</span>
                </div>
                <p className="text-gray-600 mt-1">{item.description}</p>
                <div className="mt-3 font-bold text-green-700 text-lg">${item.price.toFixed(2)}</div>
              </div>
              
              {isAdmin && (
                <div className="flex items-start">
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-100 text-red-600 border border-red-200 px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white transition uppercase"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <footer className="mt-20 border-t border-gray-300 pt-5 text-center text-xs text-gray-500 font-mono">
        &copy; 2025 Bob's Bistro. Running on client-side storage.
      </footer>
    </div>
  );
}