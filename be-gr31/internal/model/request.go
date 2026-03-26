package model

type UpdateAdminSettingsInput struct {
	Name            string  `json:"name"`
	NewEmail        *string `json:"newEmail,omitempty"`
	CurrentPassword *string `json:"currentPassword,omitempty"`
	NewPassword     *string `json:"newPassword,omitempty"`
}
