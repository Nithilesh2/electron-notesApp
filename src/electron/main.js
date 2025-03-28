/* eslint-disable no-undef */
import { app, BrowserWindow, dialog, Menu } from "electron"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { ipcMain } from "electron"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = process.env.NODE_ENV === "development"

let currentFilePath = null

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "My Notes",
    icon: path.join(app.getAppPath(), "src/assets", "notesappIcon.png"),
    minWidth: 500,
    minHeight: 400,
    frame: true,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    opacity: 0.95,
  })

  Menu.setApplicationMenu(null)

  isDev
    ? win.loadURL("http://localhost:5173/")
    : win.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"))

  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(win, {
              title: "Open File",
              buttonLabel: "Open",
              properties: ["openFile"],
              filters: [
                { name: "Text Files", extensions: ["txt", "md", "json", "js"] },
              ],
            })

            if (filePaths.length > 0) {
              currentFilePath = filePaths[0]
              fs.readFile(currentFilePath, "utf8", (err, data) => {
                if (err) {
                  console.error("open file:", err)
                  return
                }
                win.webContents.send("file-opened", {
                  filePath: currentFilePath,
                  content: data,
                })
              })
            }
          },
        },
        {
          label: "New File",
          accelerator: "CmdOrCtrl+N",
          click: async () => {
            const { filePath } = await dialog.showSaveDialog(win, {
              title: "Create New File",
              buttonLabel: "Create",
              filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
            })

            if (filePath) {
              fs.writeFile(filePath, "", "utf8", (err) => {
                if (err) {
                  console.error("new file: ", err)
                  return
                }

                currentFilePath = filePath
                win.webContents.send("create-new-file", {
                  filePath: currentFilePath,
                  content: "",
                })
              })
            }
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: async () => {
            if (currentFilePath) {
              win.webContents.send("save-this-file", {
                filePath: currentFilePath,
              })
            } else {
              const { filePath } = await dialog.showSaveDialog(win, {
                title: "Save File",
                buttonLabel: "Save",
                filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
              })

              if (filePath) {
                currentFilePath = filePath
                win.webContents.send("save-this-file", {
                  filePath: currentFilePath,
                })
              } else {
                console.log("User cancelled save operation.")
              }
            }
          },
        },
      ],
    },
    {
      label: "Edit",
      history: true,
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          role: "undo",
        },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Y",
          role: "redo",
        },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          role: "reload",
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          role: "cut",
        },
        {
          lable: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy",
        },
        {
          label: "Delete",
          accelerator: "CmdOrCtrl+Backspace",
          role: "delete",
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          role: "selectall",
        },
      ],
    },
    {
      label: "Exit",
      role: "quit",
      accelerator: "Ctrl+W",
    },
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

ipcMain.on("save-file-content", (event, { filePath, content }) => {
  if (!filePath) {
    console.error("No file path provided for saving.")
    return
  }

  fs.writeFile(filePath, content, "utf8", (err) => {
    if (err) {
      console.error("Error saving file:", err)
      return
    }
    console.log("File saved successfully:", filePath)
  })
})
