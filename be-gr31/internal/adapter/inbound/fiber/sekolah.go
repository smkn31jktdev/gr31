package fiber_inbound_adapter

import (
	"prabogo/internal/domain"
	inbound_port "prabogo/internal/port/inbound"
)

type sekolahAdapter struct {
	domain domain.Domain
}

func NewSekolahAdapter(domain domain.Domain) inbound_port.SekolahHttpPort {
	return &sekolahAdapter{domain: domain}
}
