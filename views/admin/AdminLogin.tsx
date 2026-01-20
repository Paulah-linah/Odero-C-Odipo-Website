
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigate('/admin/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <Link to="/" className="text-5xl font-signature inline-block">Odipo C. Odero</Link>
          <p className="uppercase text-[10px] tracking-widest font-bold text-gray-400 mt-2">Private Access Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="bg-white p-10 border border-gray-200 shadow-xl">
          <h2 className="text-2xl font-serif font-bold mb-8">Login to Dashboard</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 font-bold">{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Email</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b-2 border-gray-100 p-2 focus:outline-none focus:border-black transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-2 border-gray-100 p-2 focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Authenticating...' : 'Authenticate'}
            </button>
          </div>
          
          <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Odipo C. Odero Content Management System
          </p>
        </form>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-gray-400 hover:text-black transition-colors text-xs font-bold uppercase tracking-widest">← Back to Site</Link>
        </div>
      </div>
    </div>
  );
};
