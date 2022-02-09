export interface TodoEntity {
  id: number
  subject: string
  body: string
  assigneeId: number
  createDate: number // yyyymmdd
  dueDate: number // yyyymmdd
}
