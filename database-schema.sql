-- =============================================
-- 8 PARK SOREANG DATABASE SCHEMA
-- =============================================

-- 1. UNITS TABLE (Daftar Unit Properti)
-- =============================================
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  blok TEXT NOT NULL,
  tipe TEXT NOT NULL,
  luas_bangunan INT NOT NULL,
  luas_tanah INT NOT NULL,
  harga BIGINT NOT NULL,
  status TEXT DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'booking', 'terjual')),
  thumbnail TEXT,
  gallery TEXT[],
  fasilitas TEXT,
  spesifikasi JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_code ON units(code);

-- 2. LEADS TABLE (Calon Pembeli)
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap TEXT NOT NULL,
  nomor_whatsapp TEXT NOT NULL,
  email TEXT,
  minat_unit TEXT REFERENCES units(code),
  pesan TEXT,
  status TEXT DEFAULT 'baru' CHECK (status IN ('baru', 'contacted', 'interested', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_nomor_whatsapp ON leads(nomor_whatsapp);

-- 3. PROMOTIONS TABLE (Promo/Penawaran)
-- =============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  terms TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_active ON promotions(is_active);

-- 4. MARKETING EVENTS TABLE (Tracking Event)
-- =============================================
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_click', 'call_click', 'lead_submit', 'unit_view')),
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX idx_marketing_events_date ON marketing_events(created_at);

-- 5. SALES TABLE (Riwayat Penjualan)
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  sale_price BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_date ON sales(transaction_date);

-- =============================================
-- SAMPLE DATA (DEMO)
-- =============================================

-- Insert sample units
INSERT INTO units (name, code, blok, tipe, luas_bangunan, luas_tanah, harga, status, fasilitas) VALUES
('Rumah Tipe 65 - Blok A', 'A1', 'A', '65', 65, 84, 897933600, 'tersedia', 'Swimming Pool, Taman, Parkir'),
('Rumah Tipe 65 - Blok A', 'A2', 'A', '65', 65, 84, 897933600, 'tersedia', 'Swimming Pool, Taman, Parkir'),
('Rumah Tipe 90 - Blok B', 'B1', 'B', '90', 90, 120, 1200000000, 'tersedia', 'Swimming Pool, Taman, Parkir'),
('Rumah Tipe 90 - Blok B', 'B2', 'B', '90', 90, 120, 1200000000, 'booking', 'Swimming Pool, Taman, Parkir'),
('Rumah Tipe 65 - Blok C', 'C1', 'C', '65', 65, 84, 897933600, 'tersedia', 'Swimming Pool, Taman, Parkir'),
('Rumah Tipe 120 - Blok D', 'D1', 'D', '120', 120, 150, 1500000000, 'terjual', 'Swimming Pool, Taman, Parkir')
ON CONFLICT (code) DO NOTHING;

-- Insert sample promo
INSERT INTO promotions (title, description, terms, is_active) VALUES
('PROMO AKHIR TAHUN', 'Diskon cicilan dan bonus DP hingga 100 juta rupiah!', ARRAY['Berlaku untuk unit pilihan', 'Cicilan tanpa bunga 6 bulan pertama', 'Bonus furniture senilai 50 juta', 'Bonus pajak dan biaya notaris'], TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policies for units (public read, admin write)
CREATE POLICY "Allow public read units" ON units
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert units" ON units
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role update units" ON units
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policies for leads (anyone can insert, service role can read/update)
CREATE POLICY "Allow public insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role select leads" ON leads
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role update leads" ON leads
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policies for promotions (public read, admin write)
CREATE POLICY "Allow public read promotions" ON promotions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role all promotions" ON promotions
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for marketing_events (anyone can insert)
CREATE POLICY "Allow public insert marketing events" ON marketing_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role read marketing events" ON marketing_events
  FOR SELECT USING (auth.role() = 'service_role');

-- Policies for sales (service role only)
CREATE POLICY "Allow service role all sales" ON sales
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- DONE! Database siap digunakan
-- =============================================
