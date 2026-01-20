
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Book } from '../../types';
import { booksApi } from '../../services/books';
import { storage } from '../../services/storage';

export const BookDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      if (!slug) {
        setBook(null);
        return;
      }

      setError('');
      setIsLoading(true);
      try {
        const found = await booksApi.getBySlug(slug);
        if (!mounted) return;
        setBook(found);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load book');
        setBook(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (isLoading) return <div className="py-40 text-center font-serif text-2xl">Searching the archives...</div>;

  if (!book) {
    return (
      <div className="py-40 text-center font-serif text-2xl">
        {error || 'Book not found.'}
      </div>
    );
  }

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;

  const totalAmount = book.price * quantity;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      storage.addOrder({
        id: Math.random().toString(36).substr(2, 9),
        bookId: book.id,
        customerName: 'Guest User',
        customerEmail: 'guest@example.com',
        amount: totalAmount,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });
      setIsProcessing(false);
      setStep('confirm');
    }, 2000);
  };

  return (
    <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full shadow-2xl border-8 border-white transition-all duration-500"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="uppercase tracking-[0.3em] text-xs font-bold text-gray-400 mb-4 block">{book.status}</span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">{book.title}</h1>
          <div className="prose prose-lg mb-10 text-gray-700 italic leading-relaxed">
            {book.synopsis}
          </div>
          <div className="mb-10 flex items-baseline gap-4">
            <span className="text-3xl font-bold">{formatKes(book.price)}</span>
            <span className="text-gray-400 line-through">{formatKes(book.price * 1.2)}</span>
          </div>
          <button 
            onClick={() => {
              setQuantity(1);
              setStep('details');
              setShowPayment(true);
            }}
            className="bg-black text-white px-12 py-5 uppercase text-sm tracking-widest font-bold hover:bg-white hover:text-black border border-black transition-all"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Payment Modal Sandbox */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white p-8 max-w-md w-full border-t-8 border-black shadow-2xl">
            {step === 'details' ? (
              <>
                <h2 className="text-2xl font-serif font-bold mb-6">Complete Purchase</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Book</span>
                    <span className="font-bold">{book.title}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 items-center">
                    <span className="text-gray-500">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        readOnly
                        aria-label="Quantity"
                        value={quantity}
                        className="w-12 h-9 border border-black text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="w-9 h-9 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold">{formatKes(totalAmount)}</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">M-Pesa Number</label>
                  <input type="text" placeholder="254712345678" className="w-full border border-black p-3 focus:outline-none" />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowPayment(false)}
                    className="flex-1 border border-black py-3 uppercase text-xs font-bold tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="flex-1 bg-black text-white py-3 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl">✓</span>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4">Thank You!</h2>
                <p className="text-gray-600 mb-8">Your order for <span className="font-bold">{book.title}</span> has been processed successfully. (Sandbox Mode)</p>
                <button 
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest"
                >
                  Return to Site
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
