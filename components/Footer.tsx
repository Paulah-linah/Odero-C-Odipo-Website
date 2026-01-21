
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-4xl font-great-vibes">Odipo C. Odero</h3>
          <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
            Exploring the silence between words. A Nairobi-based author dedicated to literary intimacy and storytelling.
          </p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm uppercase tracking-wide">
            <li><a href="/#/books" className="hover:underline">Books</a></li>
            <li><a href="/#/blog" className="hover:underline">Blog</a></li>
            <li><a href="/#/events" className="hover:underline">Events</a></li>
            <li><a href="/#/admin" className="hover:underline">Admin Login</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe for updates on new releases and events.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Email address" 
              className="border border-black px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button className="bg-black text-white px-6 py-2 uppercase text-xs font-bold hover:bg-gray-800 transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 text-center text-[10px] uppercase tracking-widest text-gray-400">
        &copy; {new Date().getFullYear()} Odipo C. Odero. Built from scratch with precision.
      </div>
    </footer>
  );
};
