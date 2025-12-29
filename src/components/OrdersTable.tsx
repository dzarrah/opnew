
import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.WEAVING:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case OrderStatus.DYEING:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case OrderStatus.SCHEDULED:
        return 'bg-yellow-500/10 text-yellow-600 dark:text-warning border-yellow-500/20';
      case OrderStatus.READY:
        return 'bg-green-500/10 text-green-600 dark:text-success border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-[#101f22]">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Material</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Deadline</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-[#9db4b9] uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-[#283639]">
          {orders.map((order) => (
            <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-[#283639]/50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white ">{order.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{order.client}</td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#9db4b9]">{order.material}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white ">{order.quantity}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.deadline}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
