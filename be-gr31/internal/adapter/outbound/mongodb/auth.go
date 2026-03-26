package mongodb_outbound_adapter

import (
	"fmt"
	"strings"
	"time"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type authAdapter struct {
	s *adapter
}

func NewAuthAdapter(s *adapter) outbound_port.AuthDatabasePort {
	return &authAdapter{s: s}
}

func (a *authAdapter) FindStudentByNISN(nisn string) (model.Student, error) {
	doc, err := a.findOneByFilter("akun_siswa", map[string]any{"nisn": nisn})
	if err != nil {
		return model.Student{}, err
	}
	return toStudent(doc), nil
}

func (a *authAdapter) FindStudentByID(id string) (model.Student, error) {
	doc, err := a.findOneByFilter("akun_siswa", map[string]any{"id": id})
	if err != nil {
		return model.Student{}, err
	}
	return toStudent(doc), nil
}

func (a *authAdapter) SetStudentOnline(id string, isOnline bool) error {
	_, err := a.s.runCommand("akun_siswa", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"id": id},
			"update": map[string]any{"$set": map[string]any{"isOnline": isOnline, "updatedAt": map[string]any{"$date": time.Now().UnixMilli()}}},
		},
	})
	return err
}

func (a *authAdapter) FindStudentsByFilter(filter model.StudentFilter) ([]model.Student, error) {
	where := map[string]any{}
	if filter.NISN != "" {
		where["nisn"] = filter.NISN
	}
	if filter.Kelas != "" {
		where["kelas"] = filter.Kelas
	}
	if filter.Walas != "" {
		where["walas"] = filter.Walas
	}

	var out []model.Student
	var pageState string
	seenPageStates := map[string]struct{}{}

	for {
		options := map[string]any{"limit": 1000}
		if pageState != "" {
			options["pageState"] = pageState
		}

		res, err := a.s.runCommand("akun_siswa", map[string]any{
			"find": map[string]any{
				"filter":  where,
				"options": options,
			},
		})
		if err != nil {
			return nil, err
		}

		raw := listFrom(res, "data", "documents")
		for _, item := range raw {
			doc, ok := item.(map[string]any)
			if !ok {
				continue
			}
			out = append(out, toStudent(doc))
		}

		dataMap, ok := res["data"].(map[string]any)
		if !ok {
			break
		}
		nextState, ok := dataMap["nextPageState"].(string)
		if !ok || nextState == "" {
			break
		}
		if nextState == pageState {
			break
		}
		if _, exists := seenPageStates[nextState]; exists {
			break
		}
		seenPageStates[nextState] = struct{}{}
		pageState = nextState
	}

	return out, nil
}

func (a *authAdapter) CreateStudent(student model.Student) (model.Student, error) {
	_, err := a.s.runCommand("akun_siswa", map[string]any{
		"insertOne": map[string]any{
			"document": map[string]any{
				"id":        student.ID,
				"nisn":      student.NISN,
				"nama":      student.Nama,
				"kelas":     student.Kelas,
				"walas":     student.Walas,
				"email":     student.Email,
				"password":  student.Password,
				"isOnline":  student.IsOnline,
				"createdAt": map[string]any{"$date": student.CreatedAt.UnixMilli()},
				"updatedAt": map[string]any{"$date": student.UpdatedAt.UnixMilli()},
			},
		},
	})
	if err != nil {
		return model.Student{}, err
	}
	return student, nil
}

func (a *authAdapter) FindAdminByEmail(email string) (model.Admin, error) {
	doc, err := a.findOneByFilter("akun_admin", map[string]any{"email": email})
	if err != nil {
		return model.Admin{}, err
	}
	return toAdmin(doc), nil
}

func (a *authAdapter) FindAdminByID(id string) (model.Admin, error) {
	doc, err := a.findOneByFilter("akun_admin", map[string]any{"id": id})
	if err != nil {
		return model.Admin{}, err
	}
	return toAdmin(doc), nil
}

func (a *authAdapter) FindAdminsByFilter(filter model.AdminFilter) ([]model.Admin, error) {
	where := map[string]any{}
	if filter.Email != "" {
		where["email"] = strings.ToLower(filter.Email)
	}
	if filter.Role != "" {
		where["role"] = filter.Role
	}

	var out []model.Admin
	var pageState string
	seenPageStates := map[string]struct{}{}

	for {
		options := map[string]any{"limit": 1000}
		if pageState != "" {
			options["pageState"] = pageState
		}

		res, err := a.s.runCommand("akun_admin", map[string]any{
			"find": map[string]any{
				"filter":  where,
				"options": options,
			},
		})
		if err != nil {
			return nil, err
		}

		raw := listFrom(res, "data", "documents")
		for _, item := range raw {
			doc, ok := item.(map[string]any)
			if !ok {
				continue
			}
			out = append(out, toAdmin(doc))
		}

		dataMap, ok := res["data"].(map[string]any)
		if !ok {
			break
		}
		nextState, ok := dataMap["nextPageState"].(string)
		if !ok || nextState == "" {
			break
		}
		if nextState == pageState {
			break
		}
		if _, exists := seenPageStates[nextState]; exists {
			break
		}
		seenPageStates[nextState] = struct{}{}
		pageState = nextState
	}

	return out, nil
}

