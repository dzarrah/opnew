
import React, { useState } from 'react';
import { OrderStatus } from '../types';

interface NewOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: any) => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    client: '',
    material: 'Organic Cotton',
    quantity: '',
    unit: 'm',
    deadline: '',
    priority: 'Normal'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: OrderStatus.SCHEDULED,
      quantity: `${formData.quantity}${formData.unit}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#283639] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#283639]">
          <h3 className="text-gray-900 dark:text-white text-xl font-bold">Create New Production Order</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 dark:text-[#9db4b9] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Client Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Zara Home"
              className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2.5 px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Material Type</label>
              <select
                className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2.5 px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all appearance-none"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              >
                <option>Organic Cotton</option>
                <option>Recycled Polyester</option>
                <option>Silk Charmeuse</option>
                <option>Heavy Denim</option>
                <option>Linen Blend</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Deadline</label>
              <input
                required
                type="date"
                className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2.5 px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all dark:color-scheme-dark"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Quantity</label>
              <input
                required
                type="number"
                placeholder="0"
                className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2.5 px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Unit</label>
              <select
                className="bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg py-2.5 px-4 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all appearance-none"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="m">Meters (m)</option>
                <option value="kg">Kilos (kg)</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500 dark:text-[#9db4b9]">Priority Level</label>
            <div className="flex gap-2">
              {['Normal', 'High', 'Urgent'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: level })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    formData.priority === level 
                    ? 'bg-primary text-[#111718] border-primary' 
                    : 'bg-transparent text-gray-500 dark:text-[#9db4b9] border-gray-200 dark:border-[#283639] hover:bg-gray-100 dark:hover:bg-[#283639]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-[#283639] text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#283639] transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-[#111718] font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20"
            >
              Queue Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderForm;
