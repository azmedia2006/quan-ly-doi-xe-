import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Truck, Users, CalendarDays, X, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/core/global-search/?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'driver': return <Users className="w-4 h-4 text-emerald-500" />;
      case 'schedule': return <CalendarDays className="w-4 h-4 text-amber-500" />;
      default: return <Truck className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm xe, tài xế, lịch trình vận chuyển..."
            className="w-full text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nhập từ khóa (tối thiểu 2 ký tự) để tìm kiếm tức thì trên toàn hệ sinh thái đội xe...
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Không tìm thấy kết quả nào với từ khóa "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(res.url)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0">
                      {getCategoryIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {res.category}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {res.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {res.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
