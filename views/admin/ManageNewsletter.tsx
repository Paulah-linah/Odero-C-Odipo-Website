import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export const ManageNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id,email,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers((data || []) as Subscriber[]);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [query, subscribers]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    setIsExporting(true);
    try {
      const lines = ['email,subscribed_at'];
      for (const s of filtered) {
        const email = `"${s.email.replace(/"/g, '""')}"`;
        const date = `"${new Date(s.created_at).toISOString()}"`;
        lines.push(`${email},${date}`);
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-serif font-bold">Newsletter Subscribers</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={load}
            className="border border-black px-4 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={isExporting || filtered.length === 0}
            className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 text-xs font-bold mb-6">{error}</div>}

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email..."
          className="w-full md:w-96 border border-black p-3 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-black overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-gray-500 italic">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-gray-500 italic">No subscribers found.</div>
        ) : (
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Email</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
