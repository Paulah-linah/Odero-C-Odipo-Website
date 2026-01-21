import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { supabase } from '../../services/supabaseClient';

interface ComingSoonBook {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  price_kes: number;
  status: string;
  cover_path: string | null;
  cover_url: string | null;
  published_date: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  coverFile?: File;
}

export const ManageComingSoon: React.FC = () => {
  const [comingSoonBooks, setComingSoonBooks] = useState<ComingSoonBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingBook, setEditingBook] = useState<ComingSoonBook | null>(null);
  const [formData, setFormData] = useState({
    title: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchComingSoonBooks();
  }, []);

  const fetchComingSoonBooks = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', BookStatus.COMING_SOON)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComingSoonBooks(data || []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load coming soon books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let coverPath = '';
      let coverUrl = '';

      // Upload cover image if provided
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `coming-soon-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('book-covers')
          .getPublicUrl(fileName);

        coverPath = uploadData.path;
        coverUrl = urlData.publicUrl;
      }

      if (isEditing && editingBook) {
        // Update existing book
        const updateData: any = {
          title: formData.title,
          updated_at: new Date().toISOString()
        };

        if (coverFile) {
          updateData.cover_url = coverUrl;
          updateData.cover_path = coverPath;
        }

        const { error } = await supabase
          .from('books')
          .update(updateData)
          .eq('id', editingBook.id);

        if (error) throw error;
      } else {
        // Create new book
        const { data, error } = await supabase
          .from('books')
          .insert({
            title: formData.title,
            synopsis: '',
            price_kes: 1200,
            status: BookStatus.COMING_SOON,
            published_date: new Date().toISOString().split('T')[0],
            is_featured: false,
            cover_url: coverUrl || '',
            cover_path: coverPath || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchComingSoonBooks();
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save coming soon book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (book: ComingSoonBook) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
    });
    setCoverPreview(book.cover_url || null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coming soon book?')) return;
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchComingSoonBooks();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete coming soon book');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const current = comingSoonBooks.find(book => book.id === id);
    if (!current) return;
    
    try {
      const { error } = await supabase
        .from('books')
        .update({ is_featured: !current.is_featured })
        .eq('id', id);
      
      if (error) throw error;
      await fetchComingSoonBooks();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update featured status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
    });
    setCoverFile(null);
    setCoverPreview(null);
    setEditingBook(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold">Manage Coming Soon Books</h1>
        <button
          onClick={() => resetForm()}
          className="bg-black text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white border border-black p-8 mb-8">
        <h2 className="text-xl font-serif font-bold mb-6">
          {isEditing ? 'Edit Coming Soon Book' : 'Create New Coming Soon Book'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Cover Image */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Cover Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {coverPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-64 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm">Upload cover image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 hover:text-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Book Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm uppercase tracking-widest font-bold mb-3">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (isEditing ? 'Update Book' : 'Create Book')}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-black px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Books List */}
      <div className="bg-white border border-black">
        {comingSoonBooks.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500">
            No coming soon books found. Create your first coming soon book to get started.
          </div>
        )}

        {isLoading && (
          <div className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-64 mx-auto"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {comingSoonBooks.length > 0 && (
          <div className="bg-gray-50 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Cover</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Title</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comingSoonBooks.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {book.cover_url ? (
                        <img 
                          src={book.cover_url} 
                          alt={book.title} 
                          className="w-16 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No cover</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-serif font-bold text-sm">{book.title}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button 
                          onClick={() => handleEdit(book)}
                          className="text-[9px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id)}
                          className="text-[9px] uppercase font-bold tracking-widest text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
