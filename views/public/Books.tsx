
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { storage } from '../../services/storage';

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    setBooks(storage.getBooks());
  }, []);

  return (
    <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <h1 className="text-5xl font-serif font-bold mb-4">The Library</h1>
      <p className="text-gray-500 mb-16 max-w-xl">
        Explore the complete bibliography of Odipo C. Odero. From published memoirs to experimental anthologies.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {books.map(book => (
          <div key={book.id} className="group cursor-pointer">
            <Link to={`/books/${book.slug}`}>
              <div className="relative overflow-hidden mb-6 bg-gray-100 aspect-[2/3]">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 text-[10px] uppercase font-bold tracking-widest border border-black">
                  {book.status}
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2 group-hover:underline underline-offset-4">{book.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 italic mb-4">{book.synopsis}</p>
              <p className="font-bold text-lg">KES {book.price.toLocaleString()}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
