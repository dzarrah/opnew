
import React from 'react';
import { Order } from '../types';
import OrdersTable from './OrdersTable';

interface OrdersPageProps {
  orders: Order[];
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders }) => {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Order Management</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Monitor production lifecycle from intake to delivery.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex items-center">
             <span className="material-symbols-outlined absolute left-3 text-gray-400 dark:text-[#9db4b9] text-[20px]">search</span>
             <input 
               type="text" 
               placeholder="Find order..." 
               className="bg-white dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white w-64"
             />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#283639] text-gray-700 dark:text-[#9db4b9] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#283639] transition-all">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {['All Orders', 'In Production', 'Dyeing', 'Scheduled', 'Ready to Ship'].map((filter, i) => (
          <button 
            key={filter}
            className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
              i === 0 
              ? 'bg-primary text-[#111718] border-primary' 
              : 'bg-white dark:bg-[#1c2527] text-gray-500 dark:text-[#9db4b9] border-gray-200 dark:border-[#283639] hover:bg-gray-50 dark:hover:bg-[#283639]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-[#283639] overflow-hidden shadow-sm">
        <OrdersTable orders={orders} />
      </div>

      <div className="flex justify-between items-center bg-gray-50 dark:bg-[#101f22] p-4 rounded-xl border border-gray-200 dark:border-[#283639]">
        <p className="text-xs text-gray-500 dark:text-[#9db4b9]">Showing {orders.length} active production orders</p>
        <div className="flex gap-2">
           <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#283639] text-gray-400"><span className="material-symbols-outlined">chevron_left</span></button>
           <button className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded">1</button>
           <button className="px-3 py-1 hover:bg-gray-200 dark:hover:bg-[#283639] text-gray-400 text-xs font-bold rounded">2</button>
           <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#283639] text-gray-400"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
