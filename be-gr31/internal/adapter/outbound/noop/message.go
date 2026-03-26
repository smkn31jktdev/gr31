package noop_outbound_adapter

import (
	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type messageAdapter struct{}

type clientMessageAdapter struct{}

func NewMessageAdapter() outbound_port.MessagePort {
	return &messageAdapter{}
}

func (a *messageAdapter) Client() outbound_port.ClientMessagePort {
	return &clientMessageAdapter{}
}

func (a *clientMessageAdapter) PublishUpsert(datas []model.ClientInput) error {
	return nil
}
