
import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../types';

interface NewCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  initialData?: Customer | null;
}

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    npwpNumber: '',
    npwpName: '',
    npwpAddress: '',
    npwpPhone: '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone,
        npwpNumber: initialData.npwpNumber,
        npwpName: initialData.npwpName,
        npwpAddress: initialData.npwpAddress,
        npwpPhone: initialData.npwpPhone,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        npwpNumber: '',
        npwpName: '',
        npwpAddress: '',
        npwpPhone: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: initialData?.id || `${Math.floor(10 + Math.random() * 90)}`, // Use existing ID or temporary new one (DB should ideally handle this)
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      npwpNumber: formData.npwpNumber,
      npwpName: formData.npwpName,
      npwpAddress: formData.npwpAddress,
      npwpPhone: formData.npwpPhone,
      status: initialData?.status || CustomerStatus.ACTIVE,
      avatar: initialData?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name.slice(0, 2)}`,
    };

    onSubmit(newCustomer);
    onClose();
    if (!initialData) {
      setFormData({
        name: '',
        address: '',
        phone: '',
        npwpNumber: '',
        npwpName: '',
        npwpAddress: '',
        npwpPhone: '',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1c2527] w-full max-w-4xl rounded-xl border border-gray-200 dark:border-[#283639] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#283639] bg-gray-50 dark:bg-[#101f22]">
          <h3 className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">group</span>
            {initialData ? "Edit Customer" : "Customer Registration"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Customer Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-primary rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Customer</h4>
              </div>
              <div className="bg-gray-50/50 dark:bg-[#101f22]/30 p-4 rounded-lg border border-gray-100 dark:border-[#283639] flex flex-col gap-4">
                <InputRow
                  label="Nama"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="PT. Example Jaya"
                />
                <InputRow
                  label="Alamat"
                  isTextArea
                  value={formData.address}
                  onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Raya Utama No. 123..."
                />
                <InputRow
                  label="No.Tlp"
                  value={formData.phone}
                  onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="021-xxxxxx"
                />
              </div>
            </div>

            {/* NPWP Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-purple-500 rounded-full"></div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">NPWP</h4>
              </div>
              <div className="bg-gray-50/50 dark:bg-[#101f22]/30 p-4 rounded-lg border border-gray-100 dark:border-[#283639] flex flex-col gap-4">
                <InputRow
                  label="N.P.W.P"
                  value={formData.npwpNumber}
                  onChange={(e: any) => setFormData({ ...formData, npwpNumber: e.target.value })}
                  placeholder="00.000.000.0-000.000"
                />
                <InputRow
                  label="Nama"
                  value={formData.npwpName}
                  onChange={(e: any) => setFormData({ ...formData, npwpName: e.target.value })}
                  placeholder="Nama sesuai NPWP"
                />
                <InputRow
                  label="Alamat"
                  isTextArea
                  value={formData.npwpAddress}
                  onChange={(e: any) => setFormData({ ...formData, npwpAddress: e.target.value })}
                  placeholder="Alamat sesuai NPWP"
                />
                <InputRow
                  label="No.Tlp"
                  value={formData.npwpPhone}
                  onChange={(e: any) => setFormData({ ...formData, npwpPhone: e.target.value })}
                  placeholder="Optional"
                />
              </div>
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
              Simpan Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputRow = ({ label, value, onChange, placeholder, isTextArea = false }: any) => (
  <div className="flex gap-4 items-start">
    <label className="text-xs font-bold text-gray-500 dark:text-[#9db4b9] w-20 pt-2 shrink-0">{label} :</label>
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

export default NewCustomerForm;
