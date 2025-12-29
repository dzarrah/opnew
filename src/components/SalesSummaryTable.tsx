
import React, { useState, useEffect } from 'react';
import { SalesInvoice, Customer, Product } from '../types';
import Pagination from "./Pagination";

interface SalesSummaryTableProps {
  invoices: SalesInvoice[];
  customers: Customer[];
  products: Product[];
}

const SalesSummaryTable: React.FC<SalesSummaryTableProps> = ({ invoices, customers, products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const getCustomerName = (id: string | number) => customers.find(c => String(c.id) === String(id))?.name || 'Unknown';
  const getProductName = (id: string | number) => products.find(p => String(p.id) === String(id))?.name || 'Unknown';

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

  // Calculate Pagination
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, invoices.length]);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-[#101f22]">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">No. Faktur</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Konsumen</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Barang</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Qty</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Total Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary tracking-tighter">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#9db4b9] whitespace-nowrap">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{getCustomerName(inv.customerId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#9db4b9]">{getProductName(inv.productId)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white ">
                    {inv.totalRolls} Rol / {inv.totalMeters.toFixed(1)} m
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-bold">
                    Rp {inv.totalPrice.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  Belum ada transaksi penjualan terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {invoices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={invoices.length}
        />
      )}
    </div>
  );
};

export default SalesSummaryTable;
