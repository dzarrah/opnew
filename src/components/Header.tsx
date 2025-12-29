
import React from 'react';

interface HeaderProps {
  onNewOrderClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  activeTab: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewOrderClick, isDarkMode, toggleTheme, activeTab, onMenuClick }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'customers': return 'Customer Relationships';
      case 'suppliers': return 'Supplier Directory';
      case 'products': return 'Master Data Barang';
      case 'sales_invoices': return 'Faktur Penjualan';
      case 'return_invoices': return 'Faktur Retur (Barang Kembali)';
      case 'dyeing_orders': return 'Order Pencelupan (SJ Celup)';
      case 'dyeing_results': return 'Hasil Pencelupan (Terima Barang)';
      default: return 'Production Overview';
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-[#283639] px-6 py-4 bg-white dark:bg-background-dark sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-gray-900 dark:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283639] transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">{getTitle()}</h2>
      </div>
      
      <div className="flex items-center justify-end gap-4 flex-1">
        <div className="hidden sm:flex max-w-md w-full relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9db4b9]">search</span>
          <input 
            className="w-full bg-gray-50 dark:bg-[#1c2527] border-none rounded-lg py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#5a7075] focus:ring-1 focus:ring-primary text-sm transition-colors duration-300" 
            placeholder="Search..." 
            type="text"
          />
        </div>
        
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-[#283639] pl-4">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center size-10 rounded-lg bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#283639] text-gray-500 dark:text-[#9db4b9] hover:text-gray-900 dark:hover:text-white transition-all duration-300"
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined fill">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={onNewOrderClick}
            className="flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-[#111718] rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/10 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px] mr-2">add</span>
            Faktur Baru
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
