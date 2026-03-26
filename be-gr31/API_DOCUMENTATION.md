# API Documentation - BE GR31

## Daftar Isi

- [Informasi Umum](#informasi-umum)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Internal API](#internal-api)
  - [Auth API](#auth-api)
  - [Student API](#student-api)
  - [Admin API](#admin-api)
- [Models](#models)

---

## Informasi Umum

### Base URL

```
http://localhost:8080
```

### Response Format

Semua response menggunakan format JSON standar:

```json
{
  "success": true,
  "error": "",
  "data": {}
}
```

### Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi. Token harus disertakan dalam header:

```
Authorization: Bearer <token>
```

### Role-Based Access

- **Student**: Akses untuk siswa
- **Admin**: Akses untuk admin sekolah (Guru Wali, BK, Piket, Super Admin)
- **Internal**: Akses untuk sistem internal

---

## Authentication

### 1. Student Login

Login untuk siswa menggunakan NISN dan password.

**Endpoint:** `POST /v1/student/login`

**Request Body:**

```json
{
  "nisn": "1234567890",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
```

    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "email": "siswa@example.com"
    }

}
}

````

---

### 2. Admin Login
Login untuk admin (Guru Wali, BK, Piket, Super Admin).

**Endpoint:** `POST /v1/admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
````

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nama": "Nama Admin",
      "email": "admin@example.com",
      "fotoProfil": "/uploads/profile.jpg"
    }
  }
}
```

---

### 3. Refresh Token

Memperbarui access token menggunakan refresh token.

**Endpoint:** `POST /v1/student/refresh-token` atau `POST /v1/admin/refresh-token`

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
```

    "refreshToken": "new_refresh_token"

}
}

```

---

### 4. Get Current User (Student)
Mendapatkan informasi user yang sedang login (Student).

**Endpoint:** `POST /v1/student/me`

**Headers:**
```

Authorization: Bearer <token>

````

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nisn": "1234567890",
    "nama": "Nama Siswa",
    "kelas": "XII RPL 1",
    "email": "siswa@example.com"
  }
}
````

---

### 5. Get Current User (Admin)

Mendapatkan informasi user yang sedang login (Admin).

**Endpoint:** `POST /v1/admin/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nama": "Nama Admin",
    "email": "admin@example.com",
    "fotoProfil": "/uploads/profile.jpg",
    "role": "super_admin"
  }
}
```

---

## Student API

### 1. Upsert Kehadiran

Membuat atau mengupdate data kehadiran siswa.

**Endpoint:** `POST /v1/student/kehadiran`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Request Body:**

```json
{
  "tanggal": "2024-01-15",
```

"kehadiran": {
"status": "hadir",
"alasanTidakHadir": "",
"koordinat": {
"lat": -6.2088,
"lng": 106.8456
},
"jarak": 50.5,
"akurasi": 10.0,
"verifiedAt": "2024-01-15T07:30:00Z"
}
}

````

**Status Values:**
- `hadir` - Siswa hadir
- `sakit` - Siswa sakit
- `izin` - Siswa izin
- `alpha` - Siswa alpha/tidak hadir tanpa keterangan

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Kehadiran berhasil disimpan"
  }
}
````

---

### 2. Get Kehadiran (Student)

Mendapatkan data kehadiran siswa.

**Endpoint:** `GET /v1/student/kehadiran`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `tanggal` (optional): Filter berdasarkan tanggal tertentu (format: YYYY-MM-DD)
- `dari` (optional): Filter dari tanggal (format: YYYY-MM-DD)
- `sampai` (optional): Filter sampai tanggal (format: YYYY-MM-DD)

**Example:**

```
GET /v1/student/kehadiran?dari=2024-01-01&sampai=2024-01-31
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "tanggal": "2024-01-15",
```

      "hari": "Senin",
      "status": "hadir",
      "waktuAbsen": "07:30:00",
      "alasanTidakHadir": "",
      "koordinat": {
        "lat": -6.2088,
        "lng": 106.8456
      },
      "jarak": 50.5,
      "akurasi": 10.0,
      "verifiedAt": "2024-01-15T07:30:00Z",
      "updatedBy": "system",
      "createdAt": "2024-01-15T07:30:00Z",
      "updatedAt": "2024-01-15T07:30:00Z"
    }

]
}

```

---

### 3. Upsert Kegiatan
Membuat atau mengupdate kegiatan siswa.

**Endpoint:** `POST /v1/student/kegiatan`

**Headers:**
```

Authorization: Bearer <student_token>

````

**Request Body:**
```json
{
  "tanggal": "2024-01-15",
  "section": "pagi",
  "data": {
    "kegiatan": "Belajar Matematika",
    "catatan": "Materi integral"
  }
}
````

**Section Values:**

- `pagi` - Kegiatan pagi
- `siang` - Kegiatan siang
- `sore` - Kegiatan sore

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Kegiatan berhasil disimpan"
  }
}
```

---

### 4. Update Kegiatan

Mengupdate kegiatan siswa yang sudah ada.

**Endpoint:** `PUT /v1/student/kegiatan`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Request Body:**

```json
{
```

"tanggal": "2024-01-15",
"section": "pagi",
"data": {
"kegiatan": "Belajar Fisika",
"catatan": "Materi gerak lurus"
}
}

````

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Kegiatan berhasil diupdate"
  }
}
````

---

### 5. Get Kegiatan (Student)

Mendapatkan data kegiatan siswa.

**Endpoint:** `GET /v1/student/kegiatan`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `tanggal` (optional): Filter berdasarkan tanggal tertentu
- `dari` (optional): Filter dari tanggal
- `sampai` (optional): Filter sampai tanggal

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "tanggal": "2024-01-15",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "pagi": {
        "kegiatan": "Belajar Matematika",
        "catatan": "Materi integral"
      },
      "siang": {},
      "sore": {}
    }
  ]
}
```

---

### 6. Delete Kegiatan

Menghapus kegiatan siswa.

**Endpoint:** `DELETE /v1/student/kegiatan`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `tanggal` (required): Tanggal kegiatan yang akan dihapus
- `section` (required): Section kegiatan (pagi/siang/sore)

**Example:**

```
DELETE /v1/student/kegiatan?tanggal=2024-01-15&section=pagi
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Kegiatan berhasil dihapus"
  }
}
```

---

### 7. Upsert Bukti

Upload bukti kegiatan siswa (foto/dokumen).

**Endpoint:** `POST /v1/student/bukti`

**Headers:**

```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `tanggal`: Tanggal bukti (YYYY-MM-DD)
- `file`: File bukti (image/pdf)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Bukti berhasil diupload",
    "url": "/uploads/bukti/file.jpg"
  }
}
```

---

### 8. Get Bukti (Student)

Mendapatkan data bukti kegiatan siswa.

**Endpoint:** `GET /v1/student/bukti`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `bulan` (optional): Filter berdasarkan bulan (format: YYYY-MM)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "tanggal": "2024-01-15",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "bukti": [
        {
          "url": "/uploads/bukti/file1.jpg",
          "uploadedAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
```

---

### 9. Create or Reply Aduan

Membuat aduan baru atau membalas aduan yang sudah ada.

**Endpoint:** `POST /v1/student/aduan`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Request Body (Create New):**

```json
{
```

"message": "Saya ingin melaporkan masalah..."
}

````

**Request Body (Reply):**
```json
{
  "ticketId": "TICKET-123456",
  "message": "Terima kasih atas responnya..."
}
````

**Response:**

```json
{
  "success": true,
  "data": {
    "ticketId": "TICKET-123456",
    "message": "Aduan berhasil dikirim"
  }
}
```

---

### 10. Get Aduan (Student)

Mendapatkan daftar aduan siswa.

**Endpoint:** `GET /v1/student/aduan`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `ticketId` (optional): Filter berdasarkan ticket ID tertentu
- `status` (optional): Filter berdasarkan status (open/in_progress/resolved/closed)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "ticketId": "TICKET-123456",
      "nisn": "1234567890",
      "namaSiswa": "Nama Siswa",
      "kelas": "XII RPL 1",
      "walas": "Pak Budi",
      "messages": [
        {
          "id": "msg-1",
          "from": "Nama Siswa",
          "role": "student",
          "message": "Saya ingin melaporkan masalah...",
          "timestamp": "2024-01-15T10:00:00Z"
        }
      ],
      "status": "open",
      "statusHistory": [
        {
          "status": "open",
          "updatedBy": "system",
          "role": "system",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Admin API

### 1. Get Kehadiran (Admin)

Mendapatkan data kehadiran siswa (untuk admin).

**Endpoint:** `GET /v1/admin/kehadiran`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `tanggal` (optional): Filter berdasarkan tanggal tertentu
- `dari` (optional): Filter dari tanggal
- `sampai` (optional): Filter sampai tanggal
- `kelas` (optional): Filter berdasarkan kelas
- `nisn` (optional): Filter berdasarkan NISN
- `status` (optional): Filter berdasarkan status (hadir/sakit/izin/alpha)

**Example:**

```
GET /v1/admin/kehadiran?kelas=XII RPL 1&dari=2024-01-01&sampai=2024-01-31
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "tanggal": "2024-01-15",
      "hari": "Senin",
      "status": "hadir",
      "waktuAbsen": "07:30:00",
      "alasanTidakHadir": "",
      "koordinat": {
        "lat": -6.2088,
        "lng": 106.8456
      },
      "jarak": 50.5,
      "akurasi": 10.0,
      "verifiedAt": "2024-01-15T07:30:00Z",
      "updatedBy": "system",
      "createdAt": "2024-01-15T07:30:00Z",
      "updatedAt": "2024-01-15T07:30:00Z"
    }
  ]
}
```

---

### 2. Create Admin

Membuat admin baru (hanya untuk Super Admin).

**Endpoint:** `POST /v1/admin/admins`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "nama": "Nama Admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "guru_wali"
}
```

**Role Values:**

- `super_admin` - Super Admin
- `guru_wali` - Guru Wali Kelas
- `bk` - Bimbingan Konseling
- `piket` - Guru Piket

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
```

    "nama": "Nama Admin",
    "email": "admin@example.com",
    "role": "guru_wali",
    "createdAt": "2024-01-15T10:00:00Z"

}
}

```

---

### 3. Load Admins from Google Sheets
Memuat data admin dari Google Sheets.

**Endpoint:** `POST /v1/admin/tambah-admin/sheets`

**Headers:**
```

Authorization: Bearer <admin_token>

````

**Request Body:**
```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/..."
}
````

**Response:**

```json
{
  "success": true,
  "data": {
    "preview": [
      {
        "nama": "Admin 1",
        "email": "admin1@example.com",
        "role": "guru_wali"
      }
    ],
    "total": 10
  }
}
```

---

### 4. Bulk Create Admins

Membuat banyak admin sekaligus.

**Endpoint:** `POST /v1/admin/tambah-admin/bulk`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "admins": [
    {
      "nama": "Admin 1",
      "email": "admin1@example.com",
      "password": "password123",
      "role": "guru_wali"
    },
    {
      "nama": "Admin 2",
      "email": "admin2@example.com",
      "password": "password123",
      "role": "bk"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

### 5. List Admins

Mendapatkan daftar admin.

**Endpoint:** `GET /v1/admin/admins`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `email` (optional): Filter berdasarkan email
- `role` (optional): Filter berdasarkan role

**Response:**

```json
{
```

"success": true,
"data": [
{
"id": "uuid",
"nama": "Nama Admin",
"email": "admin@example.com",
"fotoProfil": "/uploads/profile.jpg",
"role": "guru_wali",
"createdAt": "2024-01-15T10:00:00Z",
"updatedAt": "2024-01-15T10:00:00Z"
}
]
}

```

---

### 6. Create Student
Membuat siswa baru.

**Endpoint:** `POST /v1/admin/students`

**Headers:**
```

Authorization: Bearer <admin_token>

````

**Request Body:**
```json
{
  "nisn": "1234567890",
  "nama": "Nama Siswa",
  "kelas": "XII RPL 1",
  "walas": "Pak Budi",
  "email": "siswa@example.com",
  "password": "password123"
}
````

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nisn": "1234567890",
    "nama": "Nama Siswa",
    "kelas": "XII RPL 1",
    "walas": "Pak Budi",
    "email": "siswa@example.com",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 7. Load Students from Google Sheets

Memuat data siswa dari Google Sheets.

**Endpoint:** `POST /v1/admin/tambah-siswa/sheets`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "preview": [
      {
        "nisn": "1234567890",
        "nama": "Siswa 1",
        "kelas": "XII RPL 1",
        "walas": "Pak Budi"
      }
    ],
    "total": 50
  }
}
```

---

### 8. Bulk Create Students

Membuat banyak siswa sekaligus.

**Endpoint:** `POST /v1/admin/tambah-siswa/bulk`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
```

"students": [
{
"nisn": "1234567890",
"nama": "Siswa 1",
"kelas": "XII RPL 1",
"walas": "Pak Budi",
"email": "siswa1@example.com",
"password": "password123"
},
{
"nisn": "0987654321",
"nama": "Siswa 2",
"kelas": "XII RPL 2",
"walas": "Bu Ani",
"email": "siswa2@example.com",
"password": "password123"
}
]
}

````

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "errors": []
  }
}
````

