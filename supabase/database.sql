-- ============================================================
-- DIGIDAW - COMPLETE DATABASE INIT SCRIPT
-- Run this in Supabase SQL Editor (Project > SQL Editor)
-- Includes Schema, RLS, and initial Seed Data
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. SCHEMA
-- ─────────────────────────────────────────

-- CATEGORIES
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(15, 0) not null default 0,
  category_id uuid references categories(id) on delete set null,
  image_urls text[] default '{}',
  file_url text,
  is_featured boolean default false,
  is_popular boolean default false,
  created_at timestamptz default now()
);

-- PAYMENT METHODS
create table if not exists payment_methods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('bank', 'ewallet', 'qris')),
  detail jsonb default '{}',
  logo_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  total_amount numeric(15, 0) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  payment_method_id uuid references payment_methods(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- ORDER ITEMS
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price numeric(15, 0) not null,
  quantity int not null default 1
);

-- SITE SETTINGS
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- ADMIN USERS
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────

-- Enable RLS on all tables
alter table categories enable row level security;
alter table products enable row level security;
alter table payment_methods enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table site_settings enable row level security;
alter table admin_users enable row level security;

-- PUBLIC READ POLICIES
drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories"
  on categories for select to anon, authenticated using (true);

drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products for select to anon, authenticated using (true);

drop policy if exists "Public can read active payment methods" on payment_methods;
create policy "Public can read active payment methods"
  on payment_methods for select to anon, authenticated using (is_active = true);

drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings"
  on site_settings for select to anon, authenticated using (true);

-- PUBLIC INSERT POLICIES (orders)
drop policy if exists "Public can create orders" on orders;
create policy "Public can create orders"
  on orders for insert to anon, authenticated with check (true);

drop policy if exists "Public can create order items" on order_items;
create policy "Public can create order items"
  on order_items for insert to anon, authenticated with check (true);

-- Block public from reading orders/admin_users directly
drop policy if exists "Block public read on orders" on orders;
create policy "Block public read on orders"
  on orders for select to anon using (false);

drop policy if exists "Block public read on order_items" on order_items;
create policy "Block public read on order_items"
  on order_items for select to anon using (false);

drop policy if exists "Block all on admin_users" on admin_users;
create policy "Block all on admin_users"
  on admin_users for all to anon using (false);

-- ─────────────────────────────────────────
-- 3. SEED INITIAL DATA
-- ─────────────────────────────────────────

-- Admin user (password: admin123)
insert into admin_users (username, password_hash)
values (
  'admin',
  '$2b$10$R8agcd2XOQ.yxXnnBjZHIee.0209bgnbu5bb21Jb1FhS3biyH/26m'
)
on conflict (username) do nothing;

-- Site settings
insert into site_settings (key, value)
values
  ('whatsapp_number', '6281234567890'),
  ('site_name', 'Digidaw'),
  ('featured_category_ids', '[]'),
  ('site_title', 'Digidaw - Toko Produk Digital Terpercaya'),
  ('site_description', 'Temukan dan beli produk digital berkualitas tinggi — template, ebook, preset, dan tools kreatif di Digidaw.'),
  ('site_favicon_url', ''),
  ('hero_badge', 'Elemen Digital Premium'),
  ('hero_title', 'Bangun Lebih Cepat.'),
  ('hero_description', 'Tingkatkan alur kerja kreatif Anda dengan pilihan templat tingkat tinggi, aset desain, dan kit pengembangan yang dikurasi khusus untuk studio modern.'),
  ('stat_1_value', '50+'),
  ('stat_1_label', 'Aset Digital'),
  ('stat_2_value', '1K+'),
  ('stat_2_label', 'Kreator Bahagia'),
  ('stat_3_value', '4.9'),
  ('stat_3_label', 'Rata-rata Penilaian'),
  ('feature_1_title', 'Akses Instan'),
  ('feature_1_desc', 'Aset langsung tersedia setelah pembayaran yang aman.'),
  ('feature_2_title', 'Kualitas Terkurasi'),
  ('feature_2_desc', 'Setiap produk diuji dan diverifikasi secara teliti.'),
  ('feature_3_title', 'Dukungan Premium'),
  ('feature_3_desc', 'Bantuan langsung tersedia untuk semua pertanyaan Anda.'),
  ('footer_description', 'Aset digital premium terkurasi. Tingkatkan proyek kreatif Anda dengan templat, alat, dan sumber daya tingkat tinggi.'),
  ('footer_copyright', 'Digidaw Studio.')
