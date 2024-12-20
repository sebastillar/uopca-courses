require("dotenv").config()
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import { AuthService } from "./services/authService"
import { CourseManager } from "./services/courseManager"

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

  private createCourseWindow(viewFilePath: string) {
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

    const indexPath = path.join(__dirname, "..", viewFilePath)
    console.log("Loading index from:", indexPath)

    courseWindow.loadFile(indexPath).catch((err) => {
      console.error("Error loading index.html:", err)
    })

    this.changeMainWindow("renderer/courseOpen.html")

    courseWindow.on("close", (e) => {
      const choice = require("electron").dialog.showMessageBoxSync(
        courseWindow,
        {
          type: "question",
          buttons: ["Mantenerse en el curso", "Salir del curso"],
          defaultId: 0,
          title: "Salir del curso",
          message: "¿Deseas salir del curso actual?",
          detail: "Si sales del curso se terminará esta visualización",
          icon: path.join(__dirname, "..", "assets", "uopca-logo.png"),
        }
      )
      if (choice === 0) {
        e.preventDefault()
      } else {
        this.changeMainWindow("renderer/index.html")
      }
    })
  }

  private openCourseWindow(viewFilePath: string) {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized")
    }
    const choice = require("electron").dialog.showMessageBoxSync(
      this.mainWindow,
      {
        type: "question",
        buttons: ["Continuar", "Cancelar"],
        defaultId: 0,
        title: "Abrir curso",
        message: "Consumir una visualización",
        detail: "Al abrir un curso se consumirá una visualización",
        icon: path.join(__dirname, "..", "assets", "uopca-logo.png"),
      }
    )

    if (choice === 1) {
      return false
    } else {
      return true
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
          content: result.content,
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
    ipcMain.handle("course:openContent", (event, courseFilePath) => {
      try {
        this.createCourseWindow(path.join("courses", courseFilePath))
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
        const result = this.openCourseWindow(courseId)
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
  }
}

new MainApp().init()
