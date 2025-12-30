import React, { useState, useEffect, useMemo } from 'react';
import { DyeingOrder, Supplier, Product } from '../types';
import Pagination from "./Pagination";
import { useDebounce } from "../hooks/useDebounce";

interface DyeingOrderPageProps {
  orders: DyeingOrder[];
  suppliers: Supplier[];
  products: Product[];
  onAddOrderClick: () => void;
  onPrintClick?: (order: DyeingOrder) => void;
  onEditOrder: (order: DyeingOrder) => void;
  onDeleteOrder?: (id: string) => void;
}

const DyeingOrderPage: React.FC<DyeingOrderPageProps> = ({ orders, suppliers, products, onAddOrderClick, onPrintClick, onEditOrder, onDeleteOrder }) => {
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

  const getSupplierName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return supplierMap.get(String(id)) || 'Unknown';
  };
  const getProductName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return productMap.get(String(id)) || 'Unknown';
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

  const filteredOrders = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return orders;

    return orders.filter((ord) => {
      const sjNumber = (ord.sjNumber || "").toLowerCase();
      const supplierName = getSupplierName(ord.supplierId).toLowerCase();
      const productName = getProductName(ord.productId).toLowerCase();
      const color = (ord.color || "").toLowerCase();
      const notes = (ord.notes || "").toLowerCase();

      return (
        sjNumber.includes(query) ||
        supplierName.includes(query) ||
        productName.includes(query) ||
        color.includes(query) ||
        notes.includes(query)
      );
    });
  }, [orders, debouncedSearchQuery, supplierMap, productMap]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Order Pencelupan</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Kelola pengiriman kain untuk proses celup.</p>
        </div>
        <button
          onClick={onAddOrderClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#111718] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]">palette</span>
          Buat SJ Celup Baru
        </button>
      </div>

      <div className="flex justify-start">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari order celup..."
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
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">No. SJ</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Warna</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Rol</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Meter</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Berat (Kg)</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-primary tracking-tighter">{ord.sjNumber}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9] whitespace-nowrap">{formatLocalDate(ord.date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{getSupplierName(ord.supplierId)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{getProductName(ord.productId)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{ord.color}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{ord.totalRolls}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{ord.totalMeters.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold text-primary">{ord.totalWeight.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPrintClick?.(ord)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Print Surat Jalan">
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        <button
                          onClick={() => onEditOrder(ord)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteOrder?.(ord.id)}
                          className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data order pencelupan.</td>
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
            totalItems={filteredOrders.length}
          />
        </div>
      </div>
    </div>
  );
};

export default DyeingOrderPage;