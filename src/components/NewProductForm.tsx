import React, { useState } from "react";
import { Product, ProductType } from "../types";

interface NewProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  initialType?: ProductType;
  initialData?: Product | null;
}

const NewProductForm: React.FC<NewProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialType = ProductType.JUAL,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    comment: "",
    type: initialType,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        comment: initialData.comment || "",
        type: initialData.type,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        comment: "",
        type: initialType,
      });
    }
  }, [initialData, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...formData,
      id: initialData?.id || 0,
    };
    onSubmit(newProduct);
    onClose();
    if (!initialData) {
      setFormData({ name: "", price: 0, comment: "", type: initialType });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1c2527] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#283639] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#283639] bg-gray-50 dark:bg-[#101f22]">
          <h3 className="text-gray-900 dark:text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              inventory
            </span>
            {initialData ? "Edit Data" : `Data ${formData.type}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="space-y-4">
            <InputRow
              label="Nama Barang"
              value={formData.name}
              onChange={(e: any) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukkan nama barang"
            />
            <InputRow
              label="Harga (Rp)"
              type="number"
              value={formData.price}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
            />
            <InputRow
              label="Komentar"
              isTextArea
              value={formData.comment}
              onChange={(e: any) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder="Catatan tambahan..."
            />

            <div className="flex gap-4 items-center">
              <label className="text-xs font-bold text-gray-500 dark:text-[#9db4b9] w-28 shrink-0">
                Jenis :
              </label>
              <div className="flex gap-2 flex-1">
                {Object.values(ProductType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${formData.type === type
                      ? "bg-primary/20 text-primary border-primary"
                      : "bg-transparent text-gray-500 dark:text-[#9db4b9] border-gray-200 dark:border-[#283639] hover:bg-gray-50 dark:hover:bg-[#283639]"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-[#283639]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-[#283639] text-gray-700 dark:text-white text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#283639] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-primary text-[#111718] text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  isTextArea = false,
  type = "text",
}: any) => (
  <div className="flex gap-4 items-start">
    <label className="text-xs font-bold text-gray-500 dark:text-[#9db4b9] w-28 pt-2 shrink-0">
      {label} :
    </label>
    {isTextArea ? (
      <textarea
        rows={3}
        className="flex-1 bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none resize-none transition-all"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className="flex-1 bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default NewProductForm;
