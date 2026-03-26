# Development Guide

## WebSocket HMR Error di VPS

Jika Anda mengalami error WebSocket seperti:

```
WebSocket connection to 'ws://148.230.96.35:3000/_next/webpack-hmr' failed
```

### Solusi:

1. **Gunakan script dev:vps** (untuk development di VPS):

   ```bash
   npm run dev:vps
   ```

2. **Atau jalankan dengan opsi tambahan**:

   ```bash
   next dev -H 0.0.0.0 -p 3000
   ```

3. **File `.env.local` sudah dikonfigurasi** dengan polling mode untuk menghindari WebSocket issues.

### Catatan:

- WebSocket HMR error tidak mempengaruhi fungsionalitas aplikasi
- Hot reload akan tetap bekerja menggunakan polling mode
- Untuk production, gunakan `npm run build && npm start`

## Development Scripts

- `npm run dev` - Development mode (localhost)
- `npm run dev:vps` - Development mode untuk VPS (bind ke 0.0.0.0)
- `npm run build` - Build production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
