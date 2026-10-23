import React from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Input } from './Input';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  page = 1,
  totalPages = 1,
  onPageChange,
  filters,
  actions,
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp.',
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Controls Bar */}
      {(onSearchChange || filters || actions) && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onSearchChange && (
              <div className="w-full sm:w-72">
                <Input
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            )}
            {filters && <div className="flex items-center gap-2 overflow-x-auto">{filters}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px] flex flex-col justify-between">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{emptyMessage}</p>
                    <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc thêm bản ghi mới.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={keyExtractor ? keyExtractor(item) : item.id || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 ${col.className || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && onPageChange && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Trang <span className="font-semibold text-slate-900 dark:text-slate-100">{page}</span> trên{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