---

### 9. List Students

Mendapatkan daftar siswa.

**Endpoint:** `GET /v1/admin/students`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `nisn` (optional): Filter berdasarkan NISN
- `kelas` (optional): Filter berdasarkan kelas
- `walas` (optional): Filter berdasarkan wali kelas

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "walas": "Pak Budi",
      "email": "siswa@example.com",
      "isOnline": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 10. Get Kegiatan (Admin)

Mendapatkan data kegiatan siswa (untuk admin).

**Endpoint:** `GET /v1/admin/kegiatan`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `nisn` (optional): Filter berdasarkan NISN
- `kelas` (optional): Filter berdasarkan kelas
- `tanggal` (optional): Filter berdasarkan tanggal
- `dari` (optional): Filter dari tanggal
- `sampai` (optional): Filter sampai tanggal

**Response:**

```json
{
  "success": true,
  "data": [
    {
```

      "tanggal": "2024-01-15",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "pagi": {
        "kegiatan": "Belajar Matematika",
        "catatan": "Materi integral"
      },
      "siang": {
        "kegiatan": "Belajar Fisika",
        "catatan": "Materi gerak"
      },
      "sore": {}
    }

]
}

```

---

### 11. Get Bukti (Admin)
Mendapatkan data bukti kegiatan siswa (untuk admin).

**Endpoint:** `GET /v1/admin/bukti`

**Headers:**
```

