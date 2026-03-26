package inbound_port

type MiddlewareHttpPort interface {
	InternalAuth(a any) error
	ClientAuth(a any) error
	StudentAuth(a any) error
	AdminAuth(a any) error
}
