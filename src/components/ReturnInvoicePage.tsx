import React, { useState, useEffect } from 'react';
import { ReturnInvoice, Customer, Product, SalesInvoice } from '../types';
import Pagination from "./Pagination";

interface ReturnInvoicePageProps {
  invoices: ReturnInvoice[];
  customers: Customer[];
  products: Product[];
  salesInvoices: SalesInvoice[];
  onAddInvoiceClick: () => void;
  onPrintClick?: (invoice: ReturnInvoice) => void;
  onEditInvoice: (invoice: ReturnInvoice) => void;
  onDeleteInvoice?: (id: string) => void;
}

const ReturnInvoicePage: React.FC<ReturnInvoicePageProps> = ({ invoices, customers, products, salesInvoices, onAddInvoiceClick, onPrintClick, onEditInvoice, onDeleteInvoice }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const getCustomerName = (id: string | number) => customers.find(c => String(c.id) === String(id))?.name || 'Unknown';
  const getProductName = (id: string | number) => products.find(p => String(p.id) === String(id))?.name || 'Unknown';
  const getInvoiceNumber = (id: string | number) => salesInvoices.find(inv => String(inv.id) === String(id))?.invoiceNumber || id;

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

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getInvoiceNumber(inv.salesInvoiceRef).toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(inv.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductName(inv.productId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Faktur Retur</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Kelola pengembalian barang dari konsumen.</p>
        </div>
        <button 
          onClick={onAddInvoiceClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm font-bold hover:bg-danger/20 transition-all shadow-lg shadow-danger/5"
        >
          <span className="material-symbols-outlined text-[20px]">assignment_return</span>
          Buat Retur Baru
        </button>
      </div>

      <div className="flex justify-start">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari faktur retur..."
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
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">No. Bukti</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Ref. Faktur</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Konsumen</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Barang</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Rol</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Meter</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Total Nilai</th>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-danger/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-danger tracking-tighter">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-400 font-medium">{getInvoiceNumber(inv.salesInvoiceRef)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9] whitespace-nowrap">{formatLocalDate(inv.date)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{getCustomerName(inv.customerId)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9]">{getProductName(inv.productId)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{inv.totalRolls}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">{inv.totalMeters.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white ">
                      {inv.totalPrice.toLocaleString('id-ID', { style: 'currency', currency: inv.currency })}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onPrintClick?.(inv)}
                            className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-danger transition-colors" title="Print Bukti Retur">
                            <span className="material-symbols-outlined text-sm">print</span>
                          </button>
                          <button 
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => onDeleteInvoice?.(inv.id)} className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data faktur retur.</td>
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

export default ReturnInvoicePage;