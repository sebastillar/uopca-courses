import { contextBridge, ipcRenderer } from "electron"
import { Course, CourseAPI, ElectronAPI } from "../shared/types"

// Exponer el API
contextBridge.exposeInMainWorld("courseAPI", {
  listCourses: () => ipcRenderer.invoke("course:list"),
  getCourseContent: (courseId: string) =>
    ipcRenderer.invoke("course:getContent", courseId),
  openCourseContent: (course: Course) =>
    ipcRenderer.invoke("course:openContent", course),
  validateAccess: (courseId: string) =>
    ipcRenderer.invoke("course:validateAccess", courseId),
  changeStatus: (courseId: string) =>
    ipcRenderer.invoke("course:changeStatus", courseId),
  closeCourseWindow: (windowId: number) =>
    ipcRenderer.invoke("course:closeWindow", windowId),
} as CourseAPI)

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
