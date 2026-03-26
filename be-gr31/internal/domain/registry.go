package domain

import (
	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/client"
	"prabogo/internal/domain/kehadiran"
	"prabogo/internal/domain/sekolah"
	outbound_port "prabogo/internal/port/outbound"
)

type Domain interface {
	Client() client.ClientDomain
	Auth() auth.AuthDomain
	Kehadiran() kehadiran.KehadiranDomain
	Sekolah() sekolah.SekolahDomain
}

type domain struct {
	databasePort outbound_port.DatabasePort
	messagePort  outbound_port.MessagePort
	cachePort    outbound_port.CachePort
	workflowPort outbound_port.WorkflowPort
}

func NewDomain(
	databasePort outbound_port.DatabasePort,
	messagePort outbound_port.MessagePort,
	cachePort outbound_port.CachePort,
	workflowPort outbound_port.WorkflowPort,
) Domain {
	return &domain{
		databasePort: databasePort,
		messagePort:  messagePort,
		cachePort:    cachePort,
		workflowPort: workflowPort,
	}
}

func (d *domain) Client() client.ClientDomain {
	return client.NewClientDomain(d.databasePort, d.messagePort, d.cachePort, d.workflowPort)
}

func (d *domain) Auth() auth.AuthDomain {
	return auth.NewAuthDomain(d.databasePort)
}

func (d *domain) Kehadiran() kehadiran.KehadiranDomain {
	return kehadiran.NewKehadiranDomain(d.databasePort)
}

func (d *domain) Sekolah() sekolah.SekolahDomain {
	return sekolah.NewSekolahDomain(d.databasePort)
}
