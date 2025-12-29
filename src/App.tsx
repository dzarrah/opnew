// deno-lint-ignore-file no-sloppy-imports no-explicit-any
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ReactDOM from "react-dom";
import Database from "@tauri-apps/plugin-sql";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatCard from "./components/StatCard";
import SalesSummaryTable from "./components/SalesSummaryTable";
import NewOrderForm from "./components/NewOrderForm";
import NewCustomerForm from "./components/NewCustomerForm";
import NewSupplierForm from "./components/NewSupplierForm";
import NewProductForm from "./components/NewProductForm";
import NewInvoiceForm from "./components/NewInvoiceForm";
import NewReturnInvoiceForm from "./components/NewReturnInvoiceForm";
import NewDyeingOrderForm from "./components/NewDyeingOrderForm";
import NewDyeingResultForm from "./components/NewDyeingResultForm";
import CustomerPage from "./components/CustomerPage";
import SupplierPage from "./components/SupplierPage";
import ProductsPage from "./components/ProductsPage";
import SalesInvoicePage from "./components/SalesInvoicePage";
import ReturnInvoicePage from "./components/ReturnInvoicePage";
import DyeingOrderPage from "./components/DyeingOrderPage";
import DyeingResultPage from "./components/DyeingResultPage";
import PrintTemplate from "./components/PrintTemplate";
import {
  CUSTOMERS as INITIAL_CUSTOMERS,
  ORDERS as INITIAL_ORDERS,
  PRODUCTS as INITIAL_PRODUCTS,
  SUPPLIERS as INITIAL_SUPPLIERS,
} from "./constants";
import {
  Customer,
  DyeingOrder,
  DyeingResult,
  Order,
  Product,
  ProductType,
  ReturnInvoice,
  SalesInvoice,
  Supplier,
} from "./types";

