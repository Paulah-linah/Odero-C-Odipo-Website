
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Views
import { Home } from './views/public/Home';
import { Books } from './views/public/Books';
import { BookDetail } from './views/public/BookDetail';

// Admin Views
import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';
import { Dashboard } from './views/admin/Dashboard';
import { ManageBooks } from './views/admin/ManageBooks';
import { EditBook } from './views/admin/EditBook';

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
        <Route path="/blog" element={<PublicLayout><div className="py-20 text-center font-serif text-3xl">Blog Archive Coming Soon</div></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><div className="py-20 text-center font-serif text-3xl">The Author's Journey</div></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><div className="py-20 text-center font-serif text-3xl">Literary Events</div></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><div className="py-20 text-center font-serif text-3xl">Get in Touch</div></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/books" element={<AdminLayout><ManageBooks /></AdminLayout>} />
        <Route path="/admin/books/edit/:id" element={<AdminLayout><EditBook /></AdminLayout>} />
        <Route path="/admin/books/new" element={<AdminLayout><div className="bg-white p-8 border border-black">
          <h2 className="text-2xl font-serif font-bold mb-6">Create New Book Listing</h2>
          <p className="text-sm text-gray-500 mb-8 italic">The form would handle image upload, slug generation, and metadata tags.</p>
          <div className="space-y-4">
            <input placeholder="Title" className="w-full border border-black p-3" />
            <textarea placeholder="Synopsis" className="w-full border border-black p-3 h-32" />
            <input placeholder="Price (KES)" className="w-full border border-black p-3" />
            <button className="bg-black text-white px-8 py-3 uppercase text-xs font-bold tracking-widest">Save Draft</button>
          </div>
        </div></AdminLayout>} />
        <Route path="/admin/blog" element={<AdminLayout><div className="py-20 text-center font-serif text-3xl">Manage Blog Entries</div></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><div className="py-20 text-center font-serif text-3xl">Manage Scheduled Events</div></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><div className="py-20 text-center font-serif text-3xl">Site Configuration</div></AdminLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
