export enum OrderStatus {
  WEAVING = "Weaving",
  DYEING = "Dyeing",
  SCHEDULED = "Scheduled",
  READY = "Ready",
}

export interface Order {
  id: string;
  client: string;
  material: string;
  quantity: string;
  deadline: string;
  status: OrderStatus;
}

export interface InventoryItem {
  name: string;
  amount: string;
  percentage: number;
  color: string;
}

export enum CustomerStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  ON_HOLD = "On Hold",
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  npwpNumber: string;
  npwpName: string;
  npwpAddress: string;
  npwpPhone: string;
  status: CustomerStatus;
  avatar?: string;
  industry?: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export enum ProductType {
  JUAL = "Barang Jual",
  CELUP = "Barang Celup",
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  comment: string;
  type: ProductType;
}

export interface InvoiceRow {
  id: string;
  lengths: (number | string)[];
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  productId: string;
  currency: string;
  exchangeRate: number;
  pricePerMeter: number;
  totalPrice: number;
  notaAngka: string;
  driverName: string;
  plateNumber: string;
  notes: string;
  rows: InvoiceRow[];
  totalRolls: number;
  totalMeters: number;
}

export interface ReturnInvoice extends SalesInvoice {
  salesInvoiceRef: string; // Referensi No. Faktur Penjualan
  originalRolls: number;
  originalMeters: number;
}

export interface DyeingRollPair {
  panjang: number | string;
  berat: number | string;
}

export interface DyeingOrderRow {
  id: string;
  pairs: DyeingRollPair[];
}

export interface DyeingOrder {
  id: string;
  sjNumber: string;
  date: string;
  supplierId: string;
  productId: string;
  pricePerMeter: number;
  color: string;
  setting: string;
  finish: string;
  vehicleType: string;
  vehiclePlate: string;
  notes: string;
  rows: DyeingOrderRow[];
  totalRolls: number;
  totalMeters: number;
  totalWeight: number;
  totalPrice: number;
}

export interface DyeingResult extends DyeingOrder {
  orderSjRef: string; // Referensi No SJ Order (Cxxxxxxx)
  originalStats: {
    rolls: number;
    meters: number;
    weight: number;
    price: number;
  };
}

export enum LoomStatus {
  RUNNING = "Running",
  STOPPED = "Stopped",
  SETUP = "Setup",
}

export interface Loom {
  id: string;
  material: string;
  status: LoomStatus;
  image: string;
  speed: number;
  history: number[];
}
