import sqlite3
import re
import os
import sys

SQL_FILE = 'tnopnsptra.sql'
DB_FILE = 'dataapp.db'

def log(msg):
    print(f"[MIGRATOR] {msg}")

def connect_db():
    if not os.path.exists(DB_FILE):
        log(f"Database {DB_FILE} tidak ditemukan. Pastikan Anda berada di direktori yang benar.")
        sys.exit(1)
    return sqlite3.connect(DB_FILE)

def parse_sql_inserts(sql_content, table_name):
    """
    Mengekstrak data value dari statement INSERT INTO `table` ...
    Mengembalikan list of list of strings.
    """
    # Regex ini mencoba menangkap isi VALUES (...)
    # Tantangannya adalah satu statement INSERT bisa punya banyak tuple (...), (...), (...)
    pattern = re.compile(rf"INSERT INTO `{table_name}`.*?\sVALUES\s*(.*);", re.IGNORECASE | re.DOTALL)
    match = pattern.search(sql_content)
    
    if not match:
        return []

    values_str = match.group(1)
    
    # Simple parser untuk memisahkan tuple (), (), ()
    # Ini asumsi tidak ada karakter ')' di dalam string data itu sendiri yang tidak di-escape
    # Untuk kasus SQL dump standar phpMyAdmin biasanya cukup aman
    records = []
    current_record = ""
    in_tuple = False
    in_quote = False
    
    for char in values_str:
        if char == "'" and not in_quote:
            in_quote = True
        elif char == "'" and in_quote:
            in_quote = False
        
        if char == '(' and not in_quote and not in_tuple:
            in_tuple = True
            current_record = ""
            continue
        
        if char == ')' and not in_quote and in_tuple:
            in_tuple = False
            records.append(current_record)
            continue
            
        if in_tuple:
            current_record += char
            
    # Cleaning data
    cleaned_records = []
    for rec in records:
        # Split by comma, respecting quotes
        # Strategi: replace comma dalam quote dengan placeholder sementara, split, lalu restore
        # Tapi cara regex split lebih robust
        
        # Regex split by comma that is NOT inside quotes
        # r",(?=(?:[^']*'[^']*')*[^']*$)"
        fields = re.split(r",(?=(?:[^']*'[^']*')*[^']*$)", rec)
        
        cleaned_fields = []
        for f in fields:
            val = f.strip()
            if val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
                # Handle escaped quotes MySQL style (\' or '') -> sqlite '
                val = val.replace("\'", "'").replace("''", "'")
            elif val.upper() == 'NULL':
                val = None
            cleaned_fields.append(val)
        cleaned_records.append(cleaned_fields)
        
    return cleaned_records

def clean_tables(cursor):
    log("Mengosongkan tabel target...")
    tables = [
        'products', 'customers', 'suppliers', 
        'sales_invoices', 'invoice_rows', 
        'return_invoices', 'return_invoice_rows',
        'dyeing_orders', 'dyeing_order_items', 
        'dyeing_results', 'dyeing_result_items'
    ]
    for t in tables:
        cursor.execute(f"DELETE FROM {t}")
        cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{t}'")

