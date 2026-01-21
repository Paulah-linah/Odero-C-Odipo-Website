
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Views
import { Home } from './views/public/Home';
import { Books } from './views/public/Books';
import { BookDetail } from './views/public/BookDetail';
import { Contact } from './views/public/Contact';
import { About } from './views/public/About';
import { Blog } from './views/public/Blog';

// Admin Views
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';
import { Dashboard } from './views/admin/Dashboard';
import { ManageBooks } from './views/admin/ManageBooks';
import { EditBook } from './views/admin/EditBook';
import { CreateBook } from './views/admin/CreateBook';
import { ManageBlog } from './views/admin/ManageBlog';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-[80vh]">{children}</main>
    <Footer />
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/books" element={<PublicLayout><Books /></PublicLayout>} />
        <Route path="/books/:slug" element={<PublicLayout><BookDetail /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><div className="py-20 text-center font-serif text-3xl">Literary Events</div></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/books" element={<AdminLayout><ManageBooks /></AdminLayout>} />
        <Route path="/admin/books/edit/:id" element={<AdminLayout><EditBook /></AdminLayout>} />
        <Route path="/admin/books/new" element={<AdminLayout><CreateBook /></AdminLayout>} />
        <Route path="/admin/blog" element={<AdminLayout><ManageBlog /></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><div className="py-20 text-center font-serif text-3xl">Manage Scheduled Events</div></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><div className="py-20 text-center font-serif text-3xl">Site Configuration</div></AdminLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
