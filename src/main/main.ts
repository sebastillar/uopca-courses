require("dotenv").config()
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import { AuthService } from "./services/authService"
import { CourseManager } from "./services/courseManager"
import { exitCourseModal, openCourseModal } from "./config/modals"

class MainApp {
  private mainWindow: BrowserWindow | null = null
  private authService: AuthService
  private courseManager: CourseManager

  constructor() {
    this.authService = new AuthService()
    this.courseManager = new CourseManager()
  }

  async init() {
    await app.whenReady()
    this.createMainWindow()
    this.setupIPC()
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "..", "assets", "uopca-logo.png"),
    })

    const indexPath = path.join(__dirname, "..", "renderer", "index.html")
    console.log("Loading index from:", indexPath)

    this.mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Error loading index.html:", err)
    })

    // Abrir DevTools en desarrollo
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.webContents.openDevTools()
    }
  }

  private createCourseWindow(viewFilePath: string, courseId: string) {
    const courseWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      parent: this.mainWindow ?? undefined,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "..", "assets", "uopca-logo.png"),
    })

    this.courseManager.setWindowId(courseId, courseWindow.id)

    const coursePath = path.join(__dirname, "..", viewFilePath)
    console.log("Loading index from:", coursePath)

    courseWindow.loadFile(coursePath).catch((err) => {
      console.error("Error loading index.html:", err)
    })

    // this.changeMainWindow("renderer/courseOpen.html")
    this.mainWindow?.webContents.reload()

    courseWindow.on("close", async (e) => {
      const choice = require("electron").dialog.showMessageBoxSync(
        courseWindow,
        exitCourseModal
      )
      if (choice === 0) {
        e.preventDefault()
      } else {
        await this.courseManager.changeStatus(courseId)
        this.mainWindow?.webContents.reload()
      }
    })
  }

  private openCourseWindow() {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized")
    }
    const choice = require("electron").dialog.showMessageBoxSync(
      this.mainWindow,
      openCourseModal
    )

    if (choice === 1) {
      return false
    } else {
      return true
    }
  }

  private closeCourseWindow(windowId: number) {
    try {
      const windows = BrowserWindow.getAllWindows()
      const courseWindow = windows.find((window) => window.id === windowId)

      if (!courseWindow) {
        return { success: false, error: "Course window not found" }
      }

      // La logica de cerrar la ventana del curso se maneja en el evento close
      courseWindow.close()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private changeMainWindow(viewPath: string): void {
    const viewFilePath = path.join(__dirname, "..", viewPath)
    console.log("Loading template from:", viewFilePath)

    this.mainWindow?.loadFile(viewFilePath).catch((err) => {
      console.error(`Error loading ${viewPath}`, err)
    })
  }

  private setupIPC() {
    // Listar cursos
    ipcMain.handle("course:list", () => {
      try {
        const courses = this.courseManager.getCourses()
        return { success: true, courses }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Obtener contenido del curso
    ipcMain.handle("course:getContent", async (event, courseId) => {
      try {
        const result = await this.courseManager.readCourseContent(courseId)
        return {
          success: !result.error,
          course: result.course,
          error: result.error,
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Escuchar mensajes desde el render process
    ipcMain.handle("course:openContent", (event, course) => {
      try {
        this.createCourseWindow(
          path.join("courses", course.filePath),
          course.id
        )
        return { success: true }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Ir a la vista
    ipcMain.handle("navigation:goToView", (event, viewPath) => {
      try {
        this.changeMainWindow(viewPath)
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Validar acceso al curso
    ipcMain.handle("course:validateAccess", async (event, courseId) => {
      try {
        const allowed = await this.courseManager.canAccessCourse(courseId)
        const result = this.openCourseWindow()
        if (allowed.canAccess && !result) {
          return {
            success: false,
            canAccess: allowed.canAccess,
            reason: "El usuario canceló la visualización",
          }
        }
        return {
          success: result,
          canAccess: allowed.canAccess,
          reason: allowed.reason,
        }
      } catch (error: unknown) {
        return {
          success: false,
          canAccess: false,
          error: "An unknown error occurred",
        }
      }
    })

    // Cambiar estado del curso
    ipcMain.handle("course:changeStatus", async (event, courseId) => {
      await this.courseManager.changeStatus(courseId)
    })

    // Cerrar ventana del curso
    ipcMain.handle("course:closeWindow", async (event, windowId) => {
      return this.closeCourseWindow(windowId)
    })
  }
}

new MainApp().init()
