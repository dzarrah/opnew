import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-2 border-t border-gray-200 dark:border-[#283639]">
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#9db4b9]">
        <span>
          Menampilkan <span className="font-bold text-gray-900 dark:text-white">{totalItems === 0 ? 0 : startItem}</span> -{" "}
          <span className="font-bold text-gray-900 dark:text-white">{endItem}</span> dari{" "}
          <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> data
        </span>
        
        <div className="flex items-center gap-2">
          <span>Baris:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] text-gray-900 dark:text-white text-xs rounded-lg focus:ring-primary focus:border-primary block p-1.5 outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283639] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-gray-400">
            chevron_left
          </span>
        </button>

        {/* Simple Page Indicator */}
        <div className="flex items-center gap-1 px-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
                Halaman {currentPage} dari {totalPages || 1}
            </span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283639] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-600 dark:text-gray-400">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
