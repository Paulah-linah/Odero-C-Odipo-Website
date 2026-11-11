import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { supabase } from './services/supabaseClient';
import { invalidateBooksCache } from './services/books';

// Each page is loaded only when it is visited, so the first visit downloads far less JavaScript.
// The admin area and the PDF reader (pdf.js) never load for regular visitors.
const named = <T extends Record<string, any>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] as React.ComponentType<any> })));

const Home = named(() => import('./views/public/Home'), 'Home');
const Books = named(() => import('./views/public/Books'), 'Books');
const BookDetail = named(() => import('./views/public/BookDetail'), 'BookDetail');
const Contact = named(() => import('./views/public/Contact'), 'Contact');
const About = named(() => import('./views/public/About'), 'About');
const Blog = named(() => import('./views/public/Blog'), 'Blog');
const BlogPostDetail = named(() => import('./views/public/BlogPostDetail'), 'BlogPostDetail');
const Events = named(() => import('./views/public/Events'), 'Events');
const Maintenance = named(() => import('./views/public/Maintenance'), 'Maintenance');
const RecoverPurchase = named(() => import('./views/public/RecoverPurchase'), 'RecoverPurchase');
const ReadBook = named(() => import('./views/public/ReadBook'), 'ReadBook');

const AdminLogin = named(() => import('./views/admin/AdminLogin'), 'AdminLogin');
const AdminLayout = named(() => import('./views/admin/AdminLayout'), 'AdminLayout');
const Dashboard = named(() => import('./views/admin/Dashboard'), 'Dashboard');
const ManageBooks = named(() => import('./views/admin/ManageBooks'), 'ManageBooks');
const EditBook = named(() => import('./views/admin/EditBook'), 'EditBook');
const CreateBook = named(() => import('./views/admin/CreateBook'), 'CreateBook');
const ManageBlog = named(() => import('./views/admin/ManageBlog'), 'ManageBlog');
const ManageComments = named(() => import('./views/admin/ManageComments'), 'ManageComments');
const ManageComingSoon = named(() => import('./views/admin/ManageComingSoon'), 'ManageComingSoon');
const ManageEvents = named(() => import('./views/admin/ManageEvents'), 'ManageEvents');
const ManagePurchases = named(() => import('./views/admin/ManagePurchases'), 'ManagePurchases');
const ManageNewsletter = named(() => import('./views/admin/ManageNewsletter'), 'ManageNewsletter');
const Settings = named(() => import('./views/admin/Settings'), 'Settings');

/** Quiet placeholder while a page's code loads (usually a few milliseconds). */
const PageFallback: React.FC = () => (
  <div className="page py-24" aria-busy="true" aria-live="polite">
    <div className="skeleton h-10 w-64 mb-6" />
    <div className="skeleton h-4 w-full max-w-xl mb-3" />
    <div className="skeleton h-4 w-full max-w-md" />
  </div>
);

/** Scroll to the top whenever the page changes. */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

/** Persistent public shell: the navbar and footer stay mounted while pages change. */
const PublicShell: React.FC<{ maintenance: boolean }> = ({ maintenance }) => {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <main id="main" className="min-h-[70vh]">
        <Suspense fallback={<PageFallback />}>
          <div key={maintenance ? 'maintenance' : pathname} className="route-enter">
            {maintenance ? <Maintenance /> : <Outlet />}
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

/** Admin pages: always show fresh catalogue data on return to the public site. */
const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    invalidateBooksCache();
    return () => invalidateBooksCache();
  }, []);
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
};

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
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicShell maintenance={shouldShowMaintenance} />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:slug" element={<BookDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/recover" element={<RecoverPurchase />} />
          <Route path="/read/:token" element={<ReadBook />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<AdminShell><Dashboard /></AdminShell>} />
        <Route path="/admin/books" element={<AdminShell><ManageBooks /></AdminShell>} />
        <Route path="/admin/books/edit/:id" element={<AdminShell><EditBook /></AdminShell>} />
        <Route path="/admin/books/new" element={<AdminShell><CreateBook /></AdminShell>} />
        <Route path="/admin/blog" element={<AdminShell><ManageBlog /></AdminShell>} />
        <Route path="/admin/blog/new" element={<AdminShell><ManageBlog /></AdminShell>} />
        <Route path="/admin/comments" element={<AdminShell><ManageComments /></AdminShell>} />
        <Route path="/admin/purchases" element={<AdminShell><ManagePurchases /></AdminShell>} />
        <Route path="/admin/newsletter" element={<AdminShell><ManageNewsletter /></AdminShell>} />
        <Route path="/admin/coming-soon" element={<AdminShell><ManageComingSoon /></AdminShell>} />
        <Route path="/admin/events" element={<AdminShell><ManageEvents /></AdminShell>} />
        <Route path="/admin/settings" element={<AdminShell><Settings /></AdminShell>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
