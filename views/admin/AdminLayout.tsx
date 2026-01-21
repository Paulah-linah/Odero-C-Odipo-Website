
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setIsAuthReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!session) {
      navigate('/admin');
    }
  }, [isAuthReady, session, navigate]);

  const handleLogout = () => {
    supabase.auth.signOut().finally(() => navigate('/admin'));
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Books', path: '/admin/books', icon: '📚' },
    { name: 'Blog Posts', path: '/admin/blog', icon: '✍️' },
    { name: 'Coming Soon', path: '/admin/coming-soon', icon: '📅' },
    { name: 'Events', path: '/admin/events', icon: '📅' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  if (!isAuthReady || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-[60]">
        <Link to="/" className="text-xl font-great-vibes leading-none">Odipo C. Odero</Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:sticky md:top-0 md:h-screen
      `}>
        <div className="p-8 border-b border-gray-800 hidden md:block">
          <Link to="/" className="text-3xl font-great-vibes leading-none block">
            Odipo C. Odero
          </Link>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold italic">Admin Control</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          {menuItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${location.pathname === item.path ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-red-950/30 text-red-200 hover:bg-red-900/50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto p-4 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};