on conflict (key) do nothing;

-- Categories
insert into categories (id, name, slug)
values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Template', 'template'),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Ebook', 'ebook'),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'Preset & Filter', 'preset-filter'),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'Software & Tools', 'software-tools')
on conflict (slug) do nothing;

-- Sample products
insert into products (id, name, slug, description, price, category_id, is_featured, is_popular)
values
  (
    'b1c2d3e4-0002-0002-0002-000000000001',
    'Template Presentasi Premium',
    'template-presentasi-premium',
    'Template presentasi modern dan profesional dengan desain yang memukau. Cocok untuk presentasi bisnis, pitch deck, dan akademik.',
    45000,
    'a1b2c3d4-0001-0001-0001-000000000001',
    true,
    true
  ),
  (
    'b1c2d3e4-0002-0002-0002-000000000002',
    'Ebook Belajar Desain Grafis',
    'ebook-belajar-desain-grafis',
    'Panduan lengkap belajar desain grafis dari nol hingga mahir. Dilengkapi dengan latihan dan contoh praktis.',
    75000,
    'a1b2c3d4-0001-0001-0001-000000000002',
    true,
    false
  ),
  (
    'b1c2d3e4-0002-0002-0002-000000000003',
    'Paket Preset Lightroom Cinematic',
    'paket-preset-lightroom-cinematic',
    'Koleksi 50 preset Lightroom dengan gaya sinematik yang memukau. Cocok untuk foto portrait, landscape, dan street photography.',
    35000,
    'a1b2c3d4-0001-0001-0001-000000000003',
    false,
    true
  ),
  (
    'b1c2d3e4-0002-0002-0002-000000000004',
    'Template CV & Resume Profesional',
    'template-cv-resume-profesional',
    'Template CV modern yang mudah diedit dengan Microsoft Word atau Canva. Tersedia 5 desain eksklusif.',
    25000,
    'a1b2c3d4-0001-0001-0001-000000000001',
    false,
    true
  )
on conflict (slug) do nothing;

-- Payment methods
insert into payment_methods (name, type, detail, is_active, sort_order)
values
  (
    'BCA Transfer',
    'bank',
    '{"account_number": "1234567890", "account_name": "Digidaw Store", "bank_name": "Bank BCA"}',
    true,
    1
  ),
  (
    'Mandiri Transfer',
    'bank',
    '{"account_number": "0987654321", "account_name": "Digidaw Store", "bank_name": "Bank Mandiri"}',
    true,
    2
  ),
  (
    'GoPay',
    'ewallet',
    '{"phone_number": "081234567890", "account_name": "Digidaw Store"}',
    true,
    3
  ),
  (
    'OVO',
    'ewallet',
    '{"phone_number": "081234567890", "account_name": "Digidaw Store"}',
    true,
    4
  ),
  (
    'QRIS',
    'qris',
    '{"description": "Scan QR code berikut menggunakan aplikasi pembayaran apapun"}',
    true,
    5
  )
on conflict do nothing;

-- ─────────────────────────────────────────
-- 4. STORAGE BUCKETS
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('payment-logos', 'payment-logos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('site-settings', 'site-settings', true) on conflict do nothing;

-- Set up access controls for storage

-- Drop existing policies if they exist so we can recreate them cleanly
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Authenticated users can update images" on storage.objects;
drop policy if exists "Authenticated users can delete images" on storage.objects;
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow public updates" on storage.objects;
drop policy if exists "Allow public deletes" on storage.objects;

-- Create policies that allow anon and authenticated users to manage files 
-- (Given the context of this app where Admin UI calls supabase directly without tight auth session propagation, we allow public uploads to these specific buckets. Security by obscurity for the bucket names is often used in simple setups, or the admin API should handle the upload instead of the client).
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('product-images', 'payment-logos', 'site-settings') );

create policy "Allow public uploads"
  on storage.objects for insert
  with check ( bucket_id in ('product-images', 'payment-logos', 'site-settings') );

create policy "Allow public updates"
  on storage.objects for update
  using ( bucket_id in ('product-images', 'payment-logos', 'site-settings') );

create policy "Allow public deletes"
  on storage.objects for delete
  using ( bucket_id in ('product-images', 'payment-logos', 'site-settings') );
