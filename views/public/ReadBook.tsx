import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { digitalAccessApi } from '../../services/digitalAccess';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

export const ReadBook: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenderingMore, setIsRenderingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [renderedCount, setRenderedCount] = useState(0);
  const [error, setError] = useState('');
  const renderScale = Math.min(3.8, Math.max(2.8, (window.devicePixelRatio || 1) * 2.2));

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

        setTotalPages(pdf.numPages);
        setPages(new Array(pdf.numPages).fill(''));

        const renderPage = async (n: number) => {
          const page = await pdf.getPage(n);
          const viewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas not supported');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');

          if (!cancelled) {
            setPages((prev) => {
              const next = [...prev];
              next[n - 1] = dataUrl;
              return next;
            });
            setRenderedCount((prev) => prev + 1);
          }
        };

        // Fast first paint: render page 1 immediately.
        await renderPage(1);
        if (cancelled) return;
        setIsLoading(false);

        // Render remaining pages progressively in background.
        if (pdf.numPages > 1) {
          setIsRenderingMore(true);
          for (let n = 2; n <= pdf.numPages; n++) {
            await renderPage(n);
            if (cancelled) return;
          }
          if (!cancelled) setIsRenderingMore(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to render book');
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
  }, [token, renderScale]);

  return (
    <div className="min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Reader</h1>
          <Link to="/recover" className="text-[10px] uppercase font-bold tracking-widest text-gray-600 hover:text-black">
            Recover another purchase
          </Link>
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

          <div className="space-y-4">
            {pages.map((src, idx) => (
              <div key={`${idx}-${src.length}`} className="border border-gray-200 bg-gray-50">
                {src ? (
                  <img
                    src={src}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-auto block"
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
