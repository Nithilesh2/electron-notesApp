import React from "react"
import styles from "./Frame.module.css"
import logo from "../../assets/notesappIcon.png"

const Frame = () => {
  const close = () => {
    if (window.electron?.windowControls) {
      window.electron.windowControls.close();
    } else {
      console.error("Electron is not available.");
    }
  };
  
  const minimize = () => {
    if (window.electron?.windowControls) {
      window.electron.windowControls.minimize();
    }
  };
  
  const maximize = () => {
    if (window.electron?.windowControls) {
      window.electron.windowControls.maximize();
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          <img
            src={logo}
            alt="appIcon"
            className={styles.appIcon}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.minimize} onClick={minimize}>
            -
          </div>
          <div className={styles.maximize} onClick={maximize}>
            []
          </div>
          <div className={styles.close} onClick={close}>
            X
          </div>
        </div>
      </div>
    </>
  )
}

export default Frame
