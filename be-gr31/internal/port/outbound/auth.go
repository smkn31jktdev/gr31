package outbound_port

import "prabogo/internal/model"

type AuthDatabasePort interface {
	FindStudentByNISN(nisn string) (model.Student, error)
	FindStudentByID(id string) (model.Student, error)
	SetStudentOnline(id string, isOnline bool) error
	FindStudentsByFilter(filter model.StudentFilter) ([]model.Student, error)
	CreateStudent(student model.Student) (model.Student, error)
	FindAdminByEmail(email string) (model.Admin, error)
	FindAdminByID(id string) (model.Admin, error)
	FindAdminsByFilter(filter model.AdminFilter) ([]model.Admin, error)
	CreateAdmin(admin model.Admin) (model.Admin, error)
	UpdateAdmin(admin model.Admin) (model.Admin, error)
	UpdateAdminPhoto(id string, fotoProfil string) (model.Admin, error)
	DeleteAdminPhoto(id string) (model.Admin, error)
}
