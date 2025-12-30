import React, { useState, useEffect, useMemo } from 'react';
import { DyeingResult, Supplier, Product, DyeingOrder } from '../types';
import Pagination from "./Pagination";
import { useDebounce } from "../hooks/useDebounce";

interface DyeingResultPageProps {
  results: DyeingResult[];
  suppliers: Supplier[];
  products: Product[];
  dyeingOrders: DyeingOrder[];
  onAddResultClick: () => void;
  onPrintClick?: (result: DyeingResult) => void;
  onEditResult: (result: DyeingResult) => void;
  onDeleteResult?: (id: string) => void;
}

const DyeingResultPage: React.FC<DyeingResultPageProps> = ({ results, suppliers, products, dyeingOrders, onAddResultClick, onPrintClick, onEditResult, onDeleteResult }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Memoized maps for O(1) lookups
  const supplierMap = useMemo(() => {
    const map = new Map<string, string>();
    suppliers.forEach(s => map.set(String(s.id), s.name));
    return map;
  }, [suppliers]);

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => map.set(String(p.id), p.name));
    return map;
  }, [products]);

  const dyeingOrderMap = useMemo(() => {
    const map = new Map<string, string>();
    dyeingOrders.forEach(o => map.set(String(o.id), o.sjNumber));
    return map;
  }, [dyeingOrders]);

  const getSupplierName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return supplierMap.get(String(id)) || 'Unknown';
  };
  const getProductName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return productMap.get(String(id)) || 'Unknown';
  };
  const getDyeingOrderSj = (id: string | number | null) => {
    if (id === null || id === undefined) return 'N/A';
    return dyeingOrderMap.get(String(id)) || String(id);
  };

  const formatLocalDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredResults = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return results;

    return results.filter((res) => {
      const sjNumber = (res.sjNumber || "").toLowerCase();
      const orderSj = getDyeingOrderSj(res.orderSjRef).toLowerCase();
      const supplierName = getSupplierName(res.supplierId).toLowerCase();
      const productName = getProductName(res.productId).toLowerCase();
      const notes = (res.notes || "").toLowerCase();

      return (
        sjNumber.includes(query) ||
        orderSj.includes(query) ||
        supplierName.includes(query) ||
        productName.includes(query) ||
        notes.includes(query)
      );
    });
  }, [results, debouncedSearchQuery, supplierMap, productMap, dyeingOrderMap]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    return filteredResults.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredResults, currentPage, itemsPerPage]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Hasil Pencelupan</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Kelola penerimaan kain hasil proses celup.</p>
        </div>
        <button
          onClick={onAddResultClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-success/10 text-success border border-success/20 rounded-lg text-sm font-bold hover:bg-success/20 transition-all shadow-lg shadow-success/5"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Terima Hasil Baru
        </button>
      </div>

      <div className="flex justify-start">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari hasil celup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-[#283639] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 dark:bg-[#101f22]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">No. SJ Hasil</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Ref. SJ Order</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Rol</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Meter</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Berat (Kg)</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-success/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-success tracking-tighter">{res.sjNumber}</td>
                    <td className="px-6 py-4 text-gray-400">{getDyeingOrderSj(res.orderSjRef)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9] whitespace-nowrap">{formatLocalDate(res.date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{getSupplierName(res.supplierId)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{getProductName(res.productId)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{res.totalRolls}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{res.totalMeters.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold text-success">{res.totalWeight.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPrintClick?.(res)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-success transition-colors" title="Print Bukti Terima">
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        <button
                          onClick={() => onEditResult(res)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => onDeleteResult?.(res.id)} className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data penerimaan hasil celup.</td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredResults.length}
          />
        </div>
      </div>
    </div>
  );
};

export default DyeingResultPage;