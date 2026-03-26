package outbound_port

import "prabogo/internal/model"

type KehadiranDatabasePort interface {
	UpsertByNISNAndTanggal(data model.Kehadiran) (model.Kehadiran, bool, error)
	FindByNISNAndTanggal(nisn string, tanggal string) (*model.Kehadiran, error)
	FindByNISNAndDateRange(nisn string, startDate string, endDate string) ([]model.Kehadiran, error)
	FindByFilter(filter model.KehadiranFilter) ([]model.Kehadiran, error)
}
