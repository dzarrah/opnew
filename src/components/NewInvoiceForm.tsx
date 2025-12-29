import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  SalesInvoice,
  Customer,
  Product,
  ProductType,
  InvoiceRow,
} from "../types";
import SearchableSelect from "./SearchableSelect";

interface NewInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: SalesInvoice) => void;
  customers: Customer[];
  products: Product[];
  invoiceCount: number;
  onPrint?: (type: string, data: any) => void;
  onGenerateInvoiceNumber?: () => Promise<string>;
  initialData?: SalesInvoice | null;
}

const NewInvoiceForm: React.FC<NewInvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  products,
  onPrint,
  onGenerateInvoiceNumber,
  initialData,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>(
    "",
  );
  const [selectedProductId, setSelectedProductId] = useState<string | number>(
    "",
  );

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return "Pilih Tanggal";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Pricing & Currency
  const [currency, setCurrency] = useState("IDR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [pricePerMeter, setPricePerMeter] = useState(0);

  // Additional Details
  const [notaAngka, setNotaAngka] = useState("");
  const [driverName, setDriverName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Grid State: rows with 10 length inputs
  const [gridRows, setGridRows] = useState<InvoiceRow[]>([
    { id: "row-1", lengths: Array(10).fill("") },
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Invoice Number on Open (Only if NEW)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setInvoiceDate(initialData.date);
        setInvoiceNumber(initialData.invoiceNumber);
        setSelectedCustomerId(initialData.customerId);
        setSelectedProductId(initialData.productId);
        setCurrency(initialData.currency);
        setExchangeRate(initialData.exchangeRate);
        setPricePerMeter(initialData.pricePerMeter);
        setNotaAngka(initialData.notaAngka);
        setDriverName(initialData.driverName);
        setPlateNumber(initialData.plateNumber);
        setNotes(initialData.notes);

        // Clone rows and add one empty row at the end for further input
        const existingRows = initialData.rows.map((r) => ({
          ...r,
          lengths: [...r.lengths],
        }));
        existingRows.push({
          id: `row-extra-${Date.now()}`,
          lengths: Array(10).fill(""),
        });
        setGridRows(existingRows);
      } else {
        // Reset for NEW
        setInvoiceDate(today);
        setSelectedCustomerId("");
        setSelectedProductId("");
        setCurrency("IDR");
        setExchangeRate(1);
        setPricePerMeter(0);
        setNotaAngka("");
        setDriverName("");
        setPlateNumber("");
        setNotes("");
        setGridRows([{ id: "row-1", lengths: Array(10).fill("") }]);

        if (onGenerateInvoiceNumber) {
          onGenerateInvoiceNumber().then((num) => setInvoiceNumber(num));
        }
      }
    }
  }, [isOpen, onGenerateInvoiceNumber, initialData, today]);

  // Derived Totals
  const totals = useMemo(() => {
    let rollCount = 0;
    let totalMeters = 0;
    gridRows.forEach((row) => {
      row.lengths.forEach((val) => {
        const num = parseFloat(val as string);
        if (!isNaN(num) && num > 0) {
          rollCount++;
          totalMeters += num;
        }
      });
    });
    const totalPrice = totalMeters * pricePerMeter * exchangeRate;
    return { rollCount, totalMeters, totalPrice };
  }, [gridRows, pricePerMeter, exchangeRate]);

  // Auto fill product price if selected
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        setPricePerMeter(prod.price);
      }
    }
  }, [selectedProductId, products]);

  const handleLengthChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    const newRows = [...gridRows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      lengths: [...newRows[rowIndex].lengths],
    };
    newRows[rowIndex].lengths[colIndex] = value;

    const isLastRow = rowIndex === gridRows.length - 1;
    const isRowComplete = newRows[rowIndex].lengths.every(
      (l) => l !== "" && !isNaN(parseFloat(String(l))) && parseFloat(String(l)) > 0,
    );

    if (isLastRow && isRowComplete) {
      newRows.push({
        id: `row-${Date.now()}`,
        lengths: Array(10).fill(""),
      });
    }

    setGridRows(newRows);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [gridRows.length]);

  if (!isOpen) return null;

  const cleanRows = (rows: InvoiceRow[]): InvoiceRow[] => {
    if (rows.length === 0) return rows;
    const lastRow = rows[rows.length - 1];
    const isLastRowEmpty = lastRow.lengths.every(
      (l) => l === "" || isNaN(parseFloat(String(l))),
    );
    return isLastRowEmpty ? rows.slice(0, -1) : rows;
  };

  const createInvoiceObject = (): SalesInvoice => {
    const cleanedRows = cleanRows(gridRows);
    return {
      id: initialData?.id || Date.now().toString(),
      invoiceNumber,
      date: invoiceDate,
      customerId: String(selectedCustomerId),
      productId: String(selectedProductId),
      currency,
      exchangeRate,
      pricePerMeter,
      totalPrice: totals.totalPrice,
      notaAngka,
      driverName,
      plateNumber,
      notes,
      rows: cleanedRows,
      totalRolls: totals.rollCount,
      totalMeters: totals.totalMeters,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      alert("Harap pilih konsumen dan barang.");
      return;
    }
    if (totals.rollCount === 0) {
      alert("Harap masukkan setidaknya satu ukuran kain.");
      return;
    }

    onSubmit(createInvoiceObject());
    onClose();
  };

  const handleQuickPrint = () => {
    if (!selectedCustomerId || !selectedProductId) {
      alert("Harap pilih konsumen dan barang.");
      return;
    }
    const inv = createInvoiceObject();
    onSubmit(inv); // Save first
    onPrint?.("sales", inv); // Then print
    onClose();
  };

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(selectedCustomerId),
  );
  const barangJual = products.filter((p) => p.type === ProductType.JUAL);

  // Prepare options for SearchableSelect
  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: c.name,
    subLabel: c.address,
  }));
  const productOptions = barangJual.map((p) => ({
    id: p.id,
    label: p.name,
    subLabel: `Rp ${p.price}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div
        className="bg-white dark:bg-card-dark w-full max-w-6xl max-h-[95vh] rounded-xl border border-gray-200 dark:border-[#283639] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Industrial style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#283639] bg-gray-50 dark:bg-[#101f22]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              receipt_long
            </span>
            <h3 className="text-gray-900 dark:text-white text-lg font-bold uppercase tracking-tight">
              {initialData ? "Edit Faktur Penjualan" : "Entri Faktur Penjualan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-6 text-xs text-gray-700 dark:text-[#9db4b9]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {/* Left Section - Metadata */}
            <div className="space-y-2.5">
              <div className="flex items-center">
                <label className="w-20 font-bold shrink-0">No Faktur :</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 text-primary font-bold outline-none focus:ring-1 focus:ring-primary"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-20 font-bold shrink-0">Tanggal :</label>
                <div className="relative flex-1">
                  <input
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                  <div className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 text-gray-900 dark:text-white font-medium hover:border-primary transition-colors">
                    {formatFullDate(invoiceDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 z-20 relative">
                <label className="w-20 font-bold shrink-0">Konsumen :</label>
                <SearchableSelect
                  options={customerOptions}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder="-- Pilih Konsumen --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-start pl-20">
                <textarea
                  readOnly
                  className="w-full bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded p-2 text-[10px] min-h-[40px] resize-none italic"
                  value={selectedCustomer?.address || ""}
                  placeholder="Alamat otomatis..."
                />
              </div>

              {/* Summary Stats Box */}
              <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold uppercase text-primary mb-0.5 tracking-widest">
                    MTR / ROL
                  </label>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {totals.totalMeters.toFixed(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-400">/</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {totals.rollCount}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <label className="text-[9px] font-bold uppercase text-primary mb-0.5 tracking-widest">
                    Total Tagihan
                  </label>
                  <span className="text-lg font-bold text-primary">
                    Rp {totals.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Product & Logistics */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 z-10 relative">
                <label className="w-20 font-bold shrink-0">Barang :</label>
                <SearchableSelect
                  options={productOptions}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  placeholder="-- Pilih Barang Jual --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center">
                <label className="w-20 font-bold shrink-0">Harga :</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={pricePerMeter}
                    onChange={(e) =>
                      setPricePerMeter(parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="shrink-0">/ Meter</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <label className="w-20 font-bold shrink-0">M.Uang :</label>
                  <input
                    type="text"
                    className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-10 font-bold shrink-0 ml-1">Kurs :</label>
                  <input
                    type="number"
                    className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={exchangeRate}
                    onChange={(e) =>
                      setExchangeRate(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 font-bold shrink-0">Logistik :</label>
                <input
                  type="text"
                  className="w-28 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Supir"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary "
                  placeholder="No. Polisi"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <label className="w-20 font-bold shrink-0">Nota Angka :</label>
                <input
                  type="text"
                  className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                  value={notaAngka}
                  onChange={(e) => setNotaAngka(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Catatan Field - Bar Full Width styled like Retur form */}
          <div className="flex items-center gap-3 py-1.5 border-y border-gray-100 dark:border-[#283639] mt-1">
            <label className="font-bold text-primary shrink-0 uppercase tracking-widest">
              Catatan :
            </label>
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-700 font-medium italic py-0.5"
              placeholder="Ketik catatan pengiriman di sini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Datagrid Section */}
          <div className="flex flex-col gap-2">
            <div className="bg-gray-100 dark:bg-[#1c2527] rounded-xl border border-gray-200 dark:border-[#283639] shadow-inner overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-primary/30"
              >
                <table className="w-full text-center table-fixed min-w-full">
                  <thead className="sticky top-0 z-10 bg-gray-200 dark:bg-[#101f22] border-b border-gray-200 dark:border-[#283639]">
                    <tr>
                      <th className="sticky left-0 z-20 py-2 px-3 text-[10px] font-bold text-gray-400 uppercase w-12 border-r border-gray-300 dark:border-[#283639] bg-gray-200 dark:bg-[#101f22]">
                        #
                      </th>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <th
                          key={i}
                          className="py-2 px-1 text-[10px] font-bold text-gray-500 dark:text-[#9db4b9] uppercase border-r border-gray-200 dark:border-[#283639] last:border-r-0"
                        >
                          {i + 1} <br /> Panjang
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#283639]">
                    {gridRows.map((row, rIndex) => (
                      <tr
                        key={row.id}
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="sticky left-0 z-10 py-1.5 px-3 text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-[#141d1f] border-r border-gray-200 dark:border-[#283639]">
                          {rIndex + 1}
                        </td>
                        {row.lengths.map((val, cIndex) => (
                          <td
                            key={cIndex}
                            className="p-0 border-r border-gray-100 dark:border-[#283639] last:border-r-0"
                          >
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.0"
                              className="w-full bg-transparent border-0 text-center py-2 text-sm text-gray-900 dark:text-white focus:ring-inset focus:ring-1 focus:ring-primary rounded-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={val}
                              onChange={(e) =>
                                handleLengthChange(
                                  rIndex,
                                  cIndex,
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-[#283639]">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleQuickPrint}
                className="px-4 py-2 rounded bg-gray-100 dark:bg-[#1c2527] hover:bg-gray-200 dark:hover:bg-[#283639] font-bold flex items-center gap-2 text-[10px] uppercase"
              >
                <span className="material-symbols-outlined text-[16px]">
                  print
                </span>
                Simpan & Cetak Faktur
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded border border-gray-200 dark:border-[#283639] hover:bg-gray-50 dark:hover:bg-[#283639] font-bold text-[10px] uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-10 py-2 rounded bg-primary text-[#111718] font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 text-[10px] uppercase"
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Simpan Faktur
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInvoiceForm;
