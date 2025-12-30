import React from "react";
import Logo from "./Logo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dbStatus?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Fixed: Moved NavItem outside of Sidebar to properly handle React types (like 'key') and avoid unnecessary re-renders.
const NavItem: React.FC<{
  item: { id: string; label: string; icon: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ item, activeTab, onTabChange }) => {
  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onTabChange(id);
  };

  return (
    <a
      href={`#${item.id}`}
      onClick={(e) => handleNavClick(e, item.id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${activeTab === item.id
          ? "bg-primary/10 border border-primary/20 text-primary dark:text-white"
          : "hover:bg-gray-100 dark:hover:bg-[#283639] text-gray-500 dark:text-[#9db4b9] hover:text-gray-900 dark:hover:text-white"
        }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? "text-primary" : "text-gray-400 dark:text-[#9db4b9] group-hover:text-gray-900 dark:group-hover:text-white"}`}
      >
        {item.icon}
      </span>
      <p className="text-sm font-medium">{item.label}</p>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  dbStatus,
  isOpen,
  onClose,
}) => {
  const dataMasterItems = [
    { id: "products", label: "Products", icon: "shopping_bag" },
    { id: "customers", label: "Customers", icon: "group" },
    { id: "suppliers", label: "Suppliers", icon: "factory" },
  ];

  const fakturItems = [
    { id: "sales_invoices", label: "Sales Invoices", icon: "description" },
    { id: "return_invoices", label: "Faktur Retur", icon: "keyboard_return" },
  ];

  const dyeingItems = [
    { id: "dyeing_orders", label: "Order Pencelupan", icon: "colors" },
    { id: "dyeing_results", label: "Hasil Pencelupan", icon: "check_circle" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-[#283639] 
          flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <div
            className="cursor-pointer group inline-block"
            onClick={() => onTabChange("dashboard")}
          >
            <Logo />
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-red-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <NavItem
              item={{ id: "dashboard", label: "Dashboard", icon: "dashboard" }}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="px-3 text-[10px] font-bold text-gray-400 dark:text-[#5a7075] uppercase tracking-[0.2em] mb-2">
              Data Master
            </h2>
            <div className="flex flex-col gap-1">
              {dataMasterItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="px-3 text-[10px] font-bold text-gray-400 dark:text-[#5a7075] uppercase tracking-[0.2em] mb-2">
              Transaksi Faktur
            </h2>
            <div className="flex flex-col gap-1">
              {fakturItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="px-3 text-[10px] font-bold text-gray-400 dark:text-[#5a7075] uppercase tracking-[0.2em] mb-2">
              Transaksi Celup
            </h2>
            <div className="flex flex-col gap-1">
              {dyeingItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                />
              ))}
            </div>
          </div>

        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-[#283639]">
          <div className="flex items-start gap-3 px-3 py-3 bg-gray-50 dark:bg-[#1c2527] rounded-xl border border-gray-200 dark:border-[#283639]">
            <div className="bg-center bg-no-repeat bg-cover rounded-lg size-8 ring-2 ring-primary/20 shrink-0 flex items-center justify-center bg-primary">
              <span className="material-symbols-outlined text-background-dark text-lg font-bold">
                corporate_fare
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-gray-900 dark:text-white text-xs font-bold truncate">
                PT. Opin Textile
              </p>
              <p className="text-gray-500 dark:text-[#9db4b9] text-[9px] leading-tight mt-0.5">
                JL Soekarno Hatta, No. 760, Bandung, 40211
              </p>
              {dbStatus && (
                <p
                  className="text-[9px] text-primary mt-1 truncate"
                  title={dbStatus}
                >
                  Status: {dbStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;