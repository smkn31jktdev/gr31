package inbound_port

type AuthHttpPort interface {
	StudentLogin(a any) error
	StudentMe(a any) error
	AdminLogin(a any) error
	AdminMe(a any) error
	RefreshToken(a any) error
	UpdateAdminSettings(a any) error
	UploadAdminProfilePhoto(a any) error
	DeleteAdminProfilePhoto(a any) error
}
