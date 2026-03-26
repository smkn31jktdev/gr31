package migrations

import (
	"context"
	"database/sql"

	"github.com/pressly/goose/v3"
)

func init() {
	goose.AddMigrationContext(upKehadiran, downKehadiran)
}

func upKehadiran(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.Exec(`CREATE TABLE IF NOT EXISTS kehadiran (
		id SERIAL PRIMARY KEY,
		nisn VARCHAR(64) NOT NULL,
		nama VARCHAR(255) NOT NULL,
		kelas VARCHAR(64) NOT NULL,
		tanggal VARCHAR(10) NOT NULL,
		hari VARCHAR(16) NOT NULL,
		status VARCHAR(32) NOT NULL,
		waktu_absen VARCHAR(8) NOT NULL,
		alasan_tidak_hadir TEXT DEFAULT '',
		koordinat_lat DOUBLE PRECISION,
		koordinat_lng DOUBLE PRECISION,
		jarak DOUBLE PRECISION,
		akurasi DOUBLE PRECISION,
		verified_at TIMESTAMP,
		updated_by VARCHAR(32) DEFAULT 'student',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		UNIQUE (nisn, tanggal)
	);`)
	if err != nil {
		return err
	}
	return nil
}

func downKehadiran(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.Exec(`DROP TABLE IF EXISTS kehadiran;`)
	if err != nil {
		return err
	}
	return nil
}
