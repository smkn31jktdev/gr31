package inbound_port

type SekolahHttpPort interface {
	CreateAdmin(a any) error
	AdminLoadAdminsFromSheet(a any) error
	AdminBulkCreateAdmins(a any) error
	CreateStudent(a any) error
	AdminLoadStudentsFromSheet(a any) error
	AdminBulkCreateStudents(a any) error
	ListAdmins(a any) error
	ListStudents(a any) error

	StudentUpsertKegiatan(a any) error
	StudentUpdateKegiatan(a any) error
	StudentGetKegiatan(a any) error
	StudentDeleteKegiatan(a any) error
	StudentUpsertBukti(a any) error
	StudentGetBukti(a any) error
	AdminGetKegiatan(a any) error
	AdminGetBukti(a any) error
	AdminGetDeleteMonths(a any) error
	AdminDeleteKegiatanByMonth(a any) error

	StudentCreateOrReplyAduan(a any) error
	StudentGetAduan(a any) error
	AdminGetAduan(a any) error
	AdminGetAduanRoom(a any) error
	AdminUpdateAduanStatus(a any) error
	AdminReplyAduan(a any) error
}
