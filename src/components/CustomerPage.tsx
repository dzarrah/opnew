import React, { useState, useEffect } from "react";
import { Customer } from "../types";
import Pagination from "./Pagination";

interface CustomerPageProps {
  customers: Customer[];
  onAddCustomerClick: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

const CustomerPage: React.FC<CustomerPageProps> = ({
  customers,
  onAddCustomerClick,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus customer ini?")) {
      onDeleteCustomer(id);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
            Customer Database
          </h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">
            List client dan database kontak.
          </p>
        </div>
        <button
          onClick={onAddCustomerClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-[#111718] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[18px]">
            person_add
          </span>
          Tambah Customer
        </button>
      </div>

      <div className="flex justify-start">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari customer..."
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
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                  Tlp
                </th>
                <th className="px-4 py-3 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-4 font-bold text-gray-900 dark:text-primary">
                      {customer.id}
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                      {customer.name}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-[#9db4b9] max-w-xs truncate">
                      {customer.address}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-[#9db4b9]">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEditCustomer(customer)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Tidak ada data customer yang cocok.
                  </td>
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
            totalItems={filteredCustomers.length}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
