
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookStatus } from '../../types';
import { booksApi } from '../../services/books';

export const Home: React.FC = () => {
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [comingSoonBooks, setComingSoonBooks] = useState<Book[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      setError('');
      try {
        const books = await booksApi.list();
        if (!mounted) return;
        const featured = books.find((b) => b.isFeatured) || books[0] || null;
        setFeaturedBook(featured);
        
        // Filter for coming soon books
        const comingSoon = books.filter(book => book.status === BookStatus.COMING_SOON);
        setComingSoonBooks(comingSoon);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load books');
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
          Uncoloured <br/>Stories.
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed">
            Odipo C. Odero writes uncoloured stories- shaped by memory, love, loss, observation, and the quiet things we feel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/books" className="bg-black text-white px-10 py-4 uppercase text-sm tracking-widest font-bold text-center hover:bg-white hover:text-black border border-black transition-all">
              Explore Books
            </Link>
            <Link to="/blog" className="border border-black px-10 py-4 uppercase text-sm tracking-widest font-bold text-center hover:bg-black hover:text-white transition-all">
              Read Blog
            </Link>
          </div>
        </div>
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 border border-black opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src="/images/my-hero.jpeg" 
              alt="Hero image" 
              className="w-full max-w-md grayscale shadow-2xl transition-transform hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Featured Book */}
      {error && (
        <section className="bg-red-50 py-6 px-6 md:px-12 border-y border-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-red-600 text-xs font-bold">{error}</div>
          </div>
        </section>
      )}
      {featuredBook && (
        <section className="bg-gray-50 py-24 px-6 md:px-12 border-y border-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
               <img 
                src={featuredBook.coverImage} 
                alt={featuredBook.title} 
                className="w-full max-w-xs shadow-2xl border-4 border-white object-cover"
               />
            </div>
            <div className="w-full md:w-2/3">
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-gray-400 mb-4 block">Featured Work</span>
              <h2 className="text-5xl font-serif font-bold mb-6 italic">{featuredBook.title}</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed font-light italic">
                "{featuredBook.synopsis}"
              </p>
              <Link 
                to={`/books/${featuredBook.slug}`} 
                className="inline-block text-black font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Books */}
      {comingSoonBooks.length > 0 && (
        <section className="py-24 px-6 text-center">
          <h3 className="text-3xl font-serif mb-12">Coming Soon to Your Bookshelf</h3>
          <div className="flex flex-wrap justify-center gap-12">
            {comingSoonBooks.map(book => (
              <div key={book.id} className="w-48 group">
                <div className="h-64 bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center mb-4 transition-all group-hover:bg-white group-hover:border-black">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-gray-400 group-hover:text-black">{book.title}</span>
                  )}
                </div>
                <p className="uppercase text-[10px] tracking-widest font-bold">{book.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon Placeholder - Only show when no coming soon books exist */}
      {comingSoonBooks.length === 0 && (
        <section className="py-24 px-6 text-center">
          <h3 className="text-3xl font-serif mb-12">Coming Soon to Your Bookshelf</h3>
          <div className="flex flex-wrap justify-center gap-12">
            {[1,2,3].map(i => (
              <div key={i} className="w-48 group">
                <div className="h-64 bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center mb-4 transition-all group-hover:bg-white group-hover:border-black">
                  <span className="font-serif text-gray-400 group-hover:text-black">Untitled #{i}</span>
                </div>
                <p className="uppercase text-[10px] tracking-widest font-bold">In Development</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
