package postgres_outbound_adapter

import (
	"database/sql"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

const (
	tableStudent = "students"
	tableAdmin   = "admins"
)

type authAdapter struct {
	db outbound_port.DatabaseExecutor
}

func NewAuthAdapter(db outbound_port.DatabaseExecutor) outbound_port.AuthDatabasePort {
	return &authAdapter{db: db}
}

func (adapter *authAdapter) FindStudentByNISN(nisn string) (model.Student, error) {
	query, _, err := goqu.Dialect("postgres").From(tableStudent).Where(goqu.Ex{"nisn": nisn}).Limit(1).ToSQL()
	if err != nil {
		return model.Student{}, err
	}
	return adapter.scanStudent(query)
}

func (adapter *authAdapter) FindStudentByID(id string) (model.Student, error) {
	query, _, err := goqu.Dialect("postgres").From(tableStudent).Where(goqu.Ex{"id": id}).Limit(1).ToSQL()
	if err != nil {
		return model.Student{}, err
	}
	return adapter.scanStudent(query)
}

func (adapter *authAdapter) SetStudentOnline(id string, isOnline bool) error {
	query, _, err := goqu.Dialect("postgres").Update(tableStudent).Set(goqu.Record{"is_online": isOnline, "updated_at": goqu.L("NOW()")}).Where(goqu.Ex{"id": id}).ToSQL()
	if err != nil {
		return err
	}
	_, err = adapter.db.Exec(query)
	return err
}

func (adapter *authAdapter) FindStudentsByFilter(filter model.StudentFilter) ([]model.Student, error) {
	dataset := goqu.Dialect("postgres").From(tableStudent)
	if filter.NISN != "" {
		dataset = dataset.Where(goqu.Ex{"nisn": filter.NISN})
	}
	if filter.Kelas != "" {
		dataset = dataset.Where(goqu.Ex{"kelas": filter.Kelas})
	}
	if filter.Walas != "" {
		dataset = dataset.Where(goqu.L("LOWER(TRIM(walas)) = LOWER(TRIM(?))", filter.Walas))
	}
	query, _, err := dataset.Order(goqu.I("kelas").Asc(), goqu.I("nama").Asc()).ToSQL()
	if err != nil {
		return nil, err
	}
	rows, err := adapter.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]model.Student, 0)
	for rows.Next() {
		var data model.Student
		if err := rows.Scan(&data.ID, &data.NISN, &data.Nama, &data.Kelas, &data.Walas, &data.Email, &data.Password, &data.IsOnline, &data.CreatedAt, &data.UpdatedAt); err != nil {
			return nil, err
		}
		results = append(results, data)
	}
	return results, nil
}

func (adapter *authAdapter) CreateStudent(student model.Student) (model.Student, error) {
	return model.Student{}, fmt.Errorf("create student is not implemented for postgres adapter")
}

func (adapter *authAdapter) FindAdminByEmail(email string) (model.Admin, error) {
	query, _, err := goqu.Dialect("postgres").From(tableAdmin).Where(goqu.Ex{"email": email}).Limit(1).ToSQL()
	if err != nil {
		return model.Admin{}, err
	}
	return adapter.scanAdmin(query)
}

func (adapter *authAdapter) FindAdminByID(id string) (model.Admin, error) {
	query, _, err := goqu.Dialect("postgres").From(tableAdmin).Where(goqu.Ex{"id": id}).Limit(1).ToSQL()
	if err != nil {
		return model.Admin{}, err
	}
	return adapter.scanAdmin(query)
}

func (adapter *authAdapter) FindAdminsByFilter(filter model.AdminFilter) ([]model.Admin, error) {
	return nil, fmt.Errorf("find admins by filter is not implemented for postgres adapter")
}

func (adapter *authAdapter) CreateAdmin(admin model.Admin) (model.Admin, error) {
	return model.Admin{}, fmt.Errorf("create admin is not implemented for postgres adapter")
}

func (adapter *authAdapter) UpdateAdmin(admin model.Admin) (model.Admin, error) {
	record := goqu.Record{
		"nama":       admin.Nama,
		"email":      admin.Email,
		"updated_at": goqu.L("NOW()"),
	}

	if admin.Password != "" {
		record["password"] = admin.Password
	}

	if admin.FotoProfil != "" {
		record["foto_profil"] = admin.FotoProfil
	}

	query, _, err := goqu.Dialect("postgres").
		Update(tableAdmin).
		Set(record).
		Where(goqu.Ex{"id": admin.ID}).
		ToSQL()

	if err != nil {
		return model.Admin{}, err
	}

	_, err = adapter.db.Exec(query)
	if err != nil {
		return model.Admin{}, err
	}

	return adapter.FindAdminByID(admin.ID)
}

func (adapter *authAdapter) UpdateAdminPhoto(id string, fotoProfil string) (model.Admin, error) {
	query, _, err := goqu.Dialect("postgres").
		Update(tableAdmin).
		Set(goqu.Record{
			"foto_profil": fotoProfil,
			"updated_at":  goqu.L("NOW()"),
		}).
		Where(goqu.Ex{"id": id}).
		ToSQL()
	if err != nil {
		return model.Admin{}, err
	}

	if _, err := adapter.db.Exec(query); err != nil {
		return model.Admin{}, err
	}

	return adapter.FindAdminByID(id)
}

func (adapter *authAdapter) DeleteAdminPhoto(id string) (model.Admin, error) {
	query, _, err := goqu.Dialect("postgres").
		Update(tableAdmin).
		Set(goqu.Record{
			"foto_profil": "",
			"updated_at":  goqu.L("NOW()"),
		}).
		Where(goqu.Ex{"id": id}).
		ToSQL()
	if err != nil {
		return model.Admin{}, err
	}

	if _, err := adapter.db.Exec(query); err != nil {
		return model.Admin{}, err
	}

	return adapter.FindAdminByID(id)
}

func (adapter *authAdapter) scanStudent(query string) (model.Student, error) {
	rows, err := adapter.db.Query(query)
	if err != nil {
		return model.Student{}, err
	}
	defer rows.Close()

	if !rows.Next() {
		return model.Student{}, nil
	}

	var data model.Student
	if err := rows.Scan(&data.ID, &data.NISN, &data.Nama, &data.Kelas, &data.Walas, &data.Email, &data.Password, &data.IsOnline, &data.CreatedAt, &data.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return model.Student{}, nil
		}
		return model.Student{}, err
	}
	return data, nil
}

func (adapter *authAdapter) scanAdmin(query string) (model.Admin, error) {
	rows, err := adapter.db.Query(query)
	if err != nil {
		return model.Admin{}, err
	}
	defer rows.Close()

	if !rows.Next() {
		return model.Admin{}, nil
	}

	var data model.Admin
	if err := rows.Scan(&data.ID, &data.Nama, &data.Email, &data.Password, &data.FotoProfil, &data.Role, &data.CreatedAt, &data.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return model.Admin{}, nil
		}
		return model.Admin{}, err
	}
	return data, nil
}
