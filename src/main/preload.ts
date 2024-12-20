import { contextBridge, ipcRenderer } from "electron"
import { Course } from "../shared/types"

interface CourseAPI {
  listCourses: () => Promise<{
    success: boolean
    courses?: Course[]
    error?: string
  }>
  getCourseContent: (courseId: string) => Promise<{
    success: boolean
    content?: string
    error?: string
  }>
  openCourseContent: (courseFilePath: any) => Promise<void>

  validateAccess: (courseId: string) => Promise<{
    success: boolean
    canAccess: boolean
    reason?: string
    error?: string
  }>
}

// Exponer el API
contextBridge.exposeInMainWorld("courseAPI", {
  listCourses: () => ipcRenderer.invoke("course:list"),
  getCourseContent: (courseId: string) =>
    ipcRenderer.invoke("course:getContent", courseId),
  openCourseContent: (courseFilePath: string) =>
    ipcRenderer.invoke("course:openContent", courseFilePath),
  validateAccess: (courseId: string) =>
    ipcRenderer.invoke("course:validateAccess", courseId),
} as CourseAPI)

interface ElectronAPI {
  goToView: (viewPath: string) => void
}

contextBridge.exposeInMainWorld("electronAPI", {
  goToView: (viewPath: string) =>
    ipcRenderer.invoke("navigation:goToView", viewPath),
} as ElectronAPI)

// Declaración global para TypeScript
declare global {
  interface Window {
    courseAPI: CourseAPI
    electronAPI: ElectronAPI
  }
}
