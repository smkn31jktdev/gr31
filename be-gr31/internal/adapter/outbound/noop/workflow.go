package noop_outbound_adapter

import (
	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type workflowAdapter struct{}

type clientWorkflowAdapter struct{}

func NewWorkflowAdapter() outbound_port.WorkflowPort {
	return &workflowAdapter{}
}

func (a *workflowAdapter) Client() outbound_port.ClientWorkflowPort {
	return &clientWorkflowAdapter{}
}

func (a *clientWorkflowAdapter) StartUpsert(data model.ClientInput) error {
	return nil
}
