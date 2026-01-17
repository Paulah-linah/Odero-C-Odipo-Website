
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../../services/storage';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (username === 'admin' && password === 'odero2024') {
      storage.setSession({ id: '1', username: 'admin', role: 'admin' });
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
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
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b-2 border-gray-100 p-2 focus:outline-none focus:border-black transition-colors"
                placeholder="admin"
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
            
            <button className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors">
              Authenticate
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