const App: React.FC = () => {
  // --- Database State ---
  const [db, setDb] = useState<Database | null>(null);
  const [dbStatus, setDbStatus] = useState("Initializing...");
  // const [dbUsers, setDbUsers] = useState<User[]>([]);

  // --- Dashboard State ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [returnInvoices, setReturnInvoices] = useState<ReturnInvoice[]>([]);
  const [dyeingOrders, setDyeingOrders] = useState<DyeingOrder[]>([]);
  const [dyeingResults, setDyeingResults] = useState<DyeingResult[]>([]);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);
  const [isNewDyeingModalOpen, setIsNewDyeingModalOpen] = useState(false);
  const [isNewResultModalOpen, setIsNewResultModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [editingReturnInvoice, setEditingReturnInvoice] = useState<
    ReturnInvoice | null
  >(null);
  const [editingDyeingOrder, setEditingDyeingOrder] = useState<
    DyeingOrder | null
  >(null);
  const [editingDyeingResult, setEditingDyeingResult] = useState<
    DyeingResult | null
  >(null);

  const [selectedProductType, setSelectedProductType] = useState<ProductType>(
    ProductType.JUAL,
  );

  // Print State
  const [printConfig, setPrintConfig] = useState<{ type: any; data: any; } | null>(null);

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // --- Initialize Database ---
  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await Database.load("sqlite:dataapp.db");
        setDb(database);

        await database.execute(
          `CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, age INTEGER)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL, comment TEXT, type TEXT)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT, phone TEXT, npwpNumber TEXT, npwpName TEXT, npwpAddress TEXT, npwpPhone TEXT, status TEXT, avatar TEXT)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS suppliers(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT, phone TEXT)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS sales_invoices(id INTEGER PRIMARY KEY AUTOINCREMENT, invoiceNumber TEXT UNIQUE NOT NULL, date TEXT NOT NULL, customerId TEXT NOT NULL, productId TEXT NOT NULL, currency TEXT, exchangeRate REAL, pricePerMeter REAL, totalPrice REAL, notaAngka TEXT, driverName TEXT, plateNumber TEXT, notes TEXT, totalRolls INTEGER, totalMeters REAL)`,
        );
        await database.execute(
          "CREATE INDEX IF NOT EXISTS idx_invoices_date ON sales_invoices(date)",
        );
        await database.execute(
          "CREATE INDEX IF NOT EXISTS idx_invoices_customer ON sales_invoices(customerId)",
        );

        // New Structure for invoice_rows (c0-c9)
        await database.execute(`CREATE TABLE IF NOT EXISTS invoice_rows(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  c0 REAL, c1 REAL, c2 REAL, c3 REAL, c4 REAL,
  c5 REAL, c6 REAL, c7 REAL, c8 REAL, c9 REAL,
  FOREIGN KEY(invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE
)`);

        await database.execute(
          `CREATE TABLE IF NOT EXISTS return_invoices(id INTEGER PRIMARY KEY AUTOINCREMENT, invoiceNumber TEXT UNIQUE NOT NULL, salesInvoiceRef TEXT NOT NULL, date TEXT NOT NULL, customerId TEXT NOT NULL, productId TEXT NOT NULL, currency TEXT, exchangeRate REAL, pricePerMeter REAL, totalPrice REAL, notaAngka TEXT, driverName TEXT, plateNumber TEXT, notes TEXT, totalRolls INTEGER, totalMeters REAL, originalRolls INTEGER, originalMeters REAL)`,
        );
        await database.execute(`CREATE TABLE IF NOT EXISTS return_invoice_rows(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  return_invoice_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  c0 REAL, c1 REAL, c2 REAL, c3 REAL, c4 REAL,
  c5 REAL, c6 REAL, c7 REAL, c8 REAL, c9 REAL,
  FOREIGN KEY(return_invoice_id) REFERENCES return_invoices(id) ON DELETE CASCADE
)`);

        await database.execute(
          `CREATE TABLE IF NOT EXISTS dyeing_orders(id INTEGER PRIMARY KEY AUTOINCREMENT, sjNumber TEXT UNIQUE NOT NULL, date TEXT NOT NULL, supplierId TEXT NOT NULL, productId TEXT NOT NULL, pricePerMeter REAL, color TEXT, setting TEXT, finish TEXT, vehicleType TEXT, vehiclePlate TEXT, notes TEXT, totalRolls INTEGER, totalMeters REAL, totalWeight REAL, totalPrice REAL)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS dyeing_order_items(id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, row_number INTEGER NOT NULL, pair_index INTEGER NOT NULL, panjang TEXT, berat TEXT, FOREIGN KEY(order_id) REFERENCES dyeing_orders(id) ON DELETE CASCADE)`,
        );

        await database.execute(
          `CREATE TABLE IF NOT EXISTS dyeing_results(id INTEGER PRIMARY KEY AUTOINCREMENT, sjNumber TEXT UNIQUE NOT NULL, date TEXT NOT NULL, supplierId TEXT NOT NULL, productId TEXT NOT NULL, pricePerMeter REAL, color TEXT, setting TEXT, finish TEXT, vehicleType TEXT, vehiclePlate TEXT, notes TEXT, totalRolls INTEGER, totalMeters REAL, totalWeight REAL, totalPrice REAL, orderSjRef TEXT, originalStats TEXT)`,
        );
        await database.execute(
          `CREATE TABLE IF NOT EXISTS dyeing_result_items(id INTEGER PRIMARY KEY AUTOINCREMENT, result_id INTEGER NOT NULL, row_number INTEGER NOT NULL, pair_index INTEGER NOT NULL, panjang TEXT, berat TEXT, FOREIGN KEY(result_id) REFERENCES dyeing_results(id) ON DELETE CASCADE)`,
        );

        setDbStatus("Connected");
        await loadProducts(database);
        await loadCustomers(database);
        await loadSuppliers(database);
        await loadInvoices(database);
        await loadReturnInvoices(database);
        await loadDyeingOrders(database);
        await loadDyeingResults(database);
        // Signal backend to close splash screen
        await invoke("close_splashscreen");
      } catch (error) {
        setDbStatus(`Error: ${error} `);
      }
    };
    initDb();
  }, []);

  // --- Helpers ---
  const generateNumber = async (
    prefix: string,
    table: string,
    column: string,
    dateContext?: string,
  ): Promise<string> => {
    if (!db) return "";
    const targetDate = dateContext ? new Date(dateContext) : new Date();
    const datePrefix = `${prefix}${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, "0")}${String(targetDate.getDate()).padStart(2, "0")}`;
    try {
      const result = await db.select<any[]>(
        `SELECT ${column} FROM ${table} WHERE ${column} LIKE $1 ORDER BY ${column} DESC LIMIT 1`,
        [`${datePrefix}%`],
      );
      let nextNum = 1;
      if (result.length > 0) {
        const lastSeq = parseInt(result[0][column].slice(-3));
        if (!isNaN(lastSeq)) nextNum = lastSeq + 1;
      }
      return `${datePrefix}${String(nextNum).padStart(3, "0")}`;
    } catch {
      return `${datePrefix}${Math.floor(Math.random() * 1000)}`;
    }
  };

  const generateInvoiceNumber = (date?: string) =>
    generateNumber("F", "sales_invoices", "invoiceNumber", date);
  const generateReturnInvoiceNumber = (date?: string) =>
    generateNumber("R", "return_invoices", "invoiceNumber", date);
  const generateDyeingOrderNumber = (date?: string) =>
    generateNumber("C", "dyeing_orders", "sjNumber", date);
  const generateDyeingResultNumber = (date?: string) =>
    generateNumber("H", "dyeing_results", "sjNumber", date);

  // --- Load Handlers ---
  const loadProducts = async (database: Database) => {
    const res = await database.select<Product[]>(
      "SELECT * FROM products ORDER BY id DESC",
    );
    if (res.length === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await database.execute(
          "INSERT INTO products (name, price, comment, type) VALUES ($1, $2, $3, $4)",
          [p.name, p.price, p.comment, p.type],
        );
      }
      setProducts(
        await database.select<Product[]>(
          "SELECT * FROM products ORDER BY id DESC",
        ),
      );
    } else setProducts(res);
  };

  const loadCustomers = async (database: Database) => {
    const res = await database.select<Customer[]>(
      "SELECT * FROM customers ORDER BY id DESC",
    );
    if (res.length === 0) {
      for (const c of INITIAL_CUSTOMERS) {
        await database.execute(
          "INSERT INTO customers (name, address, phone, npwpNumber, npwpName, npwpAddress, npwpPhone, status, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [
            c.name,
            c.address,
            c.phone,
            c.npwpNumber,
            c.npwpName,
            c.npwpAddress,
            c.npwpPhone,
            c.status,
            c.avatar,
          ],
        );
      }
      const seeded = await database.select<Customer[]>(
        "SELECT * FROM customers ORDER BY id DESC",
      );
      setCustomers(seeded.map((c) => ({ ...c, id: String(c.id) })));
    } else setCustomers(res.map((c) => ({ ...c, id: String(c.id) })));
  };

  const loadSuppliers = async (database: Database) => {
    const res = await database.select<Supplier[]>(
      "SELECT * FROM suppliers ORDER BY id DESC",
    );
    if (res.length === 0) {
      for (const s of INITIAL_SUPPLIERS) {
        await database.execute(
          "INSERT INTO suppliers (name, address, phone) VALUES ($1, $2, $3)",
          [s.name, s.address, s.phone],
        );
      }
      const seeded = await database.select<Supplier[]>(
        "SELECT * FROM suppliers ORDER BY id DESC",
      );
      setSuppliers(seeded.map((s) => ({ ...s, id: String(s.id) })));
    } else setSuppliers(res.map((s) => ({ ...s, id: String(s.id) })));
  };

  const loadInvoices = async (database: Database) => {
    const headers = await database.select<any[]>(
      "SELECT * FROM sales_invoices ORDER BY id DESC",
    );
    const allRows = await database.select<any[]>(
      "SELECT * FROM invoice_rows ORDER BY invoice_id, row_number",
    );
    const rowsMap = new Map();
    allRows.forEach((r) => {
      if (!rowsMap.has(r.invoice_id)) rowsMap.set(r.invoice_id, []);
      rowsMap.get(r.invoice_id).push({
        id: `row - ${r.id} `,
        lengths: [r.c0, r.c1, r.c2, r.c3, r.c4, r.c5, r.c6, r.c7, r.c8, r.c9]
          .map((v) => v === null ? "" : v),
      });
    });
    setInvoices(headers.map((h) => ({
      ...h,
      id: String(h.id),
      rows: rowsMap.get(h.id) || [],
      currency: h.currency || "IDR",
      exchangeRate: h.exchangeRate || 1,
    })));
  };

  const loadReturnInvoices = async (database: Database) => {
    const headers = await database.select<any[]>(
      "SELECT * FROM return_invoices ORDER BY id DESC",
    );
    const allRows = await database.select<any[]>(
      "SELECT * FROM return_invoice_rows ORDER BY return_invoice_id, row_number",
    );
    const rowsMap = new Map();
    allRows.forEach((r) => {
      if (!rowsMap.has(r.return_invoice_id)) {
        rowsMap.set(r.return_invoice_id, []);
      }
      rowsMap.get(r.return_invoice_id).push({
        id: `row - ${r.id} `,
        lengths: [r.c0, r.c1, r.c2, r.c3, r.c4, r.c5, r.c6, r.c7, r.c8, r.c9]
          .map((v) => v === null ? "" : v),
      });
    });
    setReturnInvoices(headers.map((h) => ({
      ...h,
      id: String(h.id),
      rows: rowsMap.get(h.id) || [],
      currency: h.currency || "Rp",
      exchangeRate: h.exchangeRate || 1,
    })));
  };

  const loadDyeingOrders = async (database: Database) => {
    const headers = await database.select<any[]>(
      "SELECT * FROM dyeing_orders ORDER BY id DESC",
    );
    const allItems = await database.select<any[]>(
      "SELECT * FROM dyeing_order_items ORDER BY order_id, row_number, pair_index",
    );
    const itemsMap = new Map();
    allItems.forEach((i: any) => {
      if (!itemsMap.has(i.order_id)) itemsMap.set(i.order_id, []);
      itemsMap.get(i.order_id).push(i);
    });
    setDyeingOrders(headers.map((h) => {
      const dbItems = itemsMap.get(h.id) || [];
      const grouped: any = {};
      dbItems.forEach((i: any) => {
        if (!grouped[i.row_number]) grouped[i.row_number] = [];
        grouped[i.row_number][i.pair_index] = {
          panjang: i.panjang,
          berat: i.berat,
        };
      });
      const uiRows = Object.keys(grouped).map((k) => ({
        id: `row - ${k} `,
        pairs: grouped[k].filter((x: any) => x !== undefined),
      }));
      return { ...h, id: String(h.id), rows: uiRows };
    }));
  };

  const loadDyeingResults = async (database: Database) => {
    const headers = await database.select<any[]>(
      "SELECT * FROM dyeing_results ORDER BY id DESC",
    );
    const allItems = await database.select<any[]>(
      "SELECT * FROM dyeing_result_items ORDER BY result_id, row_number, pair_index",
    );
    const itemsMap = new Map();
    allItems.forEach((i: any) => {
      if (!itemsMap.has(i.result_id)) itemsMap.set(i.result_id, []);
      itemsMap.get(i.result_id).push(i);
    });
    setDyeingResults(headers.map((h) => {
      const dbItems = itemsMap.get(h.id) || [];
      const grouped: any = {};
      dbItems.forEach((i: any) => {
        if (!grouped[i.row_number]) grouped[i.row_number] = [];
        grouped[i.row_number][i.pair_index] = {
          panjang: i.panjang,
          berat: i.berat,
        };
      });
      const uiRows = Object.keys(grouped).map((k) => ({
        id: `row - ${k} `,
        pairs: grouped[k].filter((x: any) => x !== undefined),
      }));
      let originalStats = { rolls: 0, meters: 0, weight: 0, price: 0 };
      try {
        originalStats = JSON.parse(h.originalStats);
      } catch { }
      return { ...h, id: String(h.id), rows: uiRows, originalStats };
    }));
  };

  // --- Save Handlers ---
  const handleSaveProduct = async (p: Product) => {
    if (!db) return;
    if (p.id && p.id !== 0) {
      await db.execute(
        "UPDATE products SET name=$1, price=$2, comment=$3, type=$4 WHERE id=$5",
        [p.name, p.price, p.comment, p.type, p.id],
      );
    } else {
      await db.execute(
        "INSERT INTO products (name, price, comment, type) VALUES ($1,$2,$3,$4)",
        [p.name, p.price, p.comment, p.type],
      );
    }
    await loadProducts(db);
    setEditingProduct(null);
  };

  const handleSaveCustomer = async (c: Customer) => {
    if (!db) return;
    if (c.id && !isNaN(Number(c.id)) && editingCustomer) {
      await db.execute(
        "UPDATE customers SET name=$1, address=$2, phone=$3, npwpNumber=$4, npwpName=$5, npwpAddress=$6, npwpPhone=$7 WHERE id=$8",
        [
          c.name,
          c.address,
          c.phone,
          c.npwpNumber,
          c.npwpName,
          c.npwpAddress,
          c.npwpPhone,
          c.id,
        ],
      );
    } else {
      await db.execute(
        "INSERT INTO customers (name, address, phone, npwpNumber, npwpName, npwpAddress, npwpPhone, status, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          c.name,
          c.address,
          c.phone,
          c.npwpNumber,
          c.npwpName,
          c.npwpAddress,
          c.npwpPhone,
          c.status,
          c.avatar,
        ],
      );
    }
    await loadCustomers(db);
    setEditingCustomer(null);
  };

  const handleSaveSupplier = async (s: Supplier) => {
    if (!db) return;
    if (s.id && !isNaN(Number(s.id)) && editingSupplier) {
      await db.execute(
        "UPDATE suppliers SET name=$1, address=$2, phone=$3 WHERE id=$4",
        [s.name, s.address, s.phone, s.id],
      );
    } else {
      await db.execute(
        "INSERT INTO suppliers (name, address, phone) VALUES ($1,$2,$3)",
        [s.name, s.address, s.phone],
      );
    }
    await loadSuppliers(db);
    setEditingSupplier(null);
  };

  const handleSaveInvoice = async (invoice: SalesInvoice) => {
    if (!db) return;
    let invId: number;
    const isUpd = invoice.id && !isNaN(Number(invoice.id)) && editingInvoice;
    if (isUpd) {
      invId = Number(invoice.id);
      await db.execute(
        `UPDATE sales_invoices SET invoiceNumber = $1, date = $2, customerId = $3, productId = $4, currency = $5, exchangeRate = $6, pricePerMeter = $7, totalPrice = $8, notaAngka = $9, driverName = $10, plateNumber = $11, notes = $12, totalRolls = $13, totalMeters = $14 WHERE id = $15`,
        [
          invoice.invoiceNumber,
          invoice.date,
          invoice.customerId,
          invoice.productId,
          invoice.currency,
          invoice.exchangeRate,
          invoice.pricePerMeter,
          invoice.totalPrice,
          invoice.notaAngka,
          invoice.driverName,
          invoice.plateNumber,
          invoice.notes,
          invoice.totalRolls,
          invoice.totalMeters,
          invId,
        ],
      );
      await db.execute("DELETE FROM invoice_rows WHERE invoice_id=$1", [invId]);
    } else {
      const res = await db.execute(
        `INSERT INTO sales_invoices(invoiceNumber, date, customerId, productId, currency, exchangeRate, pricePerMeter, totalPrice, notaAngka, driverName, plateNumber, notes, totalRolls, totalMeters) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          invoice.invoiceNumber,
          invoice.date,
          invoice.customerId,
          invoice.productId,
          invoice.currency,
          invoice.exchangeRate,
          invoice.pricePerMeter,
          invoice.totalPrice,
          invoice.notaAngka,
          invoice.driverName,
          invoice.plateNumber,
          invoice.notes,
          invoice.totalRolls,
          invoice.totalMeters,
        ],
      );
      invId = res.lastInsertId || 0;
    }
    for (let i = 0; i < invoice.rows.length; i++) {
      const row = invoice.rows[i];
      if (row.lengths.some((l) => l !== "" && !isNaN(parseFloat(String(l))))) {
        await db.execute(
          `INSERT INTO invoice_rows(invoice_id, row_number, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            invId,
            i,
            row.lengths[0] || null,
            row.lengths[1] || null,
            row.lengths[2] || null,
            row.lengths[3] || null,
            row.lengths[4] || null,
            row.lengths[5] || null,
            row.lengths[6] || null,
            row.lengths[7] || null,
            row.lengths[8] || null,
            row.lengths[9] || null,
          ],
        );
      }
    }
    await loadInvoices(db);
    setEditingInvoice(null);
  };

  const handleSaveReturnInvoice = async (invoice: ReturnInvoice) => {
    if (!db) return;
    let invId: number;
    const isUpd = invoice.id && !isNaN(Number(invoice.id)) &&
      editingReturnInvoice;
    if (isUpd) {
      invId = Number(invoice.id);
      await db.execute(
        `UPDATE return_invoices SET invoiceNumber = $1, salesInvoiceRef = $2, date = $3, customerId = $4, productId = $5, currency = $6, exchangeRate = $7, pricePerMeter = $8, totalPrice = $9, notaAngka = $10, driverName = $11, plateNumber = $12, notes = $13, totalRolls = $14, totalMeters = $15, originalRolls = $16, originalMeters = $17 WHERE id = $18`,
        [
          invoice.invoiceNumber,
          invoice.salesInvoiceRef,
          invoice.date,
          invoice.customerId,
          invoice.productId,
          invoice.currency,
          invoice.exchangeRate,
          invoice.pricePerMeter,
          invoice.totalPrice,
          invoice.notaAngka,
          invoice.driverName,
          invoice.plateNumber,
          invoice.notes,
          invoice.totalRolls,
          invoice.totalMeters,
          invoice.originalRolls,
          invoice.originalMeters,
          invId,
        ],
      );
      await db.execute(
        "DELETE FROM return_invoice_rows WHERE return_invoice_id=$1",
        [invId],
      );
    } else {
      const res = await db.execute(
        `INSERT INTO return_invoices(invoiceNumber, salesInvoiceRef, date, customerId, productId, currency, exchangeRate, pricePerMeter, totalPrice, notaAngka, driverName, plateNumber, notes, totalRolls, totalMeters, originalRolls, originalMeters) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          invoice.invoiceNumber,
          invoice.salesInvoiceRef,
          invoice.date,
          invoice.customerId,
          invoice.productId,
          invoice.currency,
          invoice.exchangeRate,
          invoice.pricePerMeter,
          invoice.totalPrice,
          invoice.notaAngka,
          invoice.driverName,
          invoice.plateNumber,
          invoice.notes,
          invoice.totalRolls,
          invoice.totalMeters,
          invoice.originalRolls,
          invoice.originalMeters,
        ],
      );
      invId = res.lastInsertId || 0;
    }
    for (let i = 0; i < invoice.rows.length; i++) {
      const row = invoice.rows[i];
      if (row.lengths.some((l) => l !== "" && !isNaN(parseFloat(String(l))))) {
        await db.execute(
          `INSERT INTO return_invoice_rows(return_invoice_id, row_number, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            invId,
            i,
            row.lengths[0] || null,
            row.lengths[1] || null,
            row.lengths[2] || null,
            row.lengths[3] || null,
            row.lengths[4] || null,
            row.lengths[5] || null,
            row.lengths[6] || null,
            row.lengths[7] || null,
            row.lengths[8] || null,
            row.lengths[9] || null,
          ],
        );
      }
    }
    await loadReturnInvoices(db);
    setEditingReturnInvoice(null);
  };

  const handleSaveDyeingOrder = async (order: DyeingOrder) => {
    if (!db) return;
    let ordId: number;
    const isUpd = order.id && !isNaN(Number(order.id)) && editingDyeingOrder;
    if (isUpd) {
      ordId = Number(order.id);
      await db.execute(
        `UPDATE dyeing_orders SET sjNumber = $1, date = $2, supplierId = $3, productId = $4, pricePerMeter = $5, color = $6, setting = $7, finish = $8, vehicleType = $9, vehiclePlate = $10, notes = $11, totalRolls = $12, totalMeters = $13, totalWeight = $14, totalPrice = $15 WHERE id = $16`,
        [
          order.sjNumber,
          order.date,
          order.supplierId,
          order.productId,
          order.pricePerMeter,
          order.color,
          order.setting,
          order.finish,
          order.vehicleType,
          order.vehiclePlate,
          order.notes,
          order.totalRolls,
          order.totalMeters,
          order.totalWeight,
          order.totalPrice,
          ordId,
        ],
      );
      await db.execute("DELETE FROM dyeing_order_items WHERE order_id=$1", [
        ordId,
      ]);
    } else {
      const res = await db.execute(
        `INSERT INTO dyeing_orders(sjNumber, date, supplierId, productId, pricePerMeter, color, setting, finish, vehicleType, vehiclePlate, notes, totalRolls, totalMeters, totalWeight, totalPrice) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          order.sjNumber,
          order.date,
          order.supplierId,
          order.productId,
          order.pricePerMeter,
          order.color,
          order.setting,
          order.finish,
          order.vehicleType,
          order.vehiclePlate,
          order.notes,
          order.totalRolls,
          order.totalMeters,
          order.totalWeight,
          order.totalPrice,
        ],
      );
      ordId = res.lastInsertId || 0;
    }
    for (let i = 0; i < order.rows.length; i++) {
      for (let j = 0; j < order.rows[i].pairs.length; j++) {
        if (order.rows[i].pairs[j].panjang) {
          await db.execute(
            "INSERT INTO dyeing_order_items (order_id, row_number, pair_index, panjang, berat) VALUES ($1,$2,$3,$4,$5)",
            [
              ordId,
              i,
              j,
              String(order.rows[i].pairs[j].panjang),
              String(order.rows[i].pairs[j].berat),
            ],
          );
        }
      }
    }
    await loadDyeingOrders(db);
    setEditingDyeingOrder(null);
  };

  const handleSaveDyeingResult = async (result: DyeingResult) => {
    if (!db) return;
    let resId: number;
    const isUpd = result.id && !isNaN(Number(result.id)) && editingDyeingResult;
    if (isUpd) {
      resId = Number(result.id);
      await db.execute(
        `UPDATE dyeing_results SET sjNumber = $1, date = $2, supplierId = $3, productId = $4, pricePerMeter = $5, color = $6, setting = $7, finish = $8, vehicleType = $9, vehiclePlate = $10, notes = $11, totalRolls = $12, totalMeters = $13, totalWeight = $14, totalPrice = $15, orderSjRef = $16, originalStats = $17 WHERE id = $18`,
        [
          result.sjNumber,
          result.date,
          result.supplierId,
          result.productId,
          result.pricePerMeter,
          result.color,
          result.setting,
          result.finish,
          result.vehicleType,
          result.vehiclePlate,
          result.notes,
          result.totalRolls,
          result.totalMeters,
          result.totalWeight,
          result.totalPrice,
          result.orderSjRef,
          JSON.stringify(result.originalStats),
          resId,
        ],
      );
      await db.execute("DELETE FROM dyeing_result_items WHERE result_id=$1", [
        resId,
      ]);
    } else {
      const res = await db.execute(
        `INSERT INTO dyeing_results(sjNumber, date, supplierId, productId, pricePerMeter, color, setting, finish, vehicleType, vehiclePlate, notes, totalRolls, totalMeters, totalWeight, totalPrice, orderSjRef, originalStats) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          result.sjNumber,
          result.date,
          result.supplierId,
          result.productId,
          result.pricePerMeter,
          result.color,
          result.setting,
          result.finish,
          result.vehicleType,
          result.vehiclePlate,
          result.notes,
          result.totalRolls,
          result.totalMeters,
          result.totalWeight,
          result.totalPrice,
          result.orderSjRef,
          JSON.stringify(result.originalStats),
        ],
      );
      resId = res.lastInsertId || 0;
    }
    for (let i = 0; i < result.rows.length; i++) {
      for (let j = 0; j < result.rows[i].pairs.length; j++) {
        if (result.rows[i].pairs[j].panjang) {
          await db.execute(
            "INSERT INTO dyeing_result_items (result_id, row_number, pair_index, panjang, berat) VALUES ($1,$2,$3,$4,$5)",
            [
              resId,
              i,
              j,
              String(result.rows[i].pairs[j].panjang),
              String(result.rows[i].pairs[j].berat),
            ],
          );
        }
      }
    }
    await loadDyeingResults(db);
    setEditingDyeingResult(null);
  };

  const handleDeleteDyeingResult = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM dyeing_result_items WHERE result_id=$1", [
        id,
      ]);
      await db.execute("DELETE FROM dyeing_results WHERE id=$1", [id]);
      await loadDyeingResults(db);
    }
  };

  // --- UI Handlers ---
  const handleDeleteProduct = async (id: number) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM products WHERE id=$1", [id]);
      await loadProducts(db);
    }
  };
  const handleDeleteCustomer = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM customers WHERE id=$1", [id]);
      await loadCustomers(db);
    }
  };
  const handleDeleteSupplier = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM suppliers WHERE id=$1", [id]);
      await loadSuppliers(db);
    }
  };
  const handleDeleteInvoice = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM invoice_rows WHERE invoice_id=$1", [id]);
      await db.execute("DELETE FROM sales_invoices WHERE id=$1", [id]);
      await loadInvoices(db);
    }
  };
  const handleDeleteReturnInvoice = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute(
        "DELETE FROM return_invoice_rows WHERE return_invoice_id=$1",
        [id],
      );
      await db.execute("DELETE FROM return_invoices WHERE id=$1", [id]);
      await loadReturnInvoices(db);
    }
  };
  const handleDeleteDyeingOrder = async (id: string) => {
    if (db && window.confirm("Hapus?")) {
      await db.execute("DELETE FROM dyeing_order_items WHERE order_id=$1", [
        id,
      ]);
      await db.execute("DELETE FROM dyeing_orders WHERE id=$1", [id]);
      await loadDyeingOrders(db);
    }
  };

  const handlePrint = (type: string, data: any) => {
    setPrintConfig({ type, data });
    setTimeout(() => window.print(), 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <ProductsPage
            products={products}
            onAddProductClick={(t) => {
              setEditingProduct(null);
              setSelectedProductType(t);
              setIsNewProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsNewProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case "customers":
        return (
          <CustomerPage
            customers={customers}
            onAddCustomerClick={() => {
              setEditingCustomer(null);
              setIsNewCustomerModalOpen(true);
            }}
            onEditCustomer={(c) => {
              setEditingCustomer(c);
              setIsNewCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case "suppliers":
        return (
          <SupplierPage
            suppliers={suppliers}
            onAddSupplierClick={() => {
              setEditingSupplier(null);
              setIsNewSupplierModalOpen(true);
            }}
            onEditSupplier={(s) => {
              setEditingSupplier(s);
              setIsNewSupplierModalOpen(true);
            }}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case "sales_invoices":
        return (
          <SalesInvoicePage
            invoices={invoices}
            customers={customers}
            products={products}
            onAddInvoiceClick={() => {
              setEditingInvoice(null);
              setIsNewInvoiceModalOpen(true);
            }}
            onPrintClick={(i) => handlePrint("sales", i)}
            onDeleteInvoice={handleDeleteInvoice}
            onEditInvoice={(i) => {
              setEditingInvoice(i);
              setIsNewInvoiceModalOpen(true);
            }}
          />
        );
      case "return_invoices": return <ReturnInvoicePage invoices={returnInvoices} customers={customers} products={products} salesInvoices={invoices} onAddInvoiceClick={() => { setEditingReturnInvoice(null); setIsNewReturnModalOpen(true); }} onPrintClick={(i: ReturnInvoice) => handlePrint("return", i)} onEditInvoice={(i: ReturnInvoice) => { setEditingReturnInvoice(i); setIsNewReturnModalOpen(true); }} onDeleteInvoice={handleDeleteReturnInvoice} />;
      case "dyeing_orders": return <DyeingOrderPage orders={dyeingOrders} suppliers={suppliers} products={products} onAddOrderClick={() => { setEditingDyeingOrder(null); setIsNewDyeingModalOpen(true); }} onPrintClick={(o: DyeingOrder) => handlePrint("dyeing_order", o)} onEditOrder={(o: DyeingOrder) => { setEditingDyeingOrder(o); setIsNewDyeingModalOpen(true); }} onDeleteOrder={handleDeleteDyeingOrder} />;
      case "dyeing_results":
        return (
          <DyeingResultPage
            results={dyeingResults}
            suppliers={suppliers}
            products={products}
            dyeingOrders={dyeingOrders}
            onAddResultClick={() => {
              setEditingDyeingResult(null);
              setIsNewResultModalOpen(true);
            }}
            onPrintClick={(r) => handlePrint("dyeing_result", r)}
            onEditResult={(r) => {
              setEditingDyeingResult(r);
              setIsNewResultModalOpen(true);
            }}
            onDeleteResult={handleDeleteDyeingResult}
          />
        );
      default:
        return (
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="keyboard_return"
                label="Total Faktur Retur"
                value={returnInvoices.length.toString()}
                color="bg-danger"
                progress={Math.min(returnInvoices.length * 10, 100)}
              />
              <StatCard
                icon="palette"
                label="Total Order Celup"
                value={dyeingOrders.length.toString()}
                color="bg-purple-500"
                progress={Math.min(dyeingOrders.length * 10, 100)}
              />
              <StatCard
                icon="receipt"
                label="Sales Invoices"
                value={invoices.length.toString()}
                color="bg-blue-500"
                progress={Math.min(invoices.length * 10, 100)}
              />
              <StatCard
                icon="check_circle"
                label="Hasil Celup"
                value={dyeingResults.length.toString()}
                color="bg-success"
                progress={Math.min(dyeingResults.length * 10, 100)}
              />
            </section>
            <section className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-[#283639] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#283639] flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold">
                  Daftar Penjualan Terakhir
                </h3>
                <button
                  onClick={() => setActiveTab("sales_invoices")}
                  className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1"
                >
                  Lihat
                  Semua<span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
              <SalesSummaryTable
                invoices={invoices}
                customers={customers}
                products={products}
              />
            </section>
          </div>
        );
    }
  };

  const renderPrintTemplate = () => {
    if (!printConfig) return null;
    const portal = document.getElementById("print-root");
    if (!portal) return null;
    return ReactDOM.createPortal(
      <PrintTemplate
        type={printConfig.type}
        data={printConfig.data}
        customers={customers}
        suppliers={suppliers}
        products={products}
      />,
      portal,
    );
  };

  return (

    <>

      <div className="flex h-screen w-full bg-[#f6f8f8] dark:bg-background-dark overflow-hidden transition-colors duration-300">

        <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} dbStatus={dbStatus} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">

          <Header onNewOrderClick={() => setIsNewInvoiceModalOpen(true)} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} activeTab={activeTab} onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="flex-1 overflow-y-auto no-scrollbar p-6">{renderContent()}</div>


          <NewOrderForm
            isOpen={isNewOrderModalOpen}
            onClose={() => setIsNewOrderModalOpen(false)}
            onSubmit={(o) => setOrders([o, ...orders])}
          />
          <NewCustomerForm
            isOpen={isNewCustomerModalOpen}
            onClose={() => {
              setIsNewCustomerModalOpen(false);
              setEditingCustomer(null);
            }}
            onSubmit={handleSaveCustomer}
            initialData={editingCustomer}
          />
          <NewSupplierForm
            isOpen={isNewSupplierModalOpen}
            onClose={() => {
              setIsNewSupplierModalOpen(false);
              setEditingSupplier(null);
            }}
            onSubmit={handleSaveSupplier}
            initialData={editingSupplier}
          />
          <NewProductForm
            isOpen={isNewProductModalOpen}
            onClose={() => {
              setIsNewProductModalOpen(false);
              setEditingProduct(null);
            }}
            onSubmit={handleSaveProduct}
            initialType={selectedProductType}
            initialData={editingProduct}
          />
          <NewInvoiceForm isOpen={isNewInvoiceModalOpen} onClose={() => { setIsNewInvoiceModalOpen(false); setEditingInvoice(null); }} onSubmit={handleSaveInvoice} customers={customers} products={products} invoiceCount={invoices.length} onPrint={handlePrint} onGenerateInvoiceNumber={generateInvoiceNumber} initialData={editingInvoice} />
          <NewReturnInvoiceForm isOpen={isNewReturnModalOpen} onClose={() => { setIsNewReturnModalOpen(false); setEditingReturnInvoice(null); }} onSubmit={handleSaveReturnInvoice} customers={customers} products={products} onPrint={handlePrint} salesInvoices={invoices} initialData={editingReturnInvoice} onGenerateInvoiceNumber={generateReturnInvoiceNumber} />
          <NewDyeingOrderForm isOpen={isNewDyeingModalOpen} onClose={() => { setIsNewDyeingModalOpen(false); setEditingDyeingOrder(null); }} onSubmit={handleSaveDyeingOrder} suppliers={suppliers} products={products} onPrint={handlePrint} initialData={editingDyeingOrder} onGenerateOrderNumber={generateDyeingOrderNumber} />
          <NewDyeingResultForm isOpen={isNewResultModalOpen} onClose={() => { setIsNewResultModalOpen(false); setEditingDyeingResult(null); }} onSubmit={handleSaveDyeingResult} suppliers={suppliers} products={products} dyeingOrders={dyeingOrders} onPrint={handlePrint} initialData={editingDyeingResult} onGenerateResultNumber={generateDyeingResultNumber} />
        </main>
      </div>
      {renderPrintTemplate()}
    </>
  );
};

export default App;
