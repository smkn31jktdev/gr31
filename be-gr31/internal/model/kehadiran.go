package model

import "time"

type Koordinat struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type KehadiranInput struct {
	Tanggal   string         `json:"tanggal"`
	Kehadiran KehadiranPatch `json:"kehadiran"`
}

type KehadiranPatch struct {
	Status           string     `json:"status"`
	AlasanTidakHadir string     `json:"alasanTidakHadir"`
	Koordinat        *Koordinat `json:"koordinat"`
	Jarak            *float64   `json:"jarak"`
	Akurasi          *float64   `json:"akurasi"`
	VerifiedAt       string     `json:"verifiedAt"`
}

type Kehadiran struct {
	ID               int        `json:"id" db:"id"`
	NISN             string     `json:"nisn" db:"nisn"`
	Nama             string     `json:"nama" db:"nama"`
	Kelas            string     `json:"kelas" db:"kelas"`
	Tanggal          string     `json:"tanggal" db:"tanggal"`
	Hari             string     `json:"hari" db:"hari"`
	Status           string     `json:"status" db:"status"`
	WaktuAbsen       string     `json:"waktuAbsen" db:"waktu_absen"`
	AlasanTidakHadir string     `json:"alasanTidakHadir" db:"alasan_tidak_hadir"`
	Koordinat        *Koordinat `json:"koordinat,omitempty"`
	Jarak            *float64   `json:"jarak,omitempty" db:"jarak"`
	Akurasi          *float64   `json:"akurasi,omitempty" db:"akurasi"`
	VerifiedAt       *string    `json:"verifiedAt,omitempty"`
	UpdatedBy        string     `json:"updatedBy,omitempty" db:"updated_by"`
	CreatedAt        time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time  `json:"updatedAt" db:"updated_at"`
}

type KehadiranFilter struct {
	Tanggal string
	Dari    string
	Sampai  string
	Kelas   string
	NISN    string
	Status  string
}
