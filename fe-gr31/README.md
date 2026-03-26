This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## API Configuration (be-gr31)

Frontend now uses centralized API config in `src/lib/config/api.ts`.

### Environment Base URL

- Dev: `http://localhost:8080`
- Prod: `https://api.gr31.tech`

Set environment from `.env.local` (copy from `.env.example`):

```env
NEXT_PUBLIC_IS_DEVELOPMENT=true
```

When deploying to production, set:

```env
NEXT_PUBLIC_IS_DEVELOPMENT=false
```

Optional full override:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-custom-api-host
```

### Available Endpoint Groups

- Auth admin/siswa: login + profile (`/v1/admin/login`, `/v1/student/login`, etc.)
- Kegiatan siswa + monitoring admin
- Kehadiran (absensi) siswa + monitoring admin
- Aduan siswa + monitoring/status/respond admin
- Admin create/list admin dan create/list siswa

Notes:

- Endpoint delete admin/siswa belum tersedia pada route publik `be-gr31` saat ini.
- Config menyediakan `internal.clientDelete` (`/internal/client-delete`) hanya untuk internal auth flow.

### Usage Example

```ts
import { API_ENDPOINTS, createAuthHeaders, toApiUrl } from "@/lib/config";

async function loginAdmin(email: string, password: string) {
  const response = await fetch(toApiUrl(API_ENDPOINTS.auth.adminLogin), {
    method: "POST",
    headers: createAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
