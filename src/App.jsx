import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
// 1. If running locally, replace the strings below with your keys from the Firebase Console
// 2. If using Vite env variables, use import.meta.env.VITE_API_KEY, etc.
const localConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Logic to handle both Local environment and the Canvas environment
let firebaseConfig;
let appId = 'default-app-id';

try {
  // Check if we are in the Canvas web environment
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  } else {
    // We are running locally
    firebaseConfig = localConfig;
  }
} catch (e) {
  firebaseConfig = localConfig;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- THE APP ---
export default function BasicBistro() {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');

  // 1. Auth (Log in anonymously automatically)
  useEffect(() => {
    // Only attempt sign in if config is valid
    if (firebaseConfig.apiKey === "PASTE_YOUR_API_KEY_HERE") {
      console.warn("⚠️ Firebase keys missing. Please update the config in BasicBurntBobs.jsx");
      return;
    }
    
    signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // 2. Database Sync (Replace MongoDB connection)
  useEffect(() => {
    if (!user) return;
    
    // Simple query, no pagination, raw data
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'basic_menu'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMenu(items);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Actions
  const addItem = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert('fill it out');

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'basic_menu'), {
        name, 
        description: desc || 'No description provided.',
        price: parseFloat(price),
        createdAt: serverTimestamp()
      });
      
      // Clear form
      setName('');
      setDesc('');
      setPrice('');
    } catch (err) {
      alert("Error adding item: " + err.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'basic_menu', id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (firebaseConfig.apiKey === "PASTE_YOUR_API_KEY_HERE") {
    return (
      <div className="p-10 text-center font-mono text-red-600">
        <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
        <p>Please open <code>BasicBurntBobs.jsx</code> and paste your Firebase configuration keys at the top of the file.</p>
      </div>
    );
  }

  if (!user) return <div className="p-5 font-mono">Loading database connection...</div>;

  return (
    <div className="p-5 font-mono max-w-3xl mx-auto bg-gray-50 min-h-screen border-x-2 border-gray-300">
      
      {/* HEADER: Looks like a default template */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold text-blue-800 underline">Burnt Bob's Bistro v0.1</h1>
        <p className="text-sm text-gray-600">MVP (Minimum Viable Product)</p>
        
        <div className="mt-2 bg-yellow-100 p-2 border border-yellow-400 text-xs">
          Debug: User ID: {user.uid.substring(0,8)}...
        </div>
      </header>

      {/* ADMIN TOGGLE: Super basic security */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isAdmin} 
            onChange={(e) => setIsAdmin(e.target.checked)} 
          />
          <span className="font-bold text-red-600">Admin Mode (Simulated)</span>
        </label>
      </div>

      {/* MENU LIST: The "Get" Request */}
      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-bold bg-gray-200 p-2">Current Menu JSON</h2>
        
        {menu.length === 0 ? (
          <p className="text-gray-500 italic">Database empty. Add items below.</p>
        ) : (
          menu.map((item) => (
            <div key={item.id} className="border border-black p-4 bg-white shadow-md flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-2 font-bold text-green-700">${item.price}</div>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-2 py-1 text-xs hover:bg-red-700"
                >
                  DELETE
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD FORM: The "Post" Request */}
      {isAdmin && (
        <div className="bg-blue-50 p-4 border border-blue-200">
          <h3 className="font-bold mb-3">Add New Item (POST /api/menu)</h3>
          <form onSubmit={addItem} className="flex flex-col gap-3">
            <input 
              className="border border-gray-400 p-2" 
              placeholder="Item Name (e.g. Burnt Toast)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input 
              className="border border-gray-400 p-2" 
              placeholder="Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <input 
              type="number"
              className="border border-gray-400 p-2" 
              placeholder="Price"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
            <button className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-700">
              SEND TO DB
            </button>
          </form>
        </div>
      )}
      
      <footer className="mt-10 text-center text-xs text-gray-400">
        &copy; 2025 Bob. Built in 1 hr using React & Tailwind.
      </footer>
    </div>
  );
}