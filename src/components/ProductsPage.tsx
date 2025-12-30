import React, { useState, useEffect, useMemo } from "react";
import { Product, ProductType } from "../types";
import Pagination from "./Pagination";
import { useDebounce } from "../hooks/useDebounce";

interface ProductsPageProps {
  products: Product[];
  onAddProductClick: (type: ProductType) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onAddProductClick,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProductType>(
    ProductType.JUAL,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();

    return products.filter(
      (p) =>
        p.type === activeSubTab &&
        (!query ||
          (p.name || "").toLowerCase().includes(query) ||
          String(p.id || "").toLowerCase().includes(query) ||
          (p.comment && (p.comment || "").toLowerCase().includes(query))),
    );
  }, [products, activeSubTab, debouncedSearchQuery]);

  // Reset to first page when filter/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, debouncedSearchQuery, itemsPerPage]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleDelete = (id: number | string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      onDeleteProduct(Number(id));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
            Master Data Barang
          </h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">
            Kelola daftar barang jual dan barang celup.
          </p>
        </div>

        <button
          onClick={() => onAddProductClick(activeSubTab)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#111718] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          Tambah {activeSubTab}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all w-full sm:w-64 shadow-sm"
          />
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#101f22] rounded-xl self-start">
          {Object.values(ProductType).map((type) => (
            <button
              key={type}
              onClick={() => setActiveSubTab(type)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === type
                ? "bg-white dark:bg-[#1c2527] text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-[#9db4b9] dark:hover:text-white"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-[#283639] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 dark:bg-[#101f22]">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                    ID Barang
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                    Nama Barang
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">
                    Komentar
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-primary">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white ">
                        Rp{" "}
                        {product.price.toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-[#9db4b9] italic">
                        {product.comment || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded bg-gray-100 dark:bg-[#283639] text-gray-500 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
                      Tidak ada data barang {activeSubTab.toLowerCase()}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredProducts.length}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