def main():
    log(f"Membaca file {SQL_FILE}...")
    try:
        with open(SQL_FILE, 'r', encoding='utf-8', errors='ignore') as f:
            sql_content = f.read()
    except Exception as e:
        log(f"Gagal membaca file SQL: {e}")
        return

    conn = connect_db()
    cursor = conn.cursor()

    try:
        # Mulai Transaksi
        cursor.execute("BEGIN TRANSACTION")
        
        clean_tables(cursor)

        # --- 1. PRODUCTS ---
        log("Migrasi Produk...")
        product_map = {} # Old Code/Name -> New ID
        
        # A. Barang Jual (barang -> products)
        # Structure: kode_barang, nama_barang, harga, id_satuan, ket
        barang_data = parse_sql_inserts(sql_content, 'barang')
        for row in barang_data:
            if len(row) < 5: continue
            code, name, price, _, comment = row[:5]
            
            cursor.execute(
                "INSERT INTO products (name, price, comment, type) VALUES (?, ?, ?, ?)",
                (name, price, comment, 'JUAL')
            )
            product_map[code] = cursor.lastrowid # Map by Code 'B001'
            # Juga map by Name karena barangcelup pakai nama sebagai referensi kadang
            product_map[name] = cursor.lastrowid 

        # B. Barang Celup (barangcelup -> products)
        # Structure: kode_barang (int), nama_barang, harga, id_satuan
        # Note: kode_barang di sini auto-inc, referensi di order_celup pakai 'nama_barang' (varchar) ??
        # Mari kita cek sample order_celup nanti.
        # Asumsi insert nama unik.
        barangcelup_data = parse_sql_inserts(sql_content, 'barangcelup')
        for row in barangcelup_data:
            if len(row) < 3: continue
            # code_int = row[0] 
            name, price = row[1], row[2]
            
            # Cek duplikasi nama
            cursor.execute("SELECT id FROM products WHERE name = ?", (name,))
            exist = cursor.fetchone()
            if exist:
                product_map[name] = exist[0]
            else:
                cursor.execute(
                    "INSERT INTO products (name, price, comment, type) VALUES (?, ?, ?, ?)",
                    (name, price, '', 'CELUP')
                )
                product_map[name] = cursor.lastrowid

        # --- 2. CUSTOMERS ---
        log("Migrasi Customers...")
        customer_map = {} # Old ID -> New ID
        # Structure: id_costumer, nama, alamat, tlp, no_npwp, nama_npwp, alamat_npwp, tlp_npwp
        cust_data = parse_sql_inserts(sql_content, 'costumers')
        for row in cust_data:
            if len(row) < 8: continue
            old_id, name, addr, phone, npwp, npwp_name, npwp_addr, npwp_phone = row[:8]
            
            cursor.execute(
                """INSERT INTO customers (name, address, phone, npwpNumber, npwpName, npwpAddress, npwpPhone, status, avatar) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (name, addr, phone, npwp, npwp_name, npwp_addr, npwp_phone, 'Active', '')
            )
            customer_map[old_id] = cursor.lastrowid

        # --- 3. SUPPLIERS ---
        log("Migrasi Suppliers...")
        supplier_map = {} # Old Code -> New ID
        # Structure: kode_suplier, nama_suplier, alamat_suplier, ket (phone)
        supp_data = parse_sql_inserts(sql_content, 'sumpier')
        for row in supp_data:
            if len(row) < 4: continue
            code, name, addr, phone = row[:4]
            
            cursor.execute(
                "INSERT INTO suppliers (name, address, phone) VALUES (?, ?, ?)",
                (name, addr, phone)
            )
            supplier_map[code] = cursor.lastrowid

        # --- 4. SALES INVOICES ---
        log("Migrasi Faktur Jual...")
        invoice_map = {} # No Faktur -> New ID
        # Structure: no_faktur, tgl, kode_costumer, kode_barang, ..., total, terbilang, sopir, no_pol, ket
        faktur_data = parse_sql_inserts(sql_content, 'faktur_jual')
        for row in faktur_data:
            if len(row) < 12: continue
            no_faktur, date, cust_code, prod_code, _, _, _, total, terbilang, driver, plate, notes = row[:12]
            
            # Lookup IDs
            # Perhatikan: di SQL lama `kode_costumer` di `faktur_jual` itu '7', '8' (string angka) yang match `id_costumer` di `costumers`
            
            cust_id = customer_map.get(cust_code)
            prod_id = product_map.get(prod_code) # Lookup by Code 'B001'

            # Fallback jika tidak ketemu (penting agar tidak crash, set ke 0 atau dummy) 
            if not cust_id: cust_id = 0 
            if not prod_id: prod_id = 0

            cursor.execute(
                """INSERT INTO sales_invoices 
                   (invoiceNumber, date, customerId, productId, totalPrice, notaAngka, driverName, plateNumber, notes, currency, exchangeRate, pricePerMeter, totalRolls, totalMeters) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (no_faktur, date, str(cust_id), str(prod_id), total, terbilang, driver, plate, notes, 'Rp', 1, 0, 0, 0)
            )
            invoice_map[no_faktur] = cursor.lastrowid

        # --- 5. INVOICE ROWS ---
        log("Migrasi Item Faktur...")
        # Structure: id, no_faktur, p1..p10
        barang_jual_data = parse_sql_inserts(sql_content, 'barang_jual')
        for row in barang_jual_data:
            if len(row) < 12: continue
            # row[0] is id (skip), row[1] is no_faktur
            no_faktur = row[1]
            lengths = row[2:12] # p1..p10
            
            inv_id = invoice_map.get(no_faktur)
            if inv_id:
                # Insert as row 0 (karena struktur lama 1 row = banyak kolom p1-p10)
                # Di struktur baru c0..c9 cocok dengan p1..p10
                cursor.execute(
                    """INSERT INTO invoice_rows (invoice_id, row_number, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (inv_id, 0, *lengths) 
                )

        # --- 6. DYEING ORDERS ---
        log("Migrasi Order Celup...")
        order_map = {} # No SJ -> New ID
        # Structure: no_sj, tgl, kode_sumpier, kode_barang, harga, warna, setting, finish, jenis_kendaraan, no_pol, ket, total_rol, total_meter, total_kg, total_harga
        order_celup_data = parse_sql_inserts(sql_content, 'order_celup')
        for row in order_celup_data:
            if len(row) < 15: continue
            no_sj, date, supp_code, prod_name, price, color, setting, finish, vehicle, plate, notes, rolls, meters, weight, total = row[:15]
            
            supp_id = supplier_map.get(supp_code)
            prod_id = product_map.get(prod_name) # Lookup by Name

            if not supp_id: supp_id = 0
            if not prod_id: prod_id = 0

            cursor.execute(
                """INSERT INTO dyeing_orders 
                   (sjNumber, date, supplierId, productId, pricePerMeter, color, setting, finish, vehicleType, vehiclePlate, notes, totalRolls, totalMeters, totalWeight, totalPrice)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (no_sj, date, str(supp_id), str(prod_id), price, color, setting, finish, vehicle, plate, notes, rolls, meters, weight, total)
            )
            order_map[no_sj] = cursor.lastrowid

        # --- 7. DYEING ORDER ITEMS ---
        log("Migrasi Item Order Celup...")
        # Structure: id, no_sj, p1, b1, p2, b2 ... p5, b5
        barang_celup_items = parse_sql_inserts(sql_content, 'barang_celup')
        
        # Di tabel lama 1 baris punya 5 pasang (p,b).
        # Di tabel baru: order_id, row_number, pair_index, panjang, berat
        # Kita perlu mapping:
        # row SQL lama -> row_number baru (increment per SJ)
        # pair 1..5 -> pair_index 0..4
        
        sj_row_counter = {} # Keep track row number per SJ

        for row in barang_celup_items:
            if len(row) < 12: continue
            no_sj = row[1]
            pairs = row[2:12] # p1,b1...p5,b5
            
            ord_id = order_map.get(no_sj)
            if ord_id:
                if ord_id not in sj_row_counter:
                    sj_row_counter[ord_id] = 0
                current_row = sj_row_counter[ord_id]
                
                # Loop 5 pasang
                for i in range(5):
                    idx_p = i * 2
                    idx_b = i * 2 + 1
                    p_val = pairs[idx_p]
                    b_val = pairs[idx_b]
                    
                    if p_val is not None: # Insert jika ada data
                        cursor.execute(
                            """INSERT INTO dyeing_order_items (order_id, row_number, pair_index, panjang, berat)
                               VALUES (?, ?, ?, ?, ?)""",
                            (ord_id, current_row, i, p_val, b_val)
                        )
                
                sj_row_counter[ord_id] += 1

        conn.commit()
        log("Migrasi Selesai! Data berhasil disimpan.")
        
    except sqlite3.Error as e:
        log(f"Database Error: {e}")
        conn.rollback()
    except Exception as e:
        log(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
