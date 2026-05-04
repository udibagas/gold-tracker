# Migration dari SQLite ke PostgreSQL

Database telah diubah dari SQLite ke PostgreSQL. Ikuti langkah-langkah berikut untuk menyelesaikan migrasi:

## 1. Install Dependencies

Hapus node_modules dan install ulang dependencies:

```bash
rm -rf node_modules
bun install
```

## 2. Setup PostgreSQL Database

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE gold_tracker;
```

## 3. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env` dan sesuaikan dengan konfigurasi PostgreSQL Anda:

```bash
cp .env.example .env
```

Edit file `.env` dan ubah `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gold_tracker?schema=public"
```

Ganti:

- `username` dengan username PostgreSQL Anda
- `password` dengan password PostgreSQL Anda
- `localhost` dengan host database Anda jika berbeda
- `5432` dengan port PostgreSQL Anda jika berbeda
- `gold_tracker` dengan nama database yang Anda buat

## 4. Generate Prisma Client

Generate Prisma Client untuk PostgreSQL:

```bash
bun --bun run prisma generate
```

## 5. Jalankan Migrasi Database

Buat dan jalankan migrasi database:

```bash
bun run db:migrate
```

Prisma akan membuat tabel-tabel yang diperlukan di database PostgreSQL.

## 6. Seed Database (Opsional)

Jika ingin mengisi database dengan data sample:

```bash
# Seed semua data
bun run db:seed

# Atau seed per module
bun run db:seed:categories
bun run db:seed:purchases
bun run db:seed:cleanings
bun run db:seed:repairs
bun run db:seed:meltings
```

## 7. Jalankan Aplikasi

```bash
bun run dev
```

## Perubahan yang Dilakukan

1. **prisma/schema.prisma** - Provider diubah dari `sqlite` ke `postgresql`
2. **api/lib/prisma.ts** - Removed LibSQL adapter (tidak diperlukan untuk PostgreSQL)
3. **Semua seed files** - Removed LibSQL adapter
4. **package.json** - Removed SQLite dependencies (`@prisma/adapter-libsql`, `@prisma/adapter-better-sqlite3`, `@types/better-sqlite3`)
5. **.env.example** - Ditambahkan dengan contoh connection string PostgreSQL

## Troubleshooting

### Error: PrismaClient tidak dapat terhubung

Pastikan:

- PostgreSQL berjalan
- DATABASE_URL benar
- Database sudah dibuat
- User memiliki hak akses ke database

### Error saat migrasi

Jika ada error saat migrasi, reset database dan coba lagi:

```bash
bun run db:reset
```

**Peringatan:** Ini akan menghapus semua data!

## Keuntungan PostgreSQL vs SQLite

- ✅ Lebih cocok untuk production
- ✅ Mendukung concurrent connections lebih baik
- ✅ Fitur database lebih lengkap
- ✅ Performa lebih baik untuk dataset besar
- ✅ Backup dan recovery lebih mudah
