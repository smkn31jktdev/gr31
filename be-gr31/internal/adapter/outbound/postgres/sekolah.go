package postgres_outbound_adapter

import (
	"fmt"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type sekolahAdapter struct {
	db outbound_port.DatabaseExecutor
}

func NewSekolahAdapter(db outbound_port.DatabaseExecutor) outbound_port.SekolahDatabasePort {
	return &sekolahAdapter{db: db}
}

func (a *sekolahAdapter) UpsertKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, bool, error) {
	return nil, false, fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) UpdateKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, error) {
	return nil, fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) FindKegiatanByNISNAndTanggal(nisn string, tanggal string) (map[string]any, error) {
	return nil, fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) DeleteKegiatanByNISNAndTanggal(nisn string, tanggal string, section string) error {
	return fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) DeleteKegiatanByNISNAndMonth(nisn string, bulan string) (int, error) {
	return 0, fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) FindKegiatanByFilter(filter model.KegiatanFilter) ([]map[string]any, error) {
	return nil, fmt.Errorf("kegiatan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) FindBuktiByFilter(filter model.BuktiFilter) ([]map[string]any, error) {
	return nil, fmt.Errorf("bukti is not implemented for postgres adapter")
}

func (a *sekolahAdapter) UpsertBuktiByNISNAndBulan(student model.Student, bulan string, foto string, linkYouTube string) (map[string]any, error) {
	return nil, fmt.Errorf("bukti is not implemented for postgres adapter")
}

func (a *sekolahAdapter) CreateAduan(data model.Aduan) (model.Aduan, error) {
	return model.Aduan{}, fmt.Errorf("aduan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) AppendAduanMessage(ticketID string, message model.AduanMessage, updatedAt string) (model.Aduan, error) {
	return model.Aduan{}, fmt.Errorf("aduan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) UpdateAduanStatus(ticketID string, status string, diteruskanKe *string, history model.AduanStatusHistory) (model.Aduan, error) {
	return model.Aduan{}, fmt.Errorf("aduan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) FindAduanByFilter(filter model.AduanFilter) ([]model.Aduan, error) {
	return nil, fmt.Errorf("aduan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) FindAduanByTicketID(ticketID string) (*model.Aduan, error) {
	return nil, fmt.Errorf("aduan is not implemented for postgres adapter")
}

func (a *sekolahAdapter) CountAduanByTicketPrefix(prefix string) (int, error) {
	return 0, fmt.Errorf("aduan is not implemented for postgres adapter")
}
