
import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { supabase } from './services/supabaseClient';

// Public Views
import { Home } from './views/public/Home';
import { Books } from './views/public/Books';
import { BookDetail } from './views/public/BookDetail';
import { Contact } from './views/public/Contact';
import { About } from './views/public/About';
import { Blog } from './views/public/Blog';
import { BlogPostDetail } from './views/public/BlogPostDetail';
import { Events } from './views/public/Events';
import { Maintenance } from './views/public/Maintenance';

// Admin Views
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';
import { Dashboard } from './views/admin/Dashboard';
import { ManageBooks } from './views/admin/ManageBooks';
import { EditBook } from './views/admin/EditBook';
import { CreateBook } from './views/admin/CreateBook';
import { ManageBlog } from './views/admin/ManageBlog';
import { ManageComments } from './views/admin/ManageComments';
import { ManageComingSoon } from './views/admin/ManageComingSoon';
import { ManageEvents } from './views/admin/ManageEvents';
import { Settings } from './views/admin/Settings';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-[80vh]">{children}</main>
    <Footer />
  </>
);

const MaintenanceLayout: React.FC = () => (
  <>
    <Navbar />
    <Maintenance />
    <Footer />
  </>
);

const App: React.FC = () => {
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [isGateReady, setIsGateReady] = useState(false);

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('maintenance_mode')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (!mounted) return;
        setMaintenanceEnabled(Boolean((data as any)?.maintenance_mode));
      } catch {
        if (!mounted) return;
        setMaintenanceEnabled(false);
      }
    };

    fetchMaintenance();

    const onSettingsUpdated = () => {
      fetchMaintenance();
    };

    window.addEventListener('odero_settings_updated', onSettingsUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('odero_settings_updated', onSettingsUpdated);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        const role = (session?.user?.app_metadata as any)?.role;
        const isAdminRole = role === 'admin';

        if (!mounted) return;
        setIsAdminBypass(isAdminRole);
        setIsGateReady(true);
      } catch {
        if (!mounted) return;
        setIsAdminBypass(false);
        setIsGateReady(true);
      }
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isGateReady && maintenanceEnabled) {
    return null;
  }

  const shouldShowMaintenance = maintenanceEnabled && !isAdminBypass;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><Home /></PublicLayout>} />
        <Route path="/books" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><Books /></PublicLayout>} />
        <Route path="/books/:slug" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><BookDetail /></PublicLayout>} />
        <Route path="/blog" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:id" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><BlogPostDetail /></PublicLayout>} />
        <Route path="/about" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><About /></PublicLayout>} />
        <Route path="/events" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><Events /></PublicLayout>} />
        <Route path="/contact" element={shouldShowMaintenance ? <MaintenanceLayout /> : <PublicLayout><Contact /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/books" element={<AdminLayout><ManageBooks /></AdminLayout>} />
        <Route path="/admin/books/edit/:id" element={<AdminLayout><EditBook /></AdminLayout>} />
        <Route path="/admin/books/new" element={<AdminLayout><CreateBook /></AdminLayout>} />
        <Route path="/admin/blog" element={<AdminLayout><ManageBlog /></AdminLayout>} />
        <Route path="/admin/blog/new" element={<AdminLayout><ManageBlog /></AdminLayout>} />
        <Route path="/admin/comments" element={<AdminLayout><ManageComments /></AdminLayout>} />
        <Route path="/admin/coming-soon" element={<AdminLayout><ManageComingSoon /></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><ManageEvents /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
