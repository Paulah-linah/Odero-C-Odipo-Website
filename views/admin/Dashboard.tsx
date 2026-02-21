
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { supabase } from '../../services/supabaseClient';

type RecentPurchase = {
  id: string;
  buyer_email: string | null;
  buyer_phone: string;
  total_amount: number;
  created_at: string;
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    books: 0,
    blogs: 0,
    events: 0,
    sales: 0,
  });
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError('');
      try {
        const [
          booksRes,
          blogsRes,
          purchasesRes,
          recentRes,
        ] = await Promise.all([
          supabase.from('books').select('id', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
          supabase
            .from('purchases')
            .select('id,total_amount', { count: 'exact' })
            .in('status', ['paid', 'completed']),
          supabase
            .from('purchases')
            .select('id,buyer_email,buyer_phone,total_amount,created_at')
            .in('status', ['paid', 'completed'])
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (booksRes.error) throw booksRes.error;
        if (blogsRes.error) throw blogsRes.error;
        if (purchasesRes.error) throw purchasesRes.error;
        if (recentRes.error) throw recentRes.error;

        const events = storage.getEvents();
        const totalSales = (purchasesRes.data || []).reduce((sum, row: any) => sum + Number(row.total_amount || 0), 0);

        if (!mounted) return;
        setStats({
          books: booksRes.count ?? 0,
          blogs: blogsRes.count ?? 0,
          events: events.length,
          sales: totalSales,
        });
        setRecentPurchases((recentRes.data || []) as RecentPurchase[]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load dashboard');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
    { label: 'Total Books', value: stats.books, link: '/admin/books' },
    { label: 'Blog Posts', value: stats.blogs, link: '/admin/blog' },
    { label: 'Upcoming Events', value: stats.events, link: '/admin/events' },
    { label: 'Total Sales (KES)', value: stats.sales.toLocaleString(), link: '/admin/purchases' },
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Admin Overview</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 font-bold">{error}</div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
        {statCards.map((stat, i) => (
          <Link key={i} to={stat.link} className="bg-white p-4 md:p-6 border border-gray-200 shadow-sm hover:border-black transition-colors">
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 md:mb-2">{stat.label}</p>
            <p className="text-3xl md:text-4xl font-serif">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Quick Actions */}
        <div className="bg-black text-white p-6 md:p-8">
          <h2 className="text-2xl font-serif mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/books/new" className="bg-white text-black p-4 text-center font-bold text-xs uppercase tracking-widest hover:bg-gray-200 block">New Book</Link>
            <Link to="/admin/blog/new" className="bg-white text-black p-4 text-center font-bold text-xs uppercase tracking-widest hover:bg-gray-200 block">New Post</Link>
          </div>
          <p className="mt-8 text-gray-400 text-xs italic leading-relaxed">"Writing is its own reward, but keeping the store clean is necessary work."</p>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-serif mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentPurchases.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No recent transactions recorded.</p>
            ) : (
              recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                  <div>
                    <p className="font-bold">{purchase.buyer_email || purchase.buyer_phone}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{new Date(purchase.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-serif font-bold">KES {Number(purchase.total_amount || 0).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
