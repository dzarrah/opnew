
import { OrderStatus, Order, InventoryItem, Customer, CustomerStatus, Supplier, Product, ProductType } from './types';

export const ORDERS: Order[] = [
  { id: '#ORD-9012', client: 'Zara Home', material: 'Organic Cotton', quantity: '5,000m', deadline: 'Oct 24, 2023', status: OrderStatus.WEAVING },
  { id: '#ORD-9015', client: 'H&M Global', material: 'Recycled Poly', quantity: '12,500m', deadline: 'Oct 26, 2023', status: OrderStatus.DYEING },
  { id: '#ORD-9018', client: 'Uniqlo', material: 'Tech Fleece', quantity: '8,200m', deadline: 'Oct 29, 2023', status: OrderStatus.SCHEDULED },
  { id: '#ORD-8992', client: 'Patagonia', material: 'Hemp Canvas', quantity: '3,000m', deadline: 'Oct 22, 2023', status: OrderStatus.READY }
];

export const INVENTORY: InventoryItem[] = [
  { name: 'Raw Cotton', amount: '8,400 kg', percentage: 75, color: 'bg-primary' },
  { name: 'Polyester Thread', amount: '2,100 kg', percentage: 45, color: 'bg-purple-500' },
  { name: 'Silk Yarn', amount: '320 kg', percentage: 15, color: 'bg-red-500' },
  { name: 'Indigo Dye', amount: '950 L', percentage: 60, color: 'bg-blue-500' }
];

export const CUSTOMERS: Customer[] = [
  {
    id: '21',
    name: 'PT. FAIRCO AGUNG KENCANA',
    address: 'JL. RAYA BEKASI CILEUNGSI KM.19.5 RT.016/RW.07 DS/KEC.CILEUNGSI JAWA BARAT',
    phone: '021-8230509-12',
    npwpNumber: '01.441.594.7-436.000',
    npwpName: 'PT. FAIRCO AGUNG KENCANA.',
    npwpAddress: 'Jl.Raya Bekasi Cileungsi Km.19.5 Kp.Rawa Hingkik Cileungsi',
    npwpPhone: '',
    status: CustomerStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FA'
  },
  {
    id: '19',
    name: 'TN. INDRA TEJA',
    address: 'JL. BUYUT NO.2...',
    phone: '0231-207237',
    npwpNumber: '',
    npwpName: '',
    npwpAddress: '',
    npwpPhone: '',
    status: CustomerStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IT'
  },
  {
    id: '23',
    name: 'PT. UNIMITRA ...',
    address: 'JL. CILEUNGSI ...',
    phone: '021-3848400,823',
    npwpNumber: '01.621.405.8-43...',
    npwpName: 'PT. UNIMITRA ...',
    npwpAddress: '',
    npwpPhone: '',
    status: CustomerStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PU'
  }
];

export const SUPPLIERS: Supplier[] = [
  { id: 'S002', name: 'PT. SUMBER SA...', address: 'JL. RAYA DAYE...', phone: '022-52037' },
  { id: 'S003', name: 'PT. TJIMINDI S...', address: 'JL. RAYA CIMIN...', phone: '022-60106' },
  { id: 'S004', name: 'CV. PURNAMA', address: 'JL. RANCA JIGA...', phone: '022-59510' },
  { id: 'S005', name: 'PT. SAKURATEX', address: 'JL. RAYA DAYE...', phone: '022-52058' },
  { id: 'S006', name: 'PD. PADA MAJU', address: 'JL. CISIRUNG N...', phone: '' },
  { id: 'S007', name: 'PT. PADA MAJU', address: 'JL. CISIRUNG N...', phone: '5205079' }
];

export const PRODUCTS: Product[] = [
  // Barang Jual
  { id: 'B467', name: 'Kain TRC', price: 1.00, comment: 'Ready stock', type: ProductType.JUAL },
  { id: 'B468', name: 'Blue Jeans Black CV', price: 31000.00, comment: 'Popular item', type: ProductType.JUAL },
  { id: 'B469', name: 'Kain Denim Hitam', price: 1.00, comment: '-', type: ProductType.JUAL },
  // Barang Celup
  { id: '4', name: 'KAIN 12 X 10', price: 1.00, comment: 'Standard quality', type: ProductType.CELUP },
  { id: '5', name: 'Kain 1407 Natural', price: 1.00, comment: '-', type: ProductType.CELUP },
  { id: '8', name: 'KAIN 16/2 T/C X 16/2 T/C', price: 0.00, comment: 'Sample only', type: ProductType.CELUP }
];
