import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface PaginationFooterProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function PaginationFooter({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationFooterProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border-light/50 px-5 py-3 bg-white/50",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>
          Showing <span className="font-semibold text-heading">{from}</span>–
          <span className="font-semibold text-heading">{to}</span> of{" "}
          <span className="font-semibold text-heading">{total}</span>
        </span>
        {onPageSizeChange && (
          <label className="inline-flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-xs border border-border-light bg-white rounded-md px-2 py-1 text-heading focus:outline-none focus:border-accent"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => !isFirst && onPageChange(page - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-heading bg-white border border-border-light rounded-lg hover:border-accent/40 hover:bg-background-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <LucideChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>
        <span className="text-xs text-muted px-1">
          Page <span className="font-semibold text-heading">{page}</span> of{" "}
          <span className="font-semibold text-heading">{totalPages || 1}</span>
        </span>
        <button
          type="button"
          onClick={() => !isLast && onPageChange(page + 1)}
          disabled={isLast}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-heading bg-white border border-border-light rounded-lg hover:border-accent/40 hover:bg-background-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <LucideChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
