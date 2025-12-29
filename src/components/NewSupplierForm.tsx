
import React, { useState } from 'react';
import { Supplier } from '../types';

interface NewSupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplier: Supplier) => void;
  initialData?: Supplier | null;
}

const NewSupplierForm: React.FC<NewSupplierFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone,
      });
    } else {
      setFormData({ name: '', address: '', phone: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier: Supplier = {
      id: initialData?.id || `S${Math.floor(100 + Math.random() * 899)}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
    };

    onSubmit(newSupplier);
    onClose();
    if (!initialData) {
      setFormData({ name: '', address: '', phone: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1c2527] w-full max-w-xl rounded-xl border border-gray-200 dark:border-[#283639] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#283639] bg-gray-50 dark:bg-[#101f22]">
          <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">factory</span>
            {initialData ? "Edit Supplier" : "Form Suplier"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Suplier</h4>
            </div>

            <div className="bg-gray-50/50 dark:bg-[#101f22]/30 p-4 rounded-lg border border-gray-100 dark:border-[#283639] flex flex-col gap-4">
              <InputRow
                label="Nama Suplier"
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                placeholder="PT. Example Supplier"
              />
              <InputRow
                label="Alamat"
                isTextArea
                value={formData.address}
                onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Supplier No. 456..."
              />
              <InputRow
                label="No. Tlp"
                value={formData.phone}
                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="022-xxxxxx"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#283639]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-[#283639] text-gray-700 dark:text-white text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#283639] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-lg bg-primary text-[#111718] text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Suplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputRow = ({ label, value, onChange, placeholder, isTextArea = false }: any) => (
  <div className="flex gap-4 items-start">
    <label className="text-xs font-bold text-gray-500 dark:text-[#9db4b9] w-24 pt-2 shrink-0">{label} :</label>
    {isTextArea ? (
      <textarea
        rows={3}
        className="flex-1 bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none resize-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    ) : (
      <input
        type="text"
        className="flex-1 bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default NewSupplierForm;
