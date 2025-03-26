/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react"
import styles from "./App.module.css"
import "papercss/dist/paper.min.css"

const App = () => {
  const [fileContent, setFileContent] = useState("")
  const [filePath, setFilePath] = useState(null)

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.on("file-opened", (data) => {
        setFilePath(data.filePath)
        setFileContent(data.content)
      })

      window.electron.ipcRenderer.on("save-this-file", ({ filePath }) => {
        console.log(filePath)
        if (filePath) {
          setFilePath(filePath)
          handleSave(filePath)
        }
      })

      window.electron.ipcRenderer.on("create-new-file", (data) => {
        setFilePath(data.filePath)
        setFileContent(data.content)
      })

      return () => {
        window.electron.ipcRenderer.removeAllListeners("file-opened")
        window.electron.ipcRenderer.removeAllListeners("save-this-file")
        window.electron.ipcRenderer.removeAllListeners("create-new-file")
      }
    }
  }, [filePath, fileContent])

  const handleSave = (filePath) => {
    if (filePath) {
      window.electron.ipcRenderer.send("save-file-content", {
        filePath,
        content: fileContent,
      })
    } else {
      console.error("No file opened yet!")
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          <h5>{filePath}</h5>
        </div>
        <div className={styles.right}>
          <textarea
            className={styles.textArea}
            value={fileContent}
            onChange={(eve) => setFileContent(eve.target.value)}
          />
        </div>
      </div>
    </>
  )
}

export default App
