
import React, { useState, useEffect, useMemo } from 'react';
import { SalesInvoice, Customer, Product } from '../types';
import Pagination from "./Pagination";
import { useDebounce } from "../hooks/useDebounce";

interface SalesInvoicePageProps {
  invoices: SalesInvoice[];
  customers: Customer[];
  products: Product[];
  onAddInvoiceClick: () => void;
  onPrintClick?: (invoice: SalesInvoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onEditInvoice?: (invoice: SalesInvoice) => void;
}

const SalesInvoicePage: React.FC<SalesInvoicePageProps> = ({
  invoices,
  customers,
  products,
  onAddInvoiceClick,
  onPrintClick,
  onDeleteInvoice,
  onEditInvoice
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Memoized maps for O(1) lookups
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach(c => map.set(String(c.id), c.name));
    return map;
  }, [customers]);

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => map.set(String(p.id), p.name));
    return map;
  }, [products]);

  const getCustomerName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return customerMap.get(String(id)) || 'Unknown';
  };
  const getProductName = (id: string | number | null) => {
    if (id === null || id === undefined) return 'Unknown';
    return productMap.get(String(id)) || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredInvoices = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return invoices;

    return invoices.filter((inv) => {
      const invoiceNumber = (inv.invoiceNumber || "").toLowerCase();
      const customerName = getCustomerName(inv.customerId).toLowerCase();
      const productName = getProductName(inv.productId).toLowerCase();
      const notes = (inv.notes || "").toLowerCase();

      return (
        invoiceNumber.includes(query) ||
        customerName.includes(query) ||
        productName.includes(query) ||
        notes.includes(query)
      );
    });
  }, [invoices, debouncedSearchQuery, customerMap, productMap]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    return filteredInvoices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredInvoices, currentPage, itemsPerPage]);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Faktur Penjualan</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Kelola faktur dan rincian pengiriman kain.</p>
        </div>
        <button
          onClick={onAddInvoiceClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#111718] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]">post_add</span>
          Buat Faktur Baru
        </button>
      </div>

      <div className="flex justify-start">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari faktur, konsumen..."
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
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">No. Faktur</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Konsumen</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Rol</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Meter</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Total Tagihan</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-primary tracking-tighter">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{formatDate(inv.date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{getCustomerName(inv.customerId)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{getProductName(inv.productId)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{inv.totalRolls}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{inv.totalMeters.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">
                      {inv.totalPrice.toLocaleString('id-ID', { style: 'currency', currency: inv.currency })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPrintClick?.(inv)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Print Faktur">
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        <button
                          onClick={() => onEditInvoice?.(inv)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Edit Faktur">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteInvoice?.(inv.id)}
                          className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data faktur penjualan.</td>
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
            totalItems={filteredInvoices.length}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesInvoicePage;
