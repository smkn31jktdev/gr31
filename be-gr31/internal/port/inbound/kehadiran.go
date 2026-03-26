package inbound_port

type KehadiranHttpPort interface {
	StudentUpsert(a any) error
	StudentGet(a any) error
	AdminGet(a any) error
}
