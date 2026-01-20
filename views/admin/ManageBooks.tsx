
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { Book } from '../../types';

export const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const refresh = () => setBooks(storage.getBooks());
    refresh();
    window.addEventListener('odero_books_updated', refresh);
    return () => window.removeEventListener('odero_books_updated', refresh);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      const updated = books.filter(b => b.id !== id);
      storage.saveBooks(updated);
      setBooks(updated);
    }
  };

  const toggleFeatured = (id: string) => {
    const updated = books.map(b => ({
      ...b,
      isFeatured: b.id === id ? !b.isFeatured : false // Only one featured book allowed
    }));
    storage.saveBooks(updated);
    setBooks(updated);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-serif font-bold">Books Library</h1>
        <Link to="/admin/books/new" className="bg-black text-white px-6 py-3 w-full sm:w-auto text-center uppercase text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors">Add New Book</Link>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto rounded-sm">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Title</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Price</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No books found in the archives.</td>
              </tr>
            ) : (
              books.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={book.coverImage} className="w-10 h-14 object-cover flex-shrink-0" alt="" />
                      <div>
                        <p className="font-serif font-bold text-sm">{book.title}</p>
                        {book.isFeatured && <span className="text-[9px] bg-black text-white px-2 py-0.5 uppercase tracking-tighter">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 border border-gray-200 uppercase font-bold tracking-widest text-gray-500 whitespace-nowrap">{book.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">KES {book.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => toggleFeatured(book.id)}
                        className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 border ${book.isFeatured ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-200 hover:text-black'}`}
                      >
                        {book.isFeatured ? 'Starred' : 'Star'}
                      </button>
                      <Link to={`/admin/books/edit/${book.id}`} className="text-[9px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-800">Edit</Link>
                      <button onClick={() => handleDelete(book.id)} className="text-[9px] uppercase font-bold tracking-widest text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
