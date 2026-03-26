package mongodb_outbound_adapter

import (
	"fmt"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type clientAdapter struct{}

func NewClientAdapter() outbound_port.ClientDatabasePort {
	return &clientAdapter{}
}

func (adapter *clientAdapter) Upsert(datas []model.ClientInput) error {
	return fmt.Errorf("client upsert is not implemented for mongodb adapter")
}

func (adapter *clientAdapter) FindByFilter(filter model.ClientFilter, lock bool) ([]model.Client, error) {
	return []model.Client{}, nil
}

func (adapter *clientAdapter) DeleteByFilter(filter model.ClientFilter) error {
	return nil
}

func (adapter *clientAdapter) IsExists(bearerKey string) (bool, error) {
	return false, nil
}
