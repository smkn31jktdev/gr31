package migrations

import (
	"context"
	"database/sql"

	"github.com/pressly/goose/v3"
)

func init() {
	goose.AddMigrationContext(upStudentAdmin, downStudentAdmin)
}

func upStudentAdmin(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.Exec(`CREATE TABLE IF NOT EXISTS students (
		id VARCHAR(64) PRIMARY KEY,
		nisn VARCHAR(64) UNIQUE NOT NULL,
		nama VARCHAR(255) NOT NULL,
		kelas VARCHAR(64) NOT NULL,
		walas VARCHAR(255) NOT NULL,
		email VARCHAR(255) DEFAULT '',
		password VARCHAR(255) NOT NULL,
		is_online BOOLEAN DEFAULT FALSE NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
	);`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`CREATE TABLE IF NOT EXISTS admins (
		id VARCHAR(64) PRIMARY KEY,
		nama VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		foto_profil TEXT DEFAULT '',
		role VARCHAR(32) DEFAULT 'admin' NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
	);`)
	if err != nil {
		return err
	}
	return nil
}

func downStudentAdmin(ctx context.Context, tx *sql.Tx) error {
	if _, err := tx.Exec(`DROP TABLE IF EXISTS admins;`); err != nil {
		return err
	}
	if _, err := tx.Exec(`DROP TABLE IF EXISTS students;`); err != nil {
		return err
	}
	return nil
}
