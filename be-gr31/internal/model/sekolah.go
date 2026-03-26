package model

import "time"

type AdminFilter struct {
	Email string
	Role  string
}

type CreateAdminInput struct {
	Nama     string `json:"nama"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type CreateStudentInput struct {
	NISN     string `json:"nisn"`
	Nama     string `json:"nama"`
	Kelas    string `json:"kelas"`
	Walas    string `json:"walas"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type KegiatanInput struct {
	Tanggal string         `json:"tanggal"`
	Section string         `json:"section"`
	Data    map[string]any `json:"data"`
}

type KegiatanFilter struct {
	NISN    string
	Kelas   string
	Tanggal string
	Dari    string
	Sampai  string
}

type BuktiFilter struct {
	NISN  string
	Kelas string
	Bulan string
}

type AduanInput struct {
	TicketID string `json:"ticketId"`
	Message  string `json:"message"`
}

type AduanFilter struct {
	TicketID     string
	NISN         string
	Kelas        string
	Status       string
	Walas        string
	DiteruskanKe string
	Limit        int
}

type AdminAduanMeta struct {
	AdminNama    string
	IsSuperAdmin bool
	IsGuruWali   bool
}

type AduanMessage struct {
	ID        string `json:"id"`
	From      string `json:"from"`
	Role      string `json:"role"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

type AduanStatusHistory struct {
	Status    string `json:"status"`
	UpdatedBy string `json:"updatedBy"`
	Role      string `json:"role"`
	UpdatedAt string `json:"updatedAt"`
	Note      string `json:"note,omitempty"`
}

type Aduan struct {
	TicketID       string               `json:"ticketId"`
	NISN           string               `json:"nisn"`
	NamaSiswa      string               `json:"namaSiswa"`
	Kelas          string               `json:"kelas"`
	Walas          string               `json:"walas,omitempty"`
	Messages       []AduanMessage       `json:"messages"`
	Status         string               `json:"status"`
	StatusHistory  []AduanStatusHistory `json:"statusHistory"`
	DiteruskanKe   *string              `json:"diteruskanKe,omitempty"`
	CreatedAt      string               `json:"createdAt"`
	UpdatedAt      string               `json:"updatedAt"`
	LastActivityAt time.Time            `json:"-"`
}
