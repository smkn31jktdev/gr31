package inbound_port

type HttpPort interface {
	Middleware() MiddlewareHttpPort
	Ping() PingHttpPort
	Client() ClientHttpPort
	Auth() AuthHttpPort
	Kehadiran() KehadiranHttpPort
	Sekolah() SekolahHttpPort
}
