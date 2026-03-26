package model

import "time"

type AuthClaims struct {
	ID    string
	Email string
	Role  string
	NISN  string
	Exp   int64
}

type StudentLoginInput struct {
	NISN     string `json:"nisn"`
	Password string `json:"password"`
}

type AdminLoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type StudentTokenPayload struct {
	ID    string `json:"id"`
	NISN  string `json:"nisn"`
	Nama  string `json:"nama"`
	Kelas string `json:"kelas,omitempty"`
	Email string `json:"email,omitempty"`
}

type AdminTokenPayload struct {
	ID         string `json:"id"`
	Nama       string `json:"nama"`
	Email      string `json:"email"`
	FotoProfil string `json:"fotoProfil,omitempty"`
}

type TokenTTL struct {
	Duration time.Duration
}
