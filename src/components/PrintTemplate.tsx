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
  });
};

// --- Layout 1: INVOICE LAYOUT (Keuangan) ---
// Digunakan untuk: SalesInvoice, ReturnInvoice
const InvoiceLayout: React.FC<{
  data: SalesInvoice | ReturnInvoice;
  title: string;
  customers: Customer[];
  products: Product[];
  isReturn?: boolean;
}> = ({ data, title, customers, products, isReturn }) => {
  const customer = customers.find((c) => String(c.id) === String(data.customerId));
  const product = products.find((p) => String(p.id) === String(data.productId));

  // Flatten rows for Sales Invoice (standard array)
  const rows = data.rows.flatMap((row) =>
    row.lengths.map((len) => parseFloat(String(len))).filter((l) => !isNaN(l) && l > 0)
  );

  return (
    <div className="p-8 font-sans text-xs md:text-sm text-gray-900 bg-white min-h-[297mm] relative">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">PT. OPIN TEXTILE</p>
          <p className="text-gray-500 text-[10px]">Jl. Soekarno Hatta No. 760, Bandung</p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-700">{data.invoiceNumber}</h3>
          <p className="text-gray-500">{formatDate(data.date)}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="font-bold text-gray-400 uppercase text-[10px] mb-1">Kepada Yth:</p>
          <h4 className="font-bold text-lg">{customer?.name || "Tunai"}</h4>
          <p className="whitespace-pre-line text-gray-600">{customer?.address || "-"}</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex justify-between md:justify-end gap-4">
            <span className="text-gray-500">Mata Uang:</span>
            <span className="font-bold">{data.currency}</span>
          </div>
          <div className="flex justify-between md:justify-end gap-4">
            <span className="text-gray-500">Kurs:</span>
            <span className="font-bold">{data.exchangeRate}</span>
          </div>
          {isReturn && (
            <div className="flex justify-between md:justify-end gap-4 text-red-600">
              <span className="font-bold">Ref Faktur:</span>
              <span className="font-bold">{(data as ReturnInvoice).salesInvoiceRef}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-300">
            <th className="py-2 px-4 text-left font-bold text-gray-600">No</th>
            <th className="py-2 px-4 text-left font-bold text-gray-600">Deskripsi Barang</th>
            <th className="py-2 px-4 text-center font-bold text-gray-600">Qty (Rol)</th>
            <th className="py-2 px-4 text-center font-bold text-gray-600">Total Panjang</th>
            <th className="py-2 px-4 text-right font-bold text-gray-600">Harga Satuan</th>
            <th className="py-2 px-4 text-right font-bold text-gray-600">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4 align-top">1</td>
            <td className="py-3 px-4 align-top">
              <p className="font-bold">{product?.name || "Item Tidak Dikenal"}</p>
              <p className="text-gray-500 text-[10px] italic mt-1">
                Rincian: {rows.join(", ")}
              </p>
            </td>
            <td className="py-3 px-4 text-center align-top">{data.totalRolls}</td>
            <td className="py-3 px-4 text-center align-top">{data.totalMeters.toFixed(2)} M</td>
            <td className="py-3 px-4 text-right align-top">
              {formatCurrency(data.pricePerMeter, data.currency)}
            </td>
            <td className="py-3 px-4 text-right align-top font-bold">
              {formatCurrency(data.totalPrice, data.currency)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td colSpan={5} className="py-3 px-4 text-right font-bold text-gray-700">GRAND TOTAL</td>
            <td className="py-3 px-4 text-right font-bold text-lg text-gray-900">
              {formatCurrency(data.totalPrice, data.currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer / Notes */}
      <div className="grid grid-cols-2 gap-8 mt-12 break-inside-avoid">
        <div>
          <p className="font-bold text-gray-400 uppercase text-[10px] mb-2">Catatan:</p>
          <div className="border border-gray-200 rounded p-3 min-h-[80px] bg-gray-50 text-sm">
            {data.notes || "-"}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            * Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian.<br/>
            * Pembayaran via transfer ke BCA: 123-456-7890 a/n PT Opin Textile.
          </p>
        </div>
        <div className="flex justify-between gap-4 text-center">
          <div className="flex flex-col justify-between h-32">
            <p className="font-bold text-gray-600">Penerima</p>
            <div className="border-b border-gray-400 w-24 mx-auto"></div>
          </div>
          <div className="flex flex-col justify-between h-32">
            <p className="font-bold text-gray-600">Hormat Kami</p>
            <div className="border-b border-gray-400 w-24 mx-auto"></div>
            <p className="text-[10px] font-bold">( Admin Penjualan )</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Layout 2: DELIVERY NOTE / SURAT JALAN (Logistik) ---
// Digunakan untuk: DyeingOrder, DyeingResult
const DeliveryLayout: React.FC<{
  data: DyeingOrder | DyeingResult;
  title: string;
  suppliers: Supplier[];
  products: Product[];
  type: "in" | "out"; // in = terima (result), out = kirim (order)
}> = ({ data, title, suppliers, products, type }) => {
  const supplier = suppliers.find((s) => String(s.id) === String(data.supplierId));
  const product = products.find((p) => String(p.id) === String(data.productId));

  // Flatten rows for Dyeing (paired array)
  // Logic to flatten complex pair structure for print
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
        title="FAKTUR PENJUALAN"
        customers={customers}
        products={products}
      />
    );
  }

  if (type === "return") {
    return (
      <InvoiceLayout
        data={data as ReturnInvoice}
        title="FAKTUR RETUR"
        customers={customers}
        products={products}
        isReturn={true}
      />
    );
  }

  if (type === "dyeing_order") {
    return (
      <DeliveryLayout
        data={data as DyeingOrder}
        title="SURAT JALAN"
        suppliers={suppliers}
        products={products}
        type="out"
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