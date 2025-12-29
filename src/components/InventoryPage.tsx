
import React from 'react';
import { InventoryItem } from '../types';

interface InventoryPageProps {
  inventory: InventoryItem[];
}

const InventoryPage: React.FC<InventoryPageProps> = ({ inventory }) => {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">Material Inventory</h3>
          <p className="text-gray-500 dark:text-[#9db4b9] text-sm">Real-time stock levels across all manufacturing facilities.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#283639] text-gray-700 dark:text-[#9db4b9] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#283639] transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-[#111718] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            Restock Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-[#283639] shadow-sm">
          <p className="text-gray-500 dark:text-[#9db4b9] text-xs font-bold uppercase mb-1">Total Stock Value</p>
          <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">$248,500</p>
          <div className="mt-4 flex items-center gap-2 text-green-600 text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +4.2% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-[#283639] shadow-sm">
          <p className="text-gray-500 dark:text-[#9db4b9] text-xs font-bold uppercase mb-1">Low Stock Items</p>
          <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">3</p>
          <div className="mt-4 flex items-center gap-2 text-red-600 text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Needs immediate attention
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-[#283639] shadow-sm">
          <p className="text-gray-500 dark:text-[#9db4b9] text-xs font-bold uppercase mb-1">Stock Turnover</p>
          <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">12.4x</p>
          <div className="mt-4 flex items-center gap-2 text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">history</span>
            Average 22 days held
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-[#283639] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-[#101f22]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Material Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Usage Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Last Restocked</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
            {inventory.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#283639]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-white">{item.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 w-40">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#101f22] rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-[#9db4b9]">{item.percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 dark:text-[#9db4b9]">Oct 12, 2023</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary/80 text-sm font-bold">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