Authorization: Bearer <admin_token>

````

**Query Parameters:**
- `nisn` (optional): Filter berdasarkan NISN
- `kelas` (optional): Filter berdasarkan kelas
- `bulan` (optional): Filter berdasarkan bulan (YYYY-MM)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tanggal": "2024-01-15",
      "nisn": "1234567890",
      "nama": "Nama Siswa",
      "kelas": "XII RPL 1",
      "bukti": [
        {
          "url": "/uploads/bukti/file1.jpg",
          "uploadedAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
````

---

### 12. Get Delete Months

Mendapatkan daftar bulan yang tersedia untuk dihapus.

**Endpoint:** `GET /v1/admin/delete`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "months": ["2024-01", "2024-02", "2024-03"]
  }
}
```

---

### 13. Delete Kegiatan by Month

Menghapus semua kegiatan berdasarkan bulan.

**Endpoint:** `DELETE /v1/admin/delete`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `bulan` (required): Bulan yang akan dihapus (format: YYYY-MM)

**Example:**

```
DELETE /v1/admin/delete?bulan=2024-01
```

**Response:**

```json
{
  "success": true,
  "data": {
```

    "message": "Kegiatan bulan 2024-01 berhasil dihapus",
    "deleted": 150

}
}

```

---

### 14. Get Aduan (Admin)
Mendapatkan daftar aduan (untuk admin).

**Endpoint:** `GET /v1/admin/aduan`

**Headers:**
```

Authorization: Bearer <admin_token>

````

**Query Parameters:**
- `ticketId` (optional): Filter berdasarkan ticket ID
- `nisn` (optional): Filter berdasarkan NISN siswa
- `kelas` (optional): Filter berdasarkan kelas
- `status` (optional): Filter berdasarkan status
- `walas` (optional): Filter berdasarkan wali kelas
- `diteruskanKe` (optional): Filter berdasarkan yang diteruskan
- `limit` (optional): Limit jumlah data (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticketId": "TICKET-123456",
      "nisn": "1234567890",
      "namaSiswa": "Nama Siswa",
      "kelas": "XII RPL 1",
      "walas": "Pak Budi",
      "messages": [
        {
          "id": "msg-1",
          "from": "Nama Siswa",
          "role": "student",
          "message": "Saya ingin melaporkan masalah...",
          "timestamp": "2024-01-15T10:00:00Z"
        }
      ],
      "status": "open",
      "statusHistory": [
        {
          "status": "open",
          "updatedBy": "system",
          "role": "system",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ],
      "diteruskanKe": "BK",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
````

---

### 15. Get Aduan Room

Mendapatkan detail room aduan tertentu.

**Endpoint:** `GET /v1/admin/aduan/room`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `ticketId` (required): Ticket ID aduan

**Example:**

```
GET /v1/admin/aduan/room?ticketId=TICKET-123456
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ticketId": "TICKET-123456",
    "nisn": "1234567890",
    "namaSiswa": "Nama Siswa",
    "kelas": "XII RPL 1",
    "walas": "Pak Budi",
```

    "messages": [
      {
        "id": "msg-1",
        "from": "Nama Siswa",
        "role": "student",
        "message": "Saya ingin melaporkan masalah...",
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "id": "msg-2",
        "from": "Pak Budi",
        "role": "admin",
        "message": "Terima kasih laporannya, akan kami tindaklanjuti",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ],
    "status": "in_progress",
    "statusHistory": [
      {
        "status": "open",
        "updatedBy": "system",
        "role": "system",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      {
        "status": "in_progress",
        "updatedBy": "Pak Budi",
        "role": "admin",
        "updatedAt": "2024-01-15T11:00:00Z",
        "note": "Sedang ditindaklanjuti"
      }
    ],
    "diteruskanKe": "BK",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"

}
}

```

---

### 16. Update Aduan Status
Mengupdate status aduan.

**Endpoint:** `POST /v1/admin/aduan/status`

**Headers:**
```

Authorization: Bearer <admin_token>

````

**Request Body:**
```json
{
  "ticketId": "TICKET-123456",
  "status": "in_progress",
  "note": "Sedang ditindaklanjuti",
  "diteruskanKe": "BK"
}
````

**Status Values:**

- `open` - Aduan baru dibuka
- `in_progress` - Sedang ditangani
- `resolved` - Sudah diselesaikan
- `closed` - Ditutup

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Status aduan berhasil diupdate"
  }
}
```

---

### 17. Reply Aduan (Admin)

Admin membalas aduan siswa.

**Endpoint:** `POST /v1/admin/aduan/respond`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "ticketId": "TICKET-123456",
  "message": "Terima kasih laporannya, akan kami tindaklanjuti"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Balasan berhasil dikirim"
  }
}
```

