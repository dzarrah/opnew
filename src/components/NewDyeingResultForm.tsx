import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  DyeingResult,
  DyeingOrder,
  Supplier,
  Product,
  ProductType,
  DyeingOrderRow,
} from "../types";
import SearchableSelect from "./SearchableSelect";

interface NewDyeingResultFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (result: DyeingResult) => void;
  suppliers: Supplier[];
  products: Product[];
  dyeingOrders: DyeingOrder[];
  onPrint?: (type: string, data: any) => void;
  initialData?: DyeingResult | null;
  onGenerateResultNumber?: (date: string) => Promise<string>;
}

const NewDyeingResultForm: React.FC<NewDyeingResultFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  products,
  dyeingOrders,
  initialData,
  onGenerateResultNumber,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [receiveDate, setReceiveDate] = useState(today);
  const [sjNumber, setSjNumber] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [selectedOrderSjId, setSelectedOrderSjId] = useState<string | number>("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | number>("");
  const [selectedProductId, setSelectedProductId] = useState<string | number>("");
  const [pricePerMeter, setPricePerMeter] = useState(1.0);
  const [color, setColor] = useState("");
  const [setting, setSetting] = useState("");
  const [finish, setFinish] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [notes, setNotes] = useState("");

  const [originalStats, setOriginalStats] = useState({
    rolls: 0,
    meters: 0,
    weight: 0,
    price: 0,
  });

  const COLS_PER_ROW = 5;
  const [gridRows, setGridRows] = useState<DyeingOrderRow[]>([
    {
      id: "row-1",
      pairs: Array(COLS_PER_ROW)
        .fill(null)
        .map(() => ({ panjang: "", berat: "" })),
    },
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return "Pilih Tanggal";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Auto-generate SJ Number based on Date
  useEffect(() => {
    if (isOpen && !initialData && onGenerateResultNumber) {
      onGenerateResultNumber(receiveDate).then(num => setSjNumber(num));
    }
  }, [receiveDate, isOpen, initialData, onGenerateResultNumber]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setReceiveDate(initialData.date);
        setSjNumber(initialData.sjNumber);
        setSelectedOrderSjId(initialData.orderSjRef);
        setSelectedSupplierId(initialData.supplierId);
        setSelectedProductId(initialData.productId);
        setPricePerMeter(initialData.pricePerMeter);
        setColor(initialData.color);
        setSetting(initialData.setting);
        setFinish(initialData.finish);
        setVehicleType(initialData.vehicleType);
        setVehiclePlate(initialData.vehiclePlate);
        setNotes(initialData.notes);
        setOriginalStats(initialData.originalStats);

        // Clone rows
        const existingRows = initialData.rows.map((r) => ({
          ...r,
          pairs: r.pairs.map(p => ({ ...p }))
        }));

        // Add extra row if needed
        const lastRow = existingRows[existingRows.length - 1];
        if (lastRow && lastRow.pairs.every(p => p.panjang !== "" && p.berat !== "")) {
          existingRows.push({
            id: `row-extra-${Date.now()}`,
            pairs: Array(COLS_PER_ROW).fill(null).map(() => ({ panjang: "", berat: "" })),
          });
        }
        setGridRows(existingRows);
      } else {
        setReceiveDate(today);
        // setSjNumber handled by date effect
        setSelectedOrderSjId("");
        setSelectedSupplierId("");
        setSelectedProductId("");
        setPricePerMeter(1.0);
        setColor("");
        setSetting("");
        setFinish("");
        setVehicleType("");
        setVehiclePlate("");
        setNotes("");
        setOriginalStats({ rolls: 0, meters: 0, weight: 0, price: 0 });
        setGridRows([{
          id: "row-1",
          pairs: Array(COLS_PER_ROW).fill(null).map(() => ({ panjang: "", berat: "" })),
        }]);
      }
    }
  }, [isOpen, initialData, today]);

  const totals = useMemo(() => {
    let rollCount = 0;
    let totalMeters = 0;
    let totalWeight = 0;
    gridRows.forEach((row) => {
      row.pairs.forEach((pair) => {
        const pVal = parseFloat(pair.panjang as string);
        const bVal = parseFloat(pair.berat as string);
        if (!isNaN(pVal) && pVal > 0) {
          rollCount++;
          totalMeters += pVal;
          if (!isNaN(bVal)) totalWeight += bVal;
        }
      });
    });
    const totalPrice = totalWeight * pricePerMeter;
    return { rollCount, totalMeters, totalWeight, totalPrice };
  }, [gridRows, pricePerMeter]);

  const handleOrderSjChange = (orderId: string | number) => {
    setSelectedOrderSjId(orderId);
    const order = dyeingOrders.find((o) => String(o.id) === String(orderId));
    if (order) {
      setSelectedSupplierId(order.supplierId);
      setSelectedProductId(order.productId);
      setPricePerMeter(order.pricePerMeter);
      setColor(order.color);
      setSetting(order.setting);
      setFinish(order.finish);
      setOriginalStats({
        rolls: order.totalRolls,
        meters: order.totalMeters,
        weight: order.totalWeight,
        price: order.totalPrice,
      });
    }
  };

  const handleInputChange = (
    rowIndex: number,
    pairIndex: number,
    field: "panjang" | "berat",
    value: string,
  ) => {
    const newRows = [...gridRows];
    newRows[rowIndex].pairs[pairIndex][field] = value;

    // Auto-expand ROWS
    const isLastRow = rowIndex === gridRows.length - 1;
    const isRowFull = newRows[rowIndex].pairs.every(
      (p) => p.panjang !== "" && p.berat !== "",
    );

    if (isLastRow && isRowFull) {
      newRows.push({
        id: `row-${Date.now()}`,
        pairs: Array(COLS_PER_ROW)
          .fill(null)
          .map(() => ({ panjang: "", berat: "" })),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalResult: DyeingResult = {
      id: initialData?.id || Date.now().toString(),
      sjNumber,
      date: receiveDate,
      supplierId: String(selectedSupplierId),
      productId: String(selectedProductId),
      pricePerMeter,
      color,
      setting,
      finish,
      vehicleType,
      vehiclePlate,
      notes,
      rows: gridRows,
      totalRolls: totals.rollCount,
      totalMeters: totals.totalMeters,
      totalWeight: totals.totalWeight,
      totalPrice: totals.totalPrice,
      orderSjRef: String(selectedOrderSjId),
      originalStats,
    };
    onSubmit(finalResult);
    onClose();
  };

  const supplierOptions = suppliers.map((s) => ({
    id: s.id,
    label: s.name,
    subLabel: s.address,
  }));

  const productOptions = products
    .filter((p) => p.type === ProductType.CELUP)
    .map((p) => ({
      id: p.id,
      label: p.name,
      subLabel: `Rp ${p.price}`,
    }));

  const orderOptions = dyeingOrders.map((o) => {
    const supplier = suppliers.find(s => String(s.id) === String(o.supplierId))?.name || "Unknown";
    const product = products.find(p => String(p.id) === String(o.productId))?.name || "Unknown";
    return {
      id: o.id,
      label: o.sjNumber,
      subLabel: `${o.date} • ${supplier} • ${product} • ${o.color}`,
    }
  });

  const selectedSupplier = suppliers.find((s) => String(s.id) === String(selectedSupplierId));

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
            <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
            <h3 className="text-gray-900 dark:text-white text-lg font-bold uppercase">{initialData ? "Edit Hasil Celup" : "Terima Hasil Celup"}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-6 text-xs text-gray-700 dark:text-[#9db4b9]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="w-24 font-bold">Nomor SJ :</label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="text" className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 text-success font-bold outline-none focus:ring-1 focus:ring-success" value={sjNumber} onChange={e => setSjNumber(e.target.value)} />
                  <span className="italic text-[10px] text-gray-400">
                    INS-Cari
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-24 font-bold">Tanggal :</label>
                <div className="relative flex-1" onClick={() => dateInputRef.current?.showPicker()}>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                    value={receiveDate}
                    onChange={(e) => setReceiveDate(e.target.value)}
                  />
                  <div className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 text-success font-bold hover:border-success transition-colors cursor-pointer">
                    {formatFullDate(receiveDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 z-20 relative">
                <label className="w-24 font-bold">Suplier :</label>
                <SearchableSelect
                  options={supplierOptions}
                  value={selectedSupplierId}
                  onChange={setSelectedSupplierId}
                  placeholder="-- Pilih Suplier --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-start pl-24">
                <textarea
                  readOnly
                  className="w-full bg-gray-50 dark:bg-[#101f22] border border-gray-200 dark:border-[#283639] rounded p-2 text-[10px] min-h-[40px] resize-none italic"
                  value={selectedSupplier?.address || ""}
                  placeholder="Alamat otomatis..."
                />
              </div>
              <div className="mt-4 p-4 bg-success/5 border border-success/10 rounded-lg"><label className="text-[10px] font-bold uppercase text-gray-400 block mb-2 tracking-widest">Diterima (Hasil)</label><div className="flex items-baseline gap-6"><div className="flex items-baseline gap-1"><span className="text-xl font-bold text-gray-900 dark:text-white">{totals.rollCount}</span><span className="text-[10px]">Rol</span></div><div className="flex items-baseline gap-1"><span className="text-xl font-bold text-gray-900 dark:text-white">{totals.totalMeters.toFixed(2)}</span><span className="text-[10px]">Meter</span></div><div className="flex items-baseline gap-1"><span className="text-xl font-bold text-success">{totals.totalWeight.toFixed(2)}</span><span className="text-[10px]">Kg</span></div></div></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 z-20 relative">
                <label className="w-24 font-bold">Ref SJ Celup:</label>
                <SearchableSelect
                  options={orderOptions}
                  value={selectedOrderSjId}
                  onChange={handleOrderSjChange}
                  placeholder="-- Pilih Ref SJ Celup --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2 z-10 relative">
                <label className="w-24 font-bold">Barang :</label>
                <SearchableSelect
                  options={productOptions}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  placeholder="-- Pilih Barang Celup --"
                  className="flex-1 min-w-0"
                />
              </div>
              <div className="flex items-center">
                <label className="w-24 font-bold">Harga :</label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="number" className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-success text-right" value={pricePerMeter} onChange={(e) => setPricePerMeter(parseFloat(e.target.value) || 0)} />
                  <span>/ Kg</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 font-bold">Warna :</label>
                <input type="text" className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-success" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 font-bold">Kendaraan :</label>
                <input type="text" className="w-24 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-success" placeholder="Tipe" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
                <input type="text" className="flex-1 bg-white dark:bg-[#141d1f] border border-gray-200 dark:border-[#283639] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-success" placeholder="No. Polisi" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 border-y border-gray-100 dark:border-[#283639]">
            <label className="font-bold text-success shrink-0 uppercase tracking-widest">Catatan :</label>
            <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-700 font-medium italic" placeholder="Keterangan tambahan..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-gray-100 dark:bg-[#1c2527] rounded-xl border border-gray-200 dark:border-[#283639] shadow-inner overflow-hidden">
              <div ref={scrollContainerRef} className="max-h-[350px] overflow-auto scrollbar-thin scrollbar-thumb-success/30">
                <table className="w-full text-center table-fixed min-w-full">
                  <thead className="sticky top-0 z-10 bg-gray-200 dark:bg-[#101f22] border-b border-gray-200 dark:border-[#283639]">
                    <tr>
                      <th className="sticky left-0 z-30 py-2 px-3 text-[10px] font-bold text-gray-400 uppercase w-12 border-r border-gray-300 dark:border-[#283639] bg-gray-200 dark:bg-[#101f22]">#</th>
                      {Array.from({ length: COLS_PER_ROW }).map((_, i) => (<th key={i} colSpan={2} className="py-2 px-1 text-[10px] font-bold text-gray-500 dark:text-[#9db4b9] uppercase border-r border-gray-200 dark:border-[#283639] last:border-r-0">{i + 1}</th>))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-[#141d1f] border-b border-gray-200 dark:border-[#283639]">
                      <th className="sticky left-0 z-30 border-r border-gray-300 dark:border-[#283639] bg-gray-50 dark:bg-[#141d1f]"></th>
                      {Array.from({ length: COLS_PER_ROW }).map((_, i) => (<React.Fragment key={i}><th className="py-1 text-[9px] font-bold text-gray-400 border-r border-gray-100 dark:border-[#283639]">Pjg</th><th className="py-1 text-[9px] font-bold text-gray-400 border-r border-gray-200 dark:border-[#283639] last:border-r-0">Brt</th></React.Fragment>))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#283639]">
                    {gridRows.map((row, rIndex) => (
                      <tr key={row.id} className="hover:bg-success/5 transition-colors group">
                        <td className="sticky left-0 z-10 py-1.5 px-3 text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-[#141d1f] border-r border-gray-200 dark:border-[#283639]">{rIndex + 1}</td>
                        {row.pairs.map((pair, pIndex) => (<React.Fragment key={pIndex}><td className="p-0 border-r border-gray-100 dark:border-[#283639]"><input type="number" step="0.01" placeholder="0.0" className="w-full bg-transparent border-0 text-center py-2 text-xs text-gray-900 dark:text-white focus:ring-inset focus:ring-1 focus:ring-success rounded-none outline-none" value={pair.panjang} onChange={(e) => handleInputChange(rIndex, pIndex, "panjang", e.target.value)} /></td><td className="p-0 border-r border-gray-200 dark:border-[#283639] last:border-r-0"><input type="number" step="0.01" placeholder="0.0" className="w-full bg-success/5 border-0 text-center py-2 text-xs text-success focus:ring-inset focus:ring-1 focus:ring-success rounded-none outline-none" value={pair.berat} onChange={(e) => handleInputChange(rIndex, pIndex, "berat", e.target.value)} /></td></React.Fragment>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-[#283639]">
            <button type="button" className="px-4 py-2 rounded bg-gray-100 dark:bg-[#1c2527] hover:bg-gray-200 dark:hover:bg-[#283639] font-bold flex items-center gap-2 text-[11px]"><span className="material-symbols-outlined text-[18px]">print</span>Cetak Bukti Terima</button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-8 py-2 rounded border border-gray-200 dark:border-[#283639] hover:bg-gray-50 dark:hover:bg-[#283639] font-bold text-[11px]">Batal</button>
              <button type="submit" className="px-12 py-2 rounded bg-primary text-[#111718] font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 text-[11px]"><span className="material-symbols-outlined text-[20px]">task_alt</span>Simpan Hasil Celup</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDyeingResultForm;
