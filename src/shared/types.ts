export interface CourseFile {
  id: string
  path: string
  type: "html" | "pdf"
}

export interface Course {
  id: string
  title: string
  description: string
  filePath: string
  maxAccess: number
  expirationDate: string
  accessCount: number
  open: boolean
  windowId?: number
}

export interface CourseAPI {
  listCourses: () => Promise<{
    success: boolean
    courses?: Course[]
    error?: string
  }>
  getCourseContent: (courseId: string) => Promise<{
    success: boolean
    course: Course
    error?: string
  }>
  openCourseContent: (course: Course) => Promise<{
    windowId: number
  }>

  validateAccess: (courseId: string) => Promise<{
    success: boolean
    canAccess: boolean
    reason?: string
    error?: string
  }>

  changeStatus: (courseId: string) => Promise<void>

  closeCourseWindow: (
    windowId: number,
    courseId: string
  ) => Promise<{
    success: boolean
    error?: string
  }>
}

export interface ElectronAPI {
  goToView: (viewPath: string) => void
}

export interface StoreSchema {
  courses: Course[]
}
