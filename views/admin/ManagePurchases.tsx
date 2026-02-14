import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface Purchase {
  id: string;
  book_id: string;
  book_title: string;
  buyer_phone: string;
  buyer_email?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

const statusOptions: Purchase['status'][] = ['pending', 'paid', 'completed', 'cancelled'];

export const ManagePurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerInfo, setViewerInfo] = useState<{ email?: string; role?: string } | null>(null);

  const getErrText = (err: unknown, fallback: string) => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const anyErr = err as any;
      const parts = [anyErr.message, anyErr.details, anyErr.hint, anyErr.code].filter(Boolean);
      if (parts.length > 0) return parts.join(' | ');
    }
    if (err instanceof Error) return err.message;
    return fallback;
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setViewerInfo(null);
        return;
      }

      const session = data.session;
      const email = session?.user?.email ?? undefined;
      const role = (session?.user?.app_metadata as any)?.role ?? undefined;
      setViewerInfo({ email, role });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      console.error('Fetch purchases error:', err);
      setError(getErrText(err, 'Failed to fetch purchases'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Purchase['status']) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchPurchases();
    } catch (err) {
      setError(getErrText(err, 'Failed to update status'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this purchase record? This cannot be undone.');
    if (!ok) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('purchases').delete().eq('id', id);
      if (error) throw error;
      await fetchPurchases();
    } catch (err) {
      setError(getErrText(err, 'Failed to delete purchase'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = searchQuery.trim() === '' || 
      p.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.buyer_phone.includes(searchQuery) ||
      (p.buyer_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatKes = (amount: number) => `KES ${amount.toLocaleString()}`;
  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          Error: {error}
        </div>
        <button
          onClick={fetchPurchases}
          className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold">Manage Purchases</h2>
        <button
          onClick={fetchPurchases}
          className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by book title, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-black p-3 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-black p-3 focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-black overflow-x-auto">
        {filteredPurchases.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-gray-500">
            <div className="text-sm font-bold text-black mb-2">No purchases found.</div>
            <div className="text-xs text-gray-500">
              If you can see purchases in Supabase but not here, it’s usually because RLS policies are blocking reads.
            </div>
            {viewerInfo?.email && (
              <div className="mt-4 text-xs text-gray-500">
                Signed in as: <span className="font-bold text-black">{viewerInfo.email}</span>
                {viewerInfo.role ? (
                  <>
                    {' '}
                    (role: <span className="font-bold text-black">{viewerInfo.role}</span>)
                  </>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 min-w-[700px]">
            {filteredPurchases.map(purchase => (
              <div key={purchase.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-serif font-bold truncate">{purchase.book_title}</h3>
                      <span className={`px-2 py-1 text-xs uppercase tracking-widest font-bold flex-shrink-0 ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 mb-2">
                      <span>Qty: {purchase.quantity}</span>
                      <span>•</span>
                      <span>{formatKes(purchase.unit_price)} each</span>
                      <span>•</span>
                      <span className="font-bold text-black">{formatKes(purchase.total_amount)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                      <span>Phone: {purchase.buyer_phone}</span>
                      {purchase.buyer_email && (
                        <>
                          <span>•</span>
                          <span>Email: {purchase.buyer_email}</span>
                        </>
                      )}
                      {purchase.payment_method && (
                        <>
                          <span>•</span>
                          <span>Method: {purchase.payment_method}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(purchase.created_at)}</span>
                      {purchase.payment_reference && (
                        <>
                          <span>•</span>
                          <span>Ref: {purchase.payment_reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:ml-4 flex-shrink-0">
                    <select
                      value={purchase.status}
                      onChange={(e) => handleStatusUpdate(purchase.id, e.target.value as Purchase['status'])}
                      disabled={updatingId === purchase.id || deletingId === purchase.id}
                      className="text-xs border border-black px-2 py-1 focus:outline-none focus:border-black disabled:opacity-50"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(purchase.id)}
                      disabled={deletingId === purchase.id || updatingId === purchase.id}
                      className="text-[9px] uppercase font-bold tracking-widest text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === purchase.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
