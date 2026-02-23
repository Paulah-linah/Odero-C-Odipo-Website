import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { digitalAccessApi } from '../../services/digitalAccess';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

export const ReadBook: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenderingMore, setIsRenderingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [renderedCount, setRenderedCount] = useState(0);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState<number>(() => (window.innerWidth < 768 ? 1.45 : 1));
  const renderScale = useMemo(() => {
    const dpr = window.devicePixelRatio || 1;
    if (window.innerWidth < 768) return Math.min(2.4, Math.max(1.8, dpr * 1.6));
    return Math.min(2.8, Math.max(2.0, dpr * 1.8));
  }, []);
  const pdfRef = useRef<any | null>(null);
  const renderingRef = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  if (!token) {
    return (
      <div className="py-24 px-6 md:px-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-4">Missing access token</h1>
        <Link to="/recover" className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Recover purchase
        </Link>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;

    const loadPages = async () => {
      if (!token) return;
      setIsLoading(true);
      setIsRenderingMore(false);
      setError('');
      setPages([]);
      setTotalPages(0);
      setRenderedCount(0);
      try {
        const buffer = await digitalAccessApi.fetchBookPdf(token);
        const pdf = await getDocument({ data: buffer }).promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPages(new Array(pdf.numPages).fill(''));
        setIsLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          const message = e?.message ?? 'Failed to render book';

          // If token is stale/revoked, auto-recover using saved purchase identity.
          const canAutoRecover =
            /invalid token|token revoked|unauthorized|expired/i.test(message);

          if (canAutoRecover) {
            try {
              const raw = localStorage.getItem('odero_reader_identity');
              const parsed = raw ? (JSON.parse(raw) as { ref?: string; email?: string }) : null;
              const ref = String(parsed?.ref || '').trim();
              const email = String(parsed?.email || '').trim().toLowerCase();

              if (ref && email) {
                const { token: freshToken } = await digitalAccessApi.getAccessToken({ reference: ref, email });
                navigate(`/read/${freshToken}`, { replace: true });
                return;
              }
            } catch {
              // Fall through to user-visible error.
            }
          }

          setError(message);
          setPages([]);
          setTotalPages(0);
          setRenderedCount(0);
          setIsRenderingMore(false);
        }
      } finally {
        if (!cancelled && pages.length === 0) setIsLoading(false);
      }
    };

    loadPages();
    return () => {
      cancelled = true;
    };
  }, [token, renderScale, navigate]);

  const renderPage = async (n: number) => {
    if (!pdfRef.current) return;
    if (renderingRef.current.has(n)) return;
    renderingRef.current.add(n);
    try {
      const page = await pdfRef.current.getPage(n);
      const viewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas not supported');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: context, viewport }).promise;
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.85);
      } catch {
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }

      setPages((prev) => {
        const next = [...prev];
        next[n - 1] = dataUrl;
        return next;
      });
      setRenderedCount((prev) => prev + 1);
    } finally {
      renderingRef.current.delete(n);
    }
  };

  useEffect(() => {
    if (!listRef.current || totalPages === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index || '0');
          if (idx > 0) {
            void renderPage(idx);
          }
        }
      },
      { root: null, rootMargin: '800px 0px', threshold: 0.01 }
    );

    const nodes = listRef.current.querySelectorAll('[data-index]');
    nodes.forEach((node) => observerRef.current?.observe(node));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [totalPages]);

  return (
    <div className="min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Reader</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
              className="border border-black px-2 py-1 text-[10px] uppercase tracking-widest font-bold"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
              className="border border-black px-2 py-1 text-[10px] uppercase tracking-widest font-bold"
            >
              A+
            </button>
            <Link to="/recover" className="text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-black ml-2">
              Recover another purchase
            </Link>
          </div>
        </div>

        <div className="bg-white border border-black p-4 md:p-6">
          {isLoading && renderedCount === 0 && (
            <div className="py-20 text-center text-sm text-gray-600">Loading pages...</div>
          )}

          {isRenderingMore && renderedCount > 0 && (
            <div className="mb-4 text-[11px] text-gray-500">
              Rendering pages: {renderedCount}/{totalPages}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-xs font-bold">{error}</div>
          )}

          {!isLoading && !error && pages.length === 0 && (
            <div className="py-20 text-center text-sm text-gray-600">No pages to display.</div>
          )}

          <div className="space-y-4" ref={listRef}>
            {pages.map((src, idx) => (
              <div key={`${idx}-${src.length}`} data-index={idx + 1} className="border border-gray-200 bg-gray-50 overflow-x-auto">
                {src ? (
                  <img
                    src={src}
                    alt={`Page ${idx + 1}`}
                    className="h-auto block max-w-none"
                    style={{ width: `${zoom * 100}%` }}
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="h-48 md:h-72 animate-pulse bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-gray-500">
          Viewing is for personal use only. This reader is image-tile based and watermarked.
        </p>
      </div>
    </div>
  );
};
