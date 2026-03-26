package outbound_port

import "prabogo/internal/model"

type SekolahDatabasePort interface {
	UpsertKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, bool, error)
	UpdateKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, error)
	FindKegiatanByNISNAndTanggal(nisn string, tanggal string) (map[string]any, error)
	DeleteKegiatanByNISNAndTanggal(nisn string, tanggal string, section string) error
	DeleteKegiatanByNISNAndMonth(nisn string, bulan string) (int, error)
	FindKegiatanByFilter(filter model.KegiatanFilter) ([]map[string]any, error)
	FindBuktiByFilter(filter model.BuktiFilter) ([]map[string]any, error)
	UpsertBuktiByNISNAndBulan(student model.Student, bulan string, foto string, linkYouTube string) (map[string]any, error)

	CreateAduan(data model.Aduan) (model.Aduan, error)
	AppendAduanMessage(ticketID string, message model.AduanMessage, updatedAt string) (model.Aduan, error)
	UpdateAduanStatus(ticketID string, status string, diteruskanKe *string, history model.AduanStatusHistory) (model.Aduan, error)
	FindAduanByFilter(filter model.AduanFilter) ([]model.Aduan, error)
	FindAduanByTicketID(ticketID string) (*model.Aduan, error)
	CountAduanByTicketPrefix(prefix string) (int, error)
}