---

### 18. Update Admin Settings

Mengupdate pengaturan profil admin.

**Endpoint:** `PUT /v1/admin/settings`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
```

"name": "Nama Admin Baru",
"newEmail": "newemail@example.com",
"currentPassword": "oldpassword123",
"newPassword": "newpassword123"
}

````

**Note:**
- Semua field bersifat optional
- Jika mengubah email atau password, `currentPassword` wajib diisi

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Pengaturan berhasil diupdate"
  }
}
````

---

### 19. Upload Admin Profile Photo

Upload foto profil admin.

**Endpoint:** `POST /v1/admin/profile-photo`

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `photo`: File foto profil (image)

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Foto profil berhasil diupload",
    "url": "/uploads/profile/admin-uuid.jpg"
  }
}
```

---

### 20. Delete Admin Profile Photo

Menghapus foto profil admin.

**Endpoint:** `DELETE /v1/admin/profile-photo`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Foto profil berhasil dihapus"
  }
}
```

---

## Internal API

API internal digunakan untuk komunikasi antar service atau sistem internal.

### 1. Client Upsert

Membuat atau mengupdate client.

**Endpoint:** `POST /internal/client-upsert`

**Headers:**

```
X-Internal-Key: <internal_secret_key>
```

**Request Body:**

```json
{
  "clientId": "client-123",
  "name": "Client Name",
  "apiKey": "api-key-123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Client berhasil disimpan"
  }
}
```

---

### 2. Client Find

Mencari client berdasarkan kriteria.

**Endpoint:** `POST /internal/client-find`

**Headers:**

```
X-Internal-Key: <internal_secret_key>
```

**Request Body:**

```json
{
  "clientId": "client-123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "clientId": "client-123",
    "name": "Client Name",
```

    "apiKey": "api-key-123",
    "createdAt": "2024-01-15T10:00:00Z"

}
}

```

---

### 3. Client Delete
Menghapus client.

**Endpoint:** `DELETE /internal/client-delete`

**Headers:**
```

X-Internal-Key: <internal_secret_key>

````

**Request Body:**
```json
{
  "clientId": "client-123"
}
````

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Client berhasil dihapus"
  }
}
```

---

## Models

### Response Model

```json
{
  "success": boolean,
  "error": "string (optional)",
  "data": any
}
```

### Student Model

```json
{
  "id": "string (uuid)",
  "nisn": "string",
  "nama": "string",
  "kelas": "string",
  "walas": "string (optional)",
  "email": "string (optional)",
  "isOnline": boolean,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Admin Model

```json
{
  "id": "string (uuid)",
  "nama": "string",
  "email": "string",
  "fotoProfil": "string (optional)",
  "role": "string (super_admin|guru_wali|bk|piket)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Kehadiran Model

```json
{
  "id": number,
  "nisn": "string",
  "nama": "string",
  "kelas": "string",
  "tanggal": "string (YYYY-MM-DD)",
  "hari": "string",
  "status": "string (hadir|sakit|izin|alpha)",
  "waktuAbsen": "string (HH:MM:SS)",
  "alasanTidakHadir": "string",
  "koordinat": {
    "lat": number,
    "lng": number
  },
  "jarak": number,
  "akurasi": number,
  "verifiedAt": "timestamp (optional)",
  "updatedBy": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Aduan Model

```json
{
  "ticketId": "string",
  "nisn": "string",
  "namaSiswa": "string",
  "kelas": "string",
  "walas": "string (optional)",
  "messages": [
    {
      "id": "string",
      "from": "string",
      "role": "string (student|admin)",
      "message": "string",
      "timestamp": "timestamp"
    }
  ],
  "status": "string (open|in_progress|resolved|closed)",
  "statusHistory": [
    {
      "status": "string",
      "updatedBy": "string",
      "role": "string",
      "updatedAt": "timestamp",
      "note": "string (optional)"
    }
  ],
  "diteruskanKe": "string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request berhasil
- `201 Created` - Resource berhasil dibuat
- `400 Bad Request` - Request tidak valid
- `401 Unauthorized` - Token tidak valid atau expired
- `403 Forbidden` - Tidak memiliki akses
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Error pada server

### Common Error Messages

- `"invalid token"` - Token JWT tidak valid
- `"token expired"` - Token sudah kadaluarsa
- `"unauthorized"` - Tidak memiliki akses ke resource
- `"invalid credentials"` - Email/NISN atau password salah
- `"resource not found"` - Data tidak ditemukan
- `"validation error"` - Data input tidak valid
- `"duplicate entry"` - Data sudah ada (NISN/Email duplikat)

---

## Static Files

### Uploads Directory

File yang diupload (foto profil, bukti kegiatan) dapat diakses melalui:

```
GET /uploads/<path-to-file>
```

**Example:**

```
GET /uploads/profile/admin-uuid.jpg
GET /uploads/bukti/siswa-nisn-2024-01-15.jpg
```

---

## Rate Limiting

Saat ini belum ada rate limiting yang diterapkan. Namun disarankan untuk:

- Tidak melakukan request berlebihan dalam waktu singkat
- Menggunakan pagination untuk data yang banyak
- Cache data yang jarang berubah di client side

---

## Pagination

Untuk endpoint yang mengembalikan banyak data, gunakan query parameters:

- `limit` - Jumlah data per halaman (default: 50)
- `offset` - Offset data (default: 0)
- `page` - Nomor halaman (alternative untuk offset)

**Example:**

```
GET /v1/admin/students?limit=20&page=2
```

---

## Date & Time Format

### Date Format

- `YYYY-MM-DD` - Contoh: `2024-01-15`

### Time Format

- `HH:MM:SS` - Contoh: `07:30:00`

### Timestamp Format

- ISO 8601 - Contoh: `2024-01-15T07:30:00Z`

---

## Best Practices

1. **Selalu sertakan Authorization header** untuk endpoint yang memerlukan autentikasi
2. **Gunakan HTTPS** di production untuk keamanan
3. **Validasi input** di client side sebelum mengirim request
4. **Handle error dengan baik** dan tampilkan pesan yang user-friendly
5. **Refresh token** sebelum expired untuk menghindari logout paksa
6. **Compress images** sebelum upload untuk menghemat bandwidth
7. **Cache data** yang jarang berubah untuk performa lebih baik
8. **Gunakan query parameters** untuk filtering dan pagination

---

## Testing

### Postman Collection

Anda dapat menggunakan Postman untuk testing API. Import collection dengan endpoint-endpoint di atas.

### Example cURL Commands

**Login Student:**

```bash
curl -X POST http://localhost:8080/v1/student/login \
  -H "Content-Type: application/json" \
  -d '{"nisn":"1234567890","password":"password123"}'
```

**Get Kehadiran (with token):**

```bash
curl -X GET "http://localhost:8080/v1/student/kehadiran?dari=2024-01-01&sampai=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Upload Bukti:**

```bash
curl -X POST http://localhost:8080/v1/student/bukti \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "tanggal=2024-01-15" \
  -F "file=@/path/to/image.jpg"
```

---

## Support & Contact

Untuk pertanyaan atau masalah terkait API, silakan hubungi:

- Email: support@example.com
- GitHub Issues: [Repository Link]

---

## Changelog

### Version 1.0.0 (2024-01-15)

- Initial API release
- Authentication endpoints
- Student management
- Admin management
- Kehadiran tracking
- Kegiatan management
- Bukti upload
- Aduan system

---

**Last Updated:** 2024-01-15
