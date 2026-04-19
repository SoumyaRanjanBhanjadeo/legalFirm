import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-lg border">
      {/* Info Text */}
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Showing <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{startItem}</span> to{' '}
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{endItem}</span> of{' '}
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/10"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/10"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-10 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${currentPage === page
                    ? 'bg-gold text-black'
                    : 'hover:bg-gold/10'
                  }`}
                style={{
                  color: currentPage === page ? 'black' : 'var(--text-primary)'
                }}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/10"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/10"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
