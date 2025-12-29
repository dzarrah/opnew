import React, { useState, useMemo, useRef, useEffect } from "react";
import { ReturnInvoice, Customer, Product, ProductType, InvoiceRow, SalesInvoice } from "../types";
import SearchableSelect from "./SearchableSelect";

interface NewReturnInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: ReturnInvoice) => void;
  customers: Customer[];
  products: Product[];
  onPrint?: (type: string, data: any) => void;
  salesInvoices: SalesInvoice[];
  initialData?: ReturnInvoice | null;
  onGenerateInvoiceNumber?: (date: string) => Promise<string>;
}

const NewReturnInvoiceForm: React.FC<NewReturnInvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  products,
  salesInvoices,
  initialData,
  onGenerateInvoiceNumber,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>("");
  const [selectedProductId, setSelectedProductId] = useState<string | number>("");
  const [selectedSalesInvoiceId, setSelectedSalesInvoiceId] = useState<string | number>("");

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

  // Financial
  const [currency, setCurrency] = useState("Rp");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [pricePerMeter, setPricePerMeter] = useState(20250);

  // Original Stats (Jual)
  const [originalRolls, setOriginalRolls] = useState(0);
  const [originalMeters, setOriginalMeters] = useState(0.0);
  const [originalTotalPrice, setOriginalTotalPrice] = useState(0);

  // Additional Details
  const [notes, setNotes] = useState("");

  // Grid State - Fixed to 10 columns for Return Invoice
  const FIXED_COLUMNS = 10;
  const [gridRows, setGridRows] = useState<InvoiceRow[]>([
    { id: "row-1", lengths: Array(FIXED_COLUMNS).fill("") },
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-generate Invoice Number based on Date
  useEffect(() => {
    if (isOpen && !initialData && onGenerateInvoiceNumber) {
      onGenerateInvoiceNumber(invoiceDate).then(num => setInvoiceNumber(num));
    }
  }, [invoiceDate, isOpen, initialData, onGenerateInvoiceNumber]);

  // Load Initial Data
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setInvoiceDate(initialData.date);
            setInvoiceNumber(initialData.invoiceNumber);
            setSelectedCustomerId(initialData.customerId);
            setSelectedProductId(initialData.productId);
            setSelectedSalesInvoiceId(initialData.salesInvoiceRef);
            setCurrency(initialData.currency);
            setExchangeRate(initialData.exchangeRate);
            setPricePerMeter(initialData.pricePerMeter);
            setNotes(initialData.notes);
            setOriginalRolls(initialData.originalRolls);
            setOriginalMeters(initialData.originalMeters);
            
            // Find original total price from sales invoices if possible
            const refInv = salesInvoices.find(inv => String(inv.id) === String(initialData.salesInvoiceRef));
            if(refInv) setOriginalTotalPrice(refInv.totalPrice);

            // Clone rows
            const existingRows = initialData.rows.map((r) => ({
                ...r,
                lengths: [...r.lengths],
            }));
             // Add extra row if last is full
            const lastRow = existingRows[existingRows.length-1];
            if(lastRow && lastRow.lengths.some(l => l !== "")){
                 existingRows.push({
                    id: `row-extra-${Date.now()}`,
                    lengths: Array(FIXED_COLUMNS).fill(""),
                });
            } else if (existingRows.length === 0) {
                 existingRows.push({
                    id: `row-1`,
                    lengths: Array(FIXED_COLUMNS).fill(""),
                });
            }
            setGridRows(existingRows);
        } else {
             // Reset
            setInvoiceDate(today);
            // setInvoiceNumber handled by date effect
            setSelectedCustomerId("");
            setSelectedProductId("");
            setSelectedSalesInvoiceId("");
            setCurrency("Rp");
            setExchangeRate(1);
            setPricePerMeter(0);
            setNotes("");
            setOriginalRolls(0);
            setOriginalMeters(0);
            setOriginalTotalPrice(0);
            setGridRows([{ id: "row-1", lengths: Array(FIXED_COLUMNS).fill("") }]);
        }
    }
  }, [isOpen, initialData, salesInvoices, today]);

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

  const handleSalesInvoiceChange = (invoiceId: string | number) => {
    setSelectedSalesInvoiceId(invoiceId);

    const selectedInvoice = salesInvoices.find((inv) => String(inv.id) === String(invoiceId));
    if (selectedInvoice) {
      setSelectedCustomerId(selectedInvoice.customerId);
      setSelectedProductId(selectedInvoice.productId);
      setPricePerMeter(selectedInvoice.pricePerMeter);
      setOriginalRolls(selectedInvoice.totalRolls);
      setOriginalMeters(selectedInvoice.totalMeters);
      setOriginalTotalPrice(selectedInvoice.totalPrice);
      setCurrency(selectedInvoice.currency);
      setExchangeRate(selectedInvoice.exchangeRate);
    }
  };

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
        lengths: Array(FIXED_COLUMNS).fill(""),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      alert("Harap pilih konsumen dan barang.");
      return;
    }

    const cleanedRows = cleanRows(gridRows);
    const finalInvoice: ReturnInvoice = {
      id: initialData?.id || Date.now().toString(),
      invoiceNumber: invoiceNumber,
      salesInvoiceRef: String(selectedSalesInvoiceId),
      date: invoiceDate,
      customerId: String(selectedCustomerId),
      productId: String(selectedProductId),
      currency,
      exchangeRate,
      pricePerMeter,
      totalPrice: totals.totalPrice,
      notaAngka: "",
      driverName: "",
      plateNumber: "",
      notes,
      rows: cleanedRows,
      totalRolls: totals.rollCount,
      totalMeters: totals.totalMeters,
      originalRolls,
      originalMeters,
    };

    onSubmit(finalInvoice);
    onClose();
  };

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(selectedCustomerId),
  );
  const barangJual = products.filter((p) => p.type === ProductType.JUAL);

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

  const salesInvoiceOptions = salesInvoices.map((inv) => {
    const customer = customers.find((c) => String(c.id) === String(inv.customerId));
    const product = products.find((p) => String(p.id) === String(inv.productId));
    return {
      id: inv.id,
      label: inv.invoiceNumber,
      subLabel: `${inv.date} • ${customer?.name || '-'} • ${product?.name || '-'} • ${inv.totalRolls} Rol • ${inv.totalMeters.toFixed(1)}m`,
    };
  });

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#283639] bg-gray-50 dark:bg-[#101f22]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-danger text-3xl">keyboard_return</span>
            <h3 className="text-gray-900 dark:text-white text-lg font-bold uppercase">{initialData ? "Edit Faktur Retur" : "Entri Faktur Retur"}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-6 text-xs text-gray-700 dark:text-[#9db4b9]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="w-24 font-medium">Bukti No :</label>
                <input type="text" className="flex-1 bg-gray-50 dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 text-danger font-bold outline-none focus:ring-1 focus:ring-danger" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </div>
              <div className="flex items-center">
                <label className="w-24 font-medium">Tanggal :</label>
                <div className="relative flex-1">
                  <input
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                  <div className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2.5 py-1.5 text-gray-900 dark:text-white font-medium hover:border-danger transition-colors">
                    {formatFullDate(invoiceDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 z-20 relative">
                <label className="w-24 font-medium">Konsumen :</label>
                <SearchableSelect
                  options={customerOptions}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder="-- Pilih Konsumen --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-start pl-20">
                <textarea readOnly className="w-full bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded p-2 text-[10px] min-h-[40px] resize-none italic" value={selectedCustomer?.address || ""} placeholder="Alamat otomatis..." />
              </div>
              <div className="mt-6 p-4 bg-danger/5 border border-danger/10 rounded-lg grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-danger">Retur :</label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{totals.rollCount}</span>
                    <span className="text-[10px] font-medium">Rol</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white ml-auto">{totals.totalMeters.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-l border-danger/20 pl-4">
                  <label className="text-[10px] font-bold uppercase text-danger">Total :</label>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-gray-400 ">Rp</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{totals.totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 z-20 relative">
                <label className="w-24 font-medium">Faktur No :</label>
                <SearchableSelect
                  options={salesInvoiceOptions}
                  value={selectedSalesInvoiceId}
                  onChange={handleSalesInvoiceChange}
                  placeholder="-- Pilih Faktur Penjualan --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2 z-10 relative">
                <label className="w-24 font-medium">Barang :</label>
                <SearchableSelect
                  options={productOptions}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  placeholder="-- Pilih Barang Jual --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 font-medium">Finansial :</label>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">M.U</span>
                    <input type="text" className="w-14 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2 py-1.5 text-center text-[11px]" value={currency} readOnly />
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] text-gray-400">Kurs</span>
                    <input type="number" className="w-full bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2 py-1.5 text-right text-[11px]" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="flex items-center gap-1 flex-[1.2]">
                    <span className="text-[10px] text-gray-400">Harga</span>
                    <input type="number" className="w-full bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-2 py-1.5 text-right text-[11px]" value={pricePerMeter} onChange={(e) => setPricePerMeter(parseFloat(e.target.value) || 0)} />
                    <span className="text-[10px] text-gray-400">/m</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50/50 dark:bg-[#1c2527] border border-gray-200 dark:border-[#283639] rounded-lg">
                <div className="flex items-center justify-between mb-1"><label className="text-[10px] font-bold uppercase text-gray-400">Info Faktur Jual :</label></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-500">{originalRolls}</span>
                    <span className="text-[10px]">Rol</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-500">{originalMeters.toFixed(2)}</span>
                    <span className="text-[10px]">Meter</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px]">Rp</span>
                    <span className="text-xl font-bold text-gray-500">{originalTotalPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 border-y border-gray-100 dark:border-[#283639]">
            <label className="font-bold text-danger shrink-0">Catatan :</label>
            <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-700 font-medium" placeholder="Alasan retur barang..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-gray-100 dark:bg-[#1c2527] rounded-xl border border-gray-200 dark:border-[#283639] shadow-inner overflow-hidden">
              <div ref={scrollContainerRef} className="max-h-[350px] overflow-auto scrollbar-thin scrollbar-thumb-danger/30">
                <table className="w-full text-center table-fixed min-w-full">
                  <thead className="sticky top-0 z-20 bg-gray-200 dark:bg-[#101f22] border-b border-gray-200 dark:border-[#283639]">
                    <tr><th className="sticky left-0 z-30 py-2 px-3 text-[10px] font-bold text-gray-400 uppercase w-12 border-r border-gray-300 dark:border-[#283639] bg-gray-200 dark:bg-[#101f22]">#</th>{Array.from({ length: FIXED_COLUMNS }).map((_, i) => (<th key={i} className="py-2 px-1 text-[10px] font-bold text-gray-500 dark:text-[#9db4b9] uppercase border-r border-gray-200 dark:border-[#283639] min-w-[70px]">{i + 1} <br /> Panjang</th>))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#283639]">
                    {gridRows.map((row, rIndex) => (
                      <tr key={row.id} className="hover:bg-danger/5 transition-colors group">
                        <td className="sticky left-0 z-10 py-1.5 px-3 text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-[#141d1f] border-r border-gray-200 dark:border-[#283639]">{rIndex + 1}</td>
                        {row.lengths.map((val, cIndex) => (<td key={cIndex} className="p-0 border-r border-gray-100 dark:border-[#283639] last:border-r-0"><input type="number" step="0.01" placeholder="0.0" className="w-full bg-transparent border-0 text-center py-2 text-sm text-gray-900 dark:text-white focus:ring-inset focus:ring-1 focus:ring-danger rounded-none outline-none" value={val} onChange={(e) => handleLengthChange(rIndex, cIndex, e.target.value)} /></td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-[#283639]">
            <button type="button" className="px-4 py-2 rounded bg-gray-100 dark:bg-[#1c2527] hover:bg-gray-200 dark:hover:bg-[#283639] font-bold flex items-center gap-2 text-[11px]"><span className="material-symbols-outlined text-[18px]">print</span>Cetak Bukti</button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-8 py-2 rounded border border-gray-200 dark:border-[#283639] hover:bg-gray-50 dark:hover:bg-[#283639] font-bold text-[11px]">Batal</button>
              <button type="submit" className="px-12 py-2 rounded bg-danger text-white font-bold hover:bg-danger/90 shadow-lg shadow-danger/20 flex items-center gap-2 text-[11px]"><span className="material-symbols-outlined text-[20px]">save</span>Simpan Faktur Retur</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReturnInvoiceForm;
