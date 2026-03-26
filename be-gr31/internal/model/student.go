package model

import "time"

type Student struct {
	ID        string    `json:"id" db:"id"`
	NISN      string    `json:"nisn" db:"nisn"`
	Nama      string    `json:"nama" db:"nama"`
	Kelas     string    `json:"kelas" db:"kelas"`
	Walas     string    `json:"walas,omitempty" db:"walas"`
	Email     string    `json:"email,omitempty" db:"email"`
	Password  string    `json:"-" db:"password"`
	IsOnline  bool      `json:"isOnline" db:"is_online"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type StudentFilter struct {
	NISN  string
	Kelas string
	Walas string
}

func (f StudentFilter) IsEmpty() bool {
	return f.NISN == "" && f.Kelas == "" && f.Walas == ""
}

type Admin struct {
	ID         string    `json:"id" db:"id"`
	Nama       string    `json:"nama" db:"nama"`
	Email      string    `json:"email" db:"email"`
	Password   string    `json:"-" db:"password"`
	FotoProfil string    `json:"fotoProfil,omitempty" db:"foto_profil"`
	Role       string    `json:"role,omitempty" db:"role"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`
}
