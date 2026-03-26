# Development Guide

## WebSocket HMR Error di VPS

Jika Anda mengalami error WebSocket seperti:

```
WebSocket connection to 'ws://gr31.tech:3000/_next/webpack-hmr' failed
```

### Solusi:

1. **Gunakan script dev:vps** (untuk development di VPS, pakai `.env.production`):

   ```bash
   npm run dev:vps
   ```

2. **Atau jalankan dengan opsi tambahan**:

   ```bash
   next dev -H 0.0.0.0 -p 3000
   ```

3. **Di VPS gunakan `.env.production`**, sedangkan `.env.local` hanya untuk development lokal.

### Catatan:

- WebSocket HMR error tidak mempengaruhi fungsionalitas aplikasi
- Hot reload akan tetap bekerja menggunakan polling mode
- Untuk production di VPS, gunakan `npm run build:vps && npm run start:vps`

## Development Scripts

- `npm run dev` - Development mode (localhost)
- `npm run dev:vps` - Development mode untuk VPS (bind ke 0.0.0.0 + load `.env.production`)
- `npm run build` - Build production
- `npm start` - Start production server
- `npm run build:vps` - Build production dengan load `.env.production`
- `npm run start:vps` - Start production di VPS dengan load `.env.production`
- `npm run lint` - Run ESLint