func (a *authAdapter) CreateAdmin(admin model.Admin) (model.Admin, error) {
	_, err := a.s.runCommand("akun_admin", map[string]any{
		"insertOne": map[string]any{
			"document": map[string]any{
				"id":         admin.ID,
				"nama":       admin.Nama,
				"email":      strings.ToLower(admin.Email),
				"password":   admin.Password,
				"fotoProfil": admin.FotoProfil,
				"role":       admin.Role,
				"createdAt":  map[string]any{"$date": admin.CreatedAt.UnixMilli()},
				"updatedAt":  map[string]any{"$date": admin.UpdatedAt.UnixMilli()},
			},
		},
	})
	if err != nil {
		return model.Admin{}, err
	}
	return admin, nil
}

func (a *authAdapter) findOneByFilter(collection string, filter map[string]any) (map[string]any, error) {
	res, err := a.s.runCommand(collection, map[string]any{"findOne": map[string]any{"filter": filter}})
	if err != nil {
		return nil, err
	}
	doc := mapFrom(res, "data", "document")
	if doc == nil {
		return nil, nil
	}
	return doc, nil
}

func toStudent(doc map[string]any) model.Student {
	if doc == nil {
		return model.Student{}
	}
	return model.Student{
		ID:        asString(doc["id"]),
		NISN:      asString(doc["nisn"]),
		Nama:      asString(doc["nama"]),
		Kelas:     asString(doc["kelas"]),
		Walas:     asString(doc["walas"]),
		Email:     asString(doc["email"]),
		Password:  asString(doc["password"]),
		IsOnline:  asBool(doc["isOnline"]),
		CreatedAt: parseDate(doc["createdAt"]),
		UpdatedAt: parseDate(doc["updatedAt"]),
	}
}

func toAdmin(doc map[string]any) model.Admin {
	if doc == nil {
		return model.Admin{}
	}
	return model.Admin{
		ID:         asString(doc["id"]),
		Nama:       asString(doc["nama"]),
		Email:      asString(doc["email"]),
		Password:   asString(doc["password"]),
		FotoProfil: asString(doc["fotoProfil"]),
		Role:       asString(doc["role"]),
		CreatedAt:  parseDate(doc["createdAt"]),
		UpdatedAt:  parseDate(doc["updatedAt"]),
	}
}

var _ = fmt.Sprintf

func (a *authAdapter) UpdateAdmin(admin model.Admin) (model.Admin, error) {
	updateDoc := map[string]any{
		"nama":      admin.Nama,
		"email":     strings.ToLower(admin.Email),
		"updatedAt": map[string]any{"$date": time.Now().UnixMilli()},
	}

	if admin.Password != "" {
		updateDoc["password"] = admin.Password
	}

	if admin.FotoProfil != "" {
		updateDoc["fotoProfil"] = admin.FotoProfil
	}

	_, err := a.s.runCommand("akun_admin", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"id": admin.ID},
			"update": map[string]any{"$set": updateDoc},
		},
	})
	if err != nil {
		return model.Admin{}, err
	}

	return a.FindAdminByID(admin.ID)
}

func (a *authAdapter) UpdateAdminPhoto(id string, fotoProfil string) (model.Admin, error) {
	_, err := a.s.runCommand("akun_admin", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"id": id},
			"update": map[string]any{"$set": map[string]any{
				"fotoProfil": fotoProfil,
				"updatedAt":  map[string]any{"$date": time.Now().UnixMilli()},
			}},
		},
	})
	if err != nil {
		return model.Admin{}, err
	}

	return a.FindAdminByID(id)
}

func (a *authAdapter) DeleteAdminPhoto(id string) (model.Admin, error) {
	_, err := a.s.runCommand("akun_admin", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"id": id},
			"update": map[string]any{"$set": map[string]any{
				"fotoProfil": "",
				"updatedAt":  map[string]any{"$date": time.Now().UnixMilli()},
			}},
		},
	})
	if err != nil {
		return model.Admin{}, err
	}

	return a.FindAdminByID(id)
}
