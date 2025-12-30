import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// --- KONFIGURASI ---
const SQL_FILE_PATH = 'tnopnsptra.sql';
const DB_FILE_PATH = 'dataapp.db';
const LOG_FILE_PATH = 'migrator.log';

// --- SETUP ---
const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database(DB_FILE_PATH, (err) => {
    if (err) {
        log(`Gagal menyambung ke database ${DB_FILE_PATH}: ${err.message}`);
        process.exit(1);
    }
    log(`Berhasil menyambung ke database ${DB_FILE_PATH}`);
});

let logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'w' });

function log(message: string) {
    console.log(message);
    logStream.write(`${new Date().toISOString()} - ${message}\n`);
}

// --- FUNGSI UTAMA ---

async function runAsync(query: string, params: any[] = []): Promise<{ lastID: number, changes: number }> {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                log(`Error executing query: ${query} | Params: ${params} | Error: ${err.message}`);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

async function getAsync(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                log(`Error executing query: ${query} | Params: ${params} | Error: ${err.message}`);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}


function parseSqlInsert(sqlContent: string, tableName: string): any[] {
    const insertRegex = new RegExp(`INSERT INTO \`${tableName}\` \((.*?)\) VALUES (.*?);`, 'gis');
    const matches = [...sqlContent.matchAll(insertRegex)];
    if (!matches.length) {
        log(`Tidak ditemukan data INSERT untuk tabel: ${tableName}`);
        return [];
    }

    const valueTuples = matches.map(match => match[2].split('),(')).flat();
    const records = valueTuples.map(tuple => {
        const cleanedTuple = tuple.replace(/[()']/g, '');
        return cleanedTuple.split(',').map(v => v.trim());
    });

    log(`Ditemukan ${records.length} record untuk tabel ${tableName}`);
    return records;
}

async function clearTables() {
    log('--- Mengosongkan tabel lama ---');
    const tables = [
        'products', 'customers', 'suppliers', 'sales_invoices', 'invoice_rows',
        'dyeing_orders', 'dyeing_order_items', 'return_invoices', 'return_invoice_rows',
        'dyeing_results', 'dyeing_result_items'
    ];
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        for (const table of tables) {
            log(`Mengosongkan tabel ${table}...`);
            db.run(`DELETE FROM ${table}`);
            db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`); // Reset auto-increment
        }
        db.run('COMMIT');
    });
    log('Selesai mengosongkan tabel.');
}

async function migrateProducts(sqlContent: string) {
    log('\n--- Memigrasi Produk ---');
    const productMap = new Map<string, number>();

    // 1. Migrasi dari tabel `barang`
    const barangData = parseSqlInsert(sqlContent, 'barang');
    log(`Memigrasi ${barangData.length} produk dari tabel 'barang'`);
    for (const record of barangData) {
        const [kode_barang, nama_barang, harga, _, ket] = record;
        const result = await runAsync(
            'INSERT INTO products (name, price, comment, type) VALUES (?, ?, ?, ?)',
            [nama_barang, parseFloat(harga) || 0, ket, 'JUAL']
        );
        productMap.set(kode_barang, result.lastID);
    }

    // 2. Migrasi dari tabel `barangcelup`
    const barangCelupData = parseSqlInsert(sqlContent, 'barangcelup');
    log(`Memigrasi ${barangCelupData.length} produk dari tabel 'barangcelup'`);
    for (const record of barangCelupData) {
        // kode_barang di sini adalah AUTO_INCREMENT integer, jadi kita pakai nama_barang sebagai key
        const [_, nama_barang, harga] = record;
        // Cek jika produk sudah ada berdasarkan nama
        let existing = await getAsync('SELECT id FROM products WHERE name = ?', [nama_barang]);
        if (!existing) {
             const result = await runAsync(
                'INSERT INTO products (name, price, comment, type) VALUES (?, ?, ?, ?)',
                [nama_barang, parseFloat(harga) || 0, '', 'CELUP']
            );
            // Tidak ada kode unik yang jelas di `barangcelup`, jadi kita tidak bisa memetakannya
        }
    }

    log('Migrasi produk selesai.');
    return productMap;
}


async function migrateCustomers(sqlContent: string): Promise<Map<string, number>> {
    log('\n--- Memigrasi Pelanggan ---');
    const customerMap = new Map<string, number>();
    const customerData = parseSqlInsert(sqlContent, 'costumers'); // Perhatikan typo 'costumers'

    for (const record of customerData) {
        const [kode_costumer, nama_costumer, alamat, no_telp, no_npwp, nama_npwp, alamat_npwp, no_telp_npwp] = record;
        const result = await runAsync(
            'INSERT INTO customers (name, address, phone, npwpNumber, npwpName, npwpAddress, npwpPhone, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nama_costumer, alamat, no_telp, no_npwp, nama_npwp, alamat_npwp, no_telp_npwp, 'Active', '']
        );
        customerMap.set(kode_costumer, result.lastID);
    }
    log('Migrasi pelanggan selesai.');
    return customerMap;
}

async function migrateSuppliers(sqlContent: string): Promise<Map<string, number>> {
    log('\n--- Memigrasi Supplier ---');
    const supplierMap = new Map<string, number>();
    const supplierData = parseSqlInsert(sqlContent, 'sumpier'); // Perhatikan typo 'sumpier'

    for (const record of supplierData) {
        const [kode_sumpier, nama_sumpier, alamat, no_telp] = record;
        const result = await runAsync(
            'INSERT INTO suppliers (name, address, phone) VALUES (?, ?, ?)',
            [nama_sumpier, alamat, no_telp]
        );
        supplierMap.set(kode_sumpier, result.lastID);
    }
    log('Migrasi supplier selesai.');
    return supplierMap;
}

async function migrateSalesInvoices(sqlContent: string, customerMap: Map<string, number>, productMap: Map<string, number>) {
    log('\n--- Memigrasi Faktur Penjualan ---');
    const invoiceMap = new Map<string, number>();

    // 1. Migrasi faktur_jual
    const invoiceData = parseSqlInsert(sqlContent, 'faktur_jual');
    for (const record of invoiceData) {
        const [no_faktur, tgl, kode_costumer, kode_barang, _, __, ___, total, terbilang, sopir, no_pol, ket] = record;
        
        const customerId = customerMap.get(kode_costumer);
        const productId = productMap.get(kode_barang);

        if (!customerId) {
            log(`Peringatan: Melewatkan faktur ${no_faktur} karena kode_costumer ${kode_costumer} tidak ditemukan.`);
            continue;
        }
        if (!productId) {
            log(`Peringatan: Melewatkan faktur ${no_faktur} karena kode_barang ${kode_barang} tidak ditemukan.`);
            continue;
        }

        const result = await runAsync(
            'INSERT INTO sales_invoices (invoiceNumber, date, customerId, productId, totalPrice, notaAngka, driverName, plateNumber, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [no_faktur, tgl, customerId, productId, parseFloat(total) || 0, terbilang, sopir, no_pol, ket]
        );
        invoiceMap.set(no_faktur, result.lastID);
    }

    // 2. Migrasi barang_jual
    const invoiceRowsData = parseSqlInsert(sqlContent, 'barang_jual');
    log(`Memigrasi ${invoiceRowsData.length} baris item faktur.`);
    for (const record of invoiceRowsData) {
        const [_, no_faktur, ...rolls] = record;
        const invoiceId = invoiceMap.get(no_faktur);
        if (invoiceId) {
            // Asumsi 1 baris di `barang_jual` menjadi 1 baris di `invoice_rows`
            const params = [invoiceId, 0, ...rolls.slice(0, 10).map(r => parseFloat(r) || null)];
            // Pad with nulls if less than 10 rolls
            while (params.length < 12) {
                params.push(null);
            }
             await runAsync(
                'INSERT INTO invoice_rows (invoice_id, row_number, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                params
            );
        } else {
            log(`Peringatan: Melewatkan baris faktur karena no_faktur ${no_faktur} tidak ditemukan di map.`);
        }
    }

    log('Migrasi faktur penjualan selesai.');
}

async function migrateDyeingOrders(sqlContent: string, supplierMap: Map<string, number>, productMap: Map<string, number>) {
    log('\n--- Memigrasi Order Celup ---');
    const orderMap = new Map<string, number>();

    // 1. Migrasi `order_celup`
    const orderData = parseSqlInsert(sqlContent, 'order_celup');
    for (const record of orderData) {
        const [no_sj, tgl, kode_sumpier, kode_barang, harga, warna, setting, finish, jenis_kendaraan, no_pol, ket, total_rol, total_meter, total_kg, total_harga] = record;

        const supplierId = supplierMap.get(kode_sumpier);
        const product = await getAsync('SELECT id FROM products WHERE name = ?', [kode_barang]);


        if (!supplierId) {
            log(`Peringatan: Melewatkan order celup ${no_sj} karena kode_sumpier ${kode_sumpier} tidak ditemukan.`);
            continue;
        }
         if (!product) {
            log(`Peringatan: Melewatkan order celup ${no_sj} karena produk ${kode_barang} tidak ditemukan.`);
            continue;
        }

        const result = await runAsync(
            `INSERT INTO dyeing_orders (sjNumber, date, supplierId, productId, pricePerMeter, color, setting, finish, vehicleType, vehiclePlate, notes, totalRolls, totalMeters, totalWeight, totalPrice)`
             ` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [no_sj, tgl, supplierId, product.id, parseFloat(harga) || 0, warna, setting, finish, jenis_kendaraan, no_pol, ket, parseInt(total_rol) || 0, parseFloat(total_meter) || 0, parseFloat(total_kg) || 0, parseFloat(total_harga) || 0]
        );
        orderMap.set(no_sj, result.lastID);
    }
    
    // 2. Migrasi `barang_celup` (items)
    const orderItemsData = parseSqlInsert(sqlContent, 'barang_celup');
    log(`Memigrasi ${orderItemsData.length} baris item order celup.`);
    const itemsBySj = new Map<string, any[]>();
    for (const record of orderItemsData) {
        const [_, no_sj, ...pairs] = record;
        if (!itemsBySj.has(no_sj)) {
            itemsBySj.set(no_sj, []);
        }
        itemsBySj.get(no_sj)!.push(pairs);
    }
    
    for (const [no_sj, rows] of itemsBySj.entries()) {
        const orderId = orderMap.get(no_sj);
        if (orderId) {
            let rowNumber = 0;
            for (const row of rows) {
                for (let i = 0; i < row.length; i += 2) {
                    const panjang = row[i];
                    const berat = row[i + 1];
                    if (panjang !== null && panjang !== undefined && panjang !== 'NULL') {
                        await runAsync(
                            'INSERT INTO dyeing_order_items (order_id, row_number, pair_index, panjang, berat) VALUES (?, ?, ?, ?, ?)',
                            [orderId, rowNumber, i / 2, panjang, berat]
                        );
                    }
                }
                rowNumber++;
            }
        } else {
             log(`Peringatan: Melewatkan item order celup karena no_sj ${no_sj} tidak ditemukan di map.`);
        }
    }


    log('Migrasi order celup selesai.');
}


async function main() {
    log('Memulai proses migrasi...');

    let sqlContent: string;
    try {
        sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf-8');
        log('Berhasil membaca file SQL.');
    } catch (error) {
        log(`Gagal membaca file SQL: ${error.message}`);
        process.exit(1);
    }

    await clearTables();
    
    db.serialize(async () => {
        try {
            await runAsync('BEGIN TRANSACTION');

            const productMap = await migrateProducts(sqlContent);
            const customerMap = await migrateCustomers(sqlContent);
            const supplierMap = await migrateSuppliers(sqlContent);
            await migrateSalesInvoices(sqlContent, customerMap, productMap);
            await migrateDyeingOrders(sqlContent, supplierMap, productMap);
            
            await runAsync('COMMIT');
            log('\n--- MIGRASI BERHASIL ---');
            log('Semua data telah dimigrasi. Silakan periksa aplikasi dan file migrator.log untuk detailnya.');

        } catch (error) {
            await runAsync('ROLLBACK');
            log(`\n--- MIGRASI GAGAL ---`);
            log(`Terjadi error: ${error.message}`);
            log('Transaksi dibatalkan, tidak ada data yang diubah.');
        } finally {
            db.close((err) => {
                if (err) {
                    log(`Gagal menutup koneksi database: ${err.message}`);
                } else {
                    log('Koneksi database ditutup.');
                }
                logStream.end();
            });
        }
    });
}

main();
