# Postman API Testing Guide (MongoDB/AstraDB)

Dokumen ini menjelaskan urutan testing endpoint HTTP di backend Go untuk kebutuhan tim QA/Postman.

## 1) Base Setup

- Base URL: `http://localhost:8000`
- API version prefix: `/v1`
- Header auth:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

Pastikan `.env` sudah diisi:

- `OUTBOUND_DATABASE_DRIVER=mongodb`
- `INBOUND_HTTP_DRIVER=fiber`
- `JWT_SECRET=<secret-kuat>`
- `ASTRA_DB_TOKEN=<token>`
- `ASTRA_DB_ENDPOINT=<endpoint>`
- `ASTRA_DB_KEYSPACE=<keyspace>`
- `SUPER_ADMIN_EMAILS=<comma-separated email>`

## 2) Login

### Admin Login

- Method: `POST`
- URL: `/v1/admin/login`
- Body:

```json
{
  "email": "superadmin@school.local",
  "password": "admin123"
}
```

### Student Login

- Method: `POST`
- URL: `/v1/student/login`
- Body:

```json
{
  "nisn": "1234567890",
  "password": "student123"
}
```

## 3) Super Admin Tambah Admin Guru

- Method: `POST`
- URL: `/v1/admin/admins`
- Auth: token admin (super admin)
- Body:

```json
{
  "nama": "Guru Wali 10A",
  "email": "wali10a@school.local",
  "password": "wali123",
  "role": "admin"
}
```

## 4) Admin Tambah Siswa

- Method: `POST`
- URL: `/v1/admin/students`
- Auth: token admin
- Body:

```json
{
  "nisn": "1234567890",
  "nama": "Budi",
  "kelas": "10A",
  "walas": "Guru Wali 10A",
  "email": "budi@student.local",
  "password": "student123"
}
```

## 5) Monitoring Data Master oleh Admin

### List Admin

- Method: `GET`
- URL: `/v1/admin/admins?role=admin`
- Auth: token admin

### List Student

- Method: `GET`
- URL: `/v1/admin/students?kelas=10A`
- Auth: token admin

## 6) Kegiatan Siswa

### Student Simpan/Update Kegiatan

- Method: `POST`
- URL: `/v1/student/kegiatan`
- Auth: token student
- Body:

```json
{
  "tanggal": "2026-03-16",
  "section": "belajar",
  "data": {
    "mulai": "19:30",
    "selesai": "21:00",
    "catatan": "Belajar matematika"
  }
}
```

### Student Update Kegiatan (PUT)

- Method: `PUT`
- URL: `/v1/student/kegiatan`
- Auth: token student
- Body:

```json
{
  "tanggal": "2026-03-16",
  "section": "belajar",
  "data": {
    "mulai": "20:00",
    "selesai": "21:30",
    "catatan": "Update jadwal belajar"
  }
}
```

### Student Ambil Kegiatan Harian

- Method: `GET`
- URL: `/v1/student/kegiatan?tanggal=2026-03-16`
- Auth: token student

### Student Hapus Kegiatan (DELETE)

- Method: `DELETE`
- URL (hapus seluruh dokumen tanggal): `/v1/student/kegiatan?tanggal=2026-03-16`
- URL (hapus per section): `/v1/student/kegiatan?tanggal=2026-03-16&section=belajar`
- Auth: token student

### Admin Monitoring Kegiatan

- Method: `GET`
- URL: `/v1/admin/kegiatan?tanggal=2026-03-16&kelas=10A`
- Auth: token admin

## 7) Kehadiran Siswa

### Student Isi Kehadiran

- Method: `POST`
- URL: `/v1/student/kehadiran`
- Auth: token student
- Body:

```json
{
  "tanggal": "2026-03-16",
  "kehadiran": {
    "status": "hadir",
    "alasanTidakHadir": "",
    "koordinat": {
      "lat": -6.2,
      "lng": 106.8
    },
    "jarak": 10,
    "akurasi": 5
  }
}
```

### Student Ambil Kehadiran

- Method: `GET`
- URL: `/v1/student/kehadiran?tanggal=2026-03-16`
- Auth: token student

### Admin Monitoring Kehadiran

- Method: `GET`
- URL: `/v1/admin/kehadiran?tanggal=2026-03-16&kelas=10A`
- Auth: token admin

## 8) Aduan Siswa

### Student Buat Aduan Baru

- Method: `POST`
- URL: `/v1/student/aduan`
- Auth: token student
- Body:

```json
{
  "message": "Saya ingin konsultasi terkait pelajaran"
}
```

### Student Reply Aduan Existing

- Method: `POST`
- URL: `/v1/student/aduan`
- Auth: token student
- Body:

```json
{
  "ticketId": "ADU-20260316-001",
  "message": "Ini detail tambahan dari aduan saya"
}
```

### Student List Aduan

- Method: `GET`
- URL: `/v1/student/aduan`
- Auth: token student

### Admin Monitoring Aduan

- Method: `GET`
- URL: `/v1/admin/aduan?status=pending&kelas=10A`
- Auth: token admin

### Admin Update Status Aduan

- Method: `POST`
- URL: `/v1/admin/aduan/status`
- Auth: token admin
- Body:

```json
{
  "ticketId": "ADU-20260312-001",
  "status": "ditindaklanjuti",
  "diteruskanKe": "guru_bk"
}
```

### Admin Reply Aduan

- Method: `POST`
- URL: `/v1/admin/aduan/respond`
- Auth: token admin
- Body:

```json
{
  "ticketId": "ADU-20260316-001",
  "message": "Baik, aduan sudah kami proses"
}
```

## 9) Quick Health Check

- Method: `GET`
- URL: `/v1/ping`
- Catatan: endpoint ini menggunakan middleware client auth.

## 10) Urutan Rekomendasi Testing

1. Login admin (super admin)
2. Tambah admin guru
3. Tambah siswa
4. Login siswa
5. Siswa isi kegiatan
6. Admin cek kegiatan
7. Siswa isi kehadiran
8. Admin cek kehadiran
9. Siswa buat aduan
10. Admin monitor + balas/update status aduan
