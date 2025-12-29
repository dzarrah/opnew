import React from "react";
import {
  SalesInvoice,
  ReturnInvoice,
  DyeingOrder,
  DyeingResult,
  Customer,
  Supplier,
  Product,
} from "../types";

interface PrintTemplateProps {
  type: "sales" | "return" | "dyeing_order" | "dyeing_result";
  data: any;
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
}

// --- Helper Functions ---
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount: number, currency: string = "Rp") => {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatNumber = (val: number | string | undefined, decimalPlaces: number = 2) => {
  if (val === undefined || val === null || val === "") return "";
  const num = parseFloat(String(val));
  if (isNaN(num)) return val;
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};


// --- Layout 1: INVOICE LAYOUT (Professional / Boxed) ---
const InvoiceLayout: React.FC<{
  data: SalesInvoice | ReturnInvoice;
  title?: string;
  customers: Customer[];
  products: Product[];
  isReturn?: boolean;
}> = ({ data, customers, products, isReturn }) => {
  const customer = customers.find((c) => String(c.id) === String(data.customerId));
  const product = products.find((p) => String(p.id) === String(data.productId));

  // Flatten all lengths from all rows
  const allLengths = data.rows.flatMap((row) =>
    row.lengths.map((len) => parseFloat(String(len))).filter((l) => !isNaN(l) && l > 0)
  );

  // Pad to 10 for the grid
  const gridData = [...allLengths];
  while (gridData.length < 10) gridData.push(0);

  return (
    <div className="p-8 font-sans text-gray-900 bg-white w-full max-w-[210mm] mx-auto text-sm print-container">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide">TN. OPIN SAPUTRA</h1>
          <p className="uppercase text-xs font-bold">JL. KOPO NO.58 BANDUNG</p>
        </div>
        <div className="text-right mt-2">
          <p className="text-sm font-bold">Tanggal : {formatDate(data.date)}</p>
        </div>
      </div>

      {/* Main Box Container */}
      <div className="border-2 border-black">
        {/* Row 1: Customer & Order Info */}
        <div className="flex border-b-2 border-black">
          {/* Left: Customer */}
          <div className="w-[60%] border-r-2 border-black p-2">
            <div className="flex">
              <span className="w-32 font-bold whitespace-nowrap">Nama Customer :</span>
              <span className="font-bold flex-1 uppercase">{customer?.name || "-"}</span>
            </div>
            <div className="flex mt-1">
              <span className="w-32 font-bold align-top whitespace-nowrap">Alamat :</span>
              <span className="flex-1 uppercase leading-tight">
                {customer?.address || "-"}
              </span>
            </div>
          </div>

          {/* Right: Invoice Info */}
          <div className="w-[40%] p-2">
            <div className="flex mb-1">
              <span className="w-32 font-bold whitespace-nowrap">{isReturn ? "No. Retur :" : "No. Surat Jalan :"}</span>
              <span className="font-bold">{data.invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold whitespace-nowrap">Harga Satuan :</span>
              <span>
                {formatCurrency(data.pricePerMeter, data.currency)} / Meter
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Product & Totals */}
        <div className="flex border-b-2 border-black">
          {/* Left: Product Name */}
          <div className="w-[45%] border-r-2 border-black p-2 bg-gray-50 flex flex-col justify-center">
            <span className="font-bold mb-1">Code + Jenis :</span>
            <span className="uppercase text-md font-semibold">{product?.name || "ITEM DEFAULT"}</span>
          </div>

          {/* Right: Quantities */}
          <div className="w-[55%] flex flex-col">
            {/* Top: Qty */}
            <div className="flex border-b border-black p-2 items-center justify-between">
              <span className="font-bold">Banyaknya :</span>
              <span className="font-bold">{data.totalRolls} Rol</span>
              <span className="font-bold">{data.totalMeters.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Meter</span>
            </div>
            {/* Bottom: TOTAL */}
            <div className="p-2 flex items-center justify-center gap-4 bg-gray-100 flex-1">
              <span className="font-bold text-lg">TOTAL :</span>
              <span className="font-bold text-lg">{formatCurrency(data.totalPrice, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Row 3: The 10-Cell Grid */}
        <div>
          {/* Top 5 */}
          <div className="flex border-b border-black divide-x divide-black text-center font-bold text-xs bg-gray-200">
            <div className="flex-1 py-1">1</div>
            <div className="flex-1 py-1">2</div>
            <div className="flex-1 py-1">3</div>
            <div className="flex-1 py-1">4</div>
            <div className="flex-1 py-1">5</div>
          </div>
          <div className="flex border-b border-black divide-x divide-black text-center h-8">
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[0] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[1] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[2] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[3] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[4] || ""}</div>
          </div>

          {/* Bottom 5 */}
          <div className="flex border-b border-black divide-x divide-black text-center font-bold text-xs bg-gray-200">
            <div className="flex-1 py-1">6</div>
            <div className="flex-1 py-1">7</div>
            <div className="flex-1 py-1">8</div>
            <div className="flex-1 py-1">9</div>
            <div className="flex-1 py-1">10</div>
          </div>
          <div className="flex border-b-2 border-black divide-x divide-black text-center h-8">
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[5] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[6] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[7] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[8] || ""}</div>
            <div className="flex-1 flex items-center justify-center font-mono text-sm">{gridData[9] || ""}</div>
          </div>
        </div>

        {/* Row 4: Notes */}
        <div className="p-2 min-h-[60px] relative">
          <div className="font-bold mb-1">Catatan : {data.notes}</div>
          <div className="absolute right-2 bottom-2 text-[10px] text-right italic text-gray-500">
            * Kain yang sudah dipotong tidak dapat<br />dikembalikan / No return on cut fabric
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-bold">
        <div className="flex items-end gap-2">
          <span>Dikirim Via Kendaraan :</span>
          <div className="border-b border-black w-24 pb-0.5 text-center px-1">&nbsp;</div>
        </div>
        <div className="flex items-end gap-2">
          <span>No POL :</span>
          <div className="border-b border-black w-24 pb-0.5 text-center px-1">{data.plateNumber}</div>
        </div>
        <div className="flex items-end gap-2">
          <span>Nota Angkutan :</span>
          <div className="border-b border-black w-24 pb-0.5 text-center px-1">{data.notaAngka}</div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-4 gap-4 text-center">
        <div className="flex flex-col">
          <div className="border border-black h-24 mb-2"></div>
          <span className="font-bold text-xs uppercase">Cap + Tanda Tangan</span>
        </div>
        <div className="flex flex-col">
          <div className="border border-black h-24 mb-2"></div>
          <span className="font-bold text-xs uppercase">Packing</span>
        </div>
        <div className="flex flex-col">
          <div className="border border-black h-24 mb-2"></div>
          <span className="font-bold text-xs uppercase">Gudang</span>
        </div>
        <div className="flex flex-col">
          <div className="border border-black h-24 mb-2 flex items-center justify-center"></div>
          <span className="font-bold text-xs uppercase">Opin Saputra</span>
        </div>
      </div>
    </div>
  );
};

// --- Layout 3: DYEING ORDER LAYOUT (Refined) ---
const DyeingOrderLayout: React.FC<{
  data: DyeingOrder;
  suppliers: Supplier[];
  products: Product[];
}> = ({ data, suppliers, products }) => {
  const supplier = suppliers.find((s) => String(s.id) === String(data.supplierId));
  const product = products.find((p) => String(p.id) === String(data.productId));

  // Flatten all pairs from all rows
  // Each pair has {panjang: string/number, berat: string/number}
  const allPairs = data.rows.flatMap(r => r.pairs).filter(p => (p.panjang && parseFloat(String(p.panjang)) > 0) || (p.berat && parseFloat(String(p.berat)) > 0));

  // We need 5 columns in the grid.
  // Each column has 2 sub-cells (Left=Length, Right=Weight).
  // 5 pairs per row.
  const gridRows: any[][] = [];
  for (let i = 0; i < allPairs.length; i += 5) {
    gridRows.push(allPairs.slice(i, i + 5));
  }
  // If empty, add one empty row
  if (gridRows.length === 0) gridRows.push([]);

  // Ensure last row has 5 items (fill with nulls)
  const lastRow = gridRows[gridRows.length - 1];
  while (lastRow.length < 5) lastRow.push({ panjang: "", berat: "" });

  return (
    <div className="p-8 font-sans text-gray-900 bg-white w-full max-w-[210mm] mx-auto text-sm print-container">
      {/* Header with Date on Right */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide">TN. OPIN SAPUTRA</h1>
          <p className="uppercase text-xs font-bold">JL. KOPO NO.58 BANDUNG</p>
        </div>
        <div className="text-right mt-2">
          <p className="text-sm font-bold">Tanggal : {formatDate(data.date)}</p>
        </div>
      </div>

      {/* Main Box Container */}
      <div className="border-2 border-black">
        {/* Row 1: Supplier & Info */}
        <div className="flex border-b-2 border-black">
          {/* Left Box: Supplier Info (60%) */}
          <div className="w-[60%] border-r-2 border-black p-2">
            <div className="flex mb-1">
              <span className="font-bold w-32 whitespace-nowrap">NAMA SUPLIER :</span>
              <span className="uppercase font-bold">{supplier?.name || ".................."}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32 align-top whitespace-nowrap">ALAMAT :</span>
              <span className="uppercase leading-tight flex-1">{supplier?.address || ".................."}</span>
            </div>
          </div>

          {/* Right Box: SJ No & Attributes (40%) */}
          <div className="w-[40%] flex flex-col">
            {/* SJ Number (Full Width Top) */}
            <div className="border-b border-black p-2 bg-gray-50 flex items-center justify-between h-10">
              <span className="font-bold text-xs uppercase">No. SJ :</span>
              <span className="font-bold text-lg">{data.sjNumber}</span>
            </div>
            {/* Attributes Group (Warna, Setting, Finish) */}
            <div className="p-2 space-y-1 flex-1 flex flex-col justify-center">
              <div className="flex">
                <span className="w-20 font-bold text-xs uppercase">Warna</span>
                <span className="font-bold uppercase flex-1">: {data.color}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold text-xs uppercase">Setting</span>
                <span className="font-bold uppercase flex-1">: {data.setting}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold text-xs uppercase">Finish</span>
                <span className="font-bold uppercase flex-1">: {data.finish}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Product & Quantity */}
        <div className="flex border-b-2 border-black">
          {/* Left: Product Code */}
          <div className="w-[45%] border-r-2 border-black p-2 bg-gray-50 flex flex-col justify-center">
            <span className="font-bold mb-1">Code + Jenis :</span>
            <span className="uppercase text-md font-semibold">{product?.name || "ITEM DEFAULT"}</span>
          </div>
          {/* Right: Quantities */}
          <div className="w-[55%] p-2 flex items-center justify-around">
            <div className="text-center">
              <span className="block font-bold text-xs uppercase text-gray-500 mb-1">Banyaknya</span>
              <span className="block font-bold text-lg">{data.totalRolls} Rol</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-xs uppercase text-gray-500 mb-1">Meter</span>
              <span className="block font-bold text-lg">{formatNumber(data.totalMeters)}</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-xs uppercase text-gray-500 mb-1">Kg</span>
              <span className="block font-bold text-lg">{formatNumber(data.totalWeight)}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Notes Header */}
        <div className="border-b-2 border-black px-2 py-1 bg-gray-100 font-bold text-xs uppercase">
          CATATAN: {data.notes}
        </div>

        {/* Row 4: THE GRID */}
        <div>
          {/* Grid Header */}
          <div className="flex border-b border-black divide-x divide-black text-center font-bold text-xs bg-gray-200">
            <div className="flex-1 py-1">1</div>
            <div className="flex-1 py-1">2</div>
            <div className="flex-1 py-1">3</div>
            <div className="flex-1 py-1">4</div>
            <div className="flex-1 py-1">5</div>
          </div>

          {/* Grid Body */}
          {gridRows.map((rowItems, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-black divide-x divide-black text-center h-8">
              {rowItems.map((pair, colIndex) => (
                <div key={colIndex} className="flex-1 flex text-center font-mono text-sm">
                  {/* Left Sub-column (Length) */}
                  <div className="flex-1 flex items-center justify-center border-r border-gray-300 pr-1">
                    {formatNumber(pair?.panjang)}
                  </div>
                  {/* Right Sub-column (Weight) */}
                  <div className="flex-1 flex items-center justify-center pl-1">
                    {formatNumber(pair?.berat)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer / Logistics */}
        <div className="flex border-t-2 border-black">
          <div className="flex-1 p-2">
            <div className="flex items-end gap-2 mb-2">
              <span className="font-bold text-xs">KIRIM VIA KENDARAAN :</span>
              <div className="border-b border-black w-32 text-center text-xs font-bold uppercase">{data.vehicleType}</div>
            </div>
          </div>
          <div className="flex-1 p-2">
            <div className="flex items-end gap-2 justify-end mb-2">
              <span className="font-bold text-xs">NO. POL :</span>
              <div className="border-b border-black w-32 text-center text-xs font-bold uppercase">{data.vehiclePlate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-8 flex justify-between px-8 text-center items-end h-24">
        <div className="flex flex-col">
          <span className="border-t border-black w-48 pt-1 font-bold text-xs uppercase">CAP + TANDA TANGAN</span>
        </div>
        <div className="flex flex-col">
          {/* Optional Signature Image */}
          <span className="border-t border-black w-48 pt-1 font-bold text-xs uppercase">PENGIRIM</span>
        </div>
      </div>

    </div>
  );
};

// --- Layout 2: DELIVERY NOTE / SURAT JALAN (Generic/Result) ---
const DeliveryLayout: React.FC<{
  data: DyeingOrder | DyeingResult;
  title: string;
  suppliers: Supplier[];
  products: Product[];
  type: "in" | "out";
}> = ({ data, title, suppliers, products, type }) => {
  // Re-using the generic delivery layout for Results (Inbound) for now
  const supplier = suppliers.find((s) => String(s.id) === String(data.supplierId));
  const product = products.find((p) => String(p.id) === String(data.productId));

  // Flatten rows for Dyeing (paired array)
  const allPairs = data.rows.flatMap(r => r.pairs).filter(p => p.panjang && parseFloat(String(p.panjang)) > 0);

  return (
    <div className="p-8 font-sans text-xs md:text-sm text-gray-900 bg-white min-h-[297mm] relative">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">{title}</h1>
            <div className="inline-block bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase mt-1">
              {type === "out" ? "Dokumen Pengeluaran Barang" : "Dokumen Penerimaan Barang"}
            </div>
          </div>
        </div>
        <div className="text-right border-l-2 border-gray-200 pl-6">
          <p className="text-gray-500 text-[10px] uppercase tracking-wide">Nomor Dokumen</p>
          <h3 className="text-xl font-bold text-black font-mono">{data.sjNumber}</h3>
          <p className="text-gray-500 text-[10px] uppercase tracking-wide mt-2">Tanggal</p>
          <p className="font-bold">{formatDate(data.date)}</p>
        </div>
      </div>

      {/* Logistics Info */}
      <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="w-1/2 pr-4 border-r border-gray-200">
          <p className="font-bold text-gray-400 uppercase text-[10px] mb-1">
            {type === "out" ? "Tujuan / Supplier:" : "Pengirim / Supplier:"}
          </p>
          <h4 className="font-bold text-lg">{supplier?.name}</h4>
          <p className="text-gray-600">{supplier?.address}</p>
        </div>
        <div className="w-1/2 pl-4 grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-gray-400 uppercase text-[10px]">Kendaraan</p>
            <p className="font-bold">{data.vehicleType || "-"}</p>
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase text-[10px]">No. Polisi</p>
            <p className="font-bold font-mono bg-white px-2 py-0.5 rounded border inline-block">
              {data.vehiclePlate || "-"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="font-bold text-gray-400 uppercase text-[10px]">Setting / Finish</p>
            <p className="font-medium">{data.setting || "-"} / {data.finish || "-"}</p>
          </div>
        </div>
      </div>

      {/* Main Table - Simplified for Logistics (No Price) */}
      <table className="w-full border-collapse mb-6 border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="py-2 px-3 text-left w-12 border-r border-white/20">No</th>
            <th className="py-2 px-3 text-left border-r border-white/20">Jenis Barang</th>
            <th className="py-2 px-3 text-center border-r border-white/20">Warna</th>
            <th className="py-2 px-3 text-center w-24 border-r border-white/20">Qty (Rol)</th>
            <th className="py-2 px-3 text-center w-32 border-r border-white/20">Berat (Kg)</th>
            <th className="py-2 px-3 text-center w-32">Panjang (M)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="py-3 px-3 text-center align-top border-r border-black">1</td>
            <td className="py-3 px-3 align-top border-r border-black">
              <span className="font-bold block">{product?.name || "Item Unknown"}</span>
              <div className="mt-2 text-[10px] text-gray-600 grid grid-cols-5 gap-1">
                {/* Render list of rolls nicely */}
                {allPairs.map((p, idx) => (
                  <span key={idx} className="bg-gray-100 px-1 rounded text-center">
                    {p.berat}kg
                  </span>
                ))}
              </div>
            </td>
            <td className="py-3 px-3 text-center align-top border-r border-black font-medium">
              {data.color}
            </td>
            <td className="py-3 px-3 text-center align-top border-r border-black font-bold text-lg">
              {data.totalRolls}
            </td>
            <td className="py-3 px-3 text-center align-top border-r border-black font-bold">
              {data.totalWeight.toFixed(2)}
            </td>
            <td className="py-3 px-3 text-center align-top font-bold">
              {data.totalMeters.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes & Footer */}
      <div className="flex flex-col h-40 justify-between break-inside-avoid">
        <div>
          <p className="font-bold text-gray-500 uppercase text-[10px]">Catatan Pengiriman:</p>
          <p className="italic text-gray-700">{data.notes || "Tidak ada catatan."}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="flex flex-col justify-end h-24">
            <p className="text-[10px] uppercase mb-12">Diserahkan Oleh,</p>
            <div className="border-b border-black w-3/4 mx-auto"></div>
            <p className="text-[10px] font-bold mt-1">Gudang / Pengirim</p>
          </div>
          <div className="flex flex-col justify-end h-24">
            <p className="text-[10px] uppercase mb-12">Diketahui / Supir,</p>
            <div className="border-b border-black w-3/4 mx-auto"></div>
            <p className="text-[10px] font-bold mt-1">Logistik</p>
          </div>
          <div className="flex flex-col justify-end h-24">
            <p className="text-[10px] uppercase mb-12">Diterima Oleh,</p>
            <div className="border-b border-black w-3/4 mx-auto"></div>
            <p className="text-[10px] font-bold mt-1">Customer / Supplier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (DISPATCHER) ---
const PrintTemplate: React.FC<PrintTemplateProps> = ({
  type,
  data,
  customers,
  suppliers,
  products,
}) => {
  // Dispatcher Logic
  if (type === "sales") {
    return (
      <InvoiceLayout
        data={data as SalesInvoice}
        customers={customers}
        products={products}
      />
    );
  }

  if (type === "return") {
    return (
      <InvoiceLayout
        data={data as ReturnInvoice}
        customers={customers}
        products={products}
        isReturn={true}
      />
    );
  }

  if (type === "dyeing_order") {
    return (
      <DyeingOrderLayout
        data={data as DyeingOrder}
        suppliers={suppliers}
        products={products}
      />
    );
  }

  if (type === "dyeing_result") {
    return (
      <DeliveryLayout
        data={data as DyeingResult}
        title="BUKTI TERIMA BARANG"
        suppliers={suppliers}
        products={products}
        type="in"
      />
    );
  }

  return <div>Unknown Print Type</div>;
};

export default PrintTemplate;