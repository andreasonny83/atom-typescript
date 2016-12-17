import * as dom from "jsx-render-dom"
import {dirname} from "path"
import {
  getFilePathRelativeToAtomProject,
  openFile,
} from "../atomUtils"

export class StatusPanel extends HTMLElement {

  private pendingContainer: HTMLElement
  private pendingCounter: HTMLElement
  private pendingSpinner: HTMLElement
  private configPathContainer: HTMLElement
  private version: HTMLElement

  private configPath: string
  private pendingRequests: string[]
  private pendingTimeout: any

  createdCallback() {
    const nodes = [
      <div ref={ el => this.version = el } className="inline-block" />,
      <a ref={ el => this.pendingContainer = el }
        className="inline-block"
        href=""
        onClick={ evt => {
          evt.preventDefault()
          this.showPendingRequests()
        }}>
        <span ref={ span => this.pendingCounter = span }></span>
        <span ref={ span => this.pendingSpinner = span }
          className="loading loading-spinner-tiny inline-block"
          style={{marginLeft: "5px", opacity: 0.5, verticalAlign: "sub"}}>
        </span>
      </a>,
      <a ref={ el => this.configPathContainer = el }
        className="inline-block"
        href=""
        onClick={ evt => {
          evt.preventDefault()
          this.openConfigPath()
        }}/>
    ]

    for (const node of nodes) {
      this.appendChild(node)
    }

    this.setVersion(null)
    this.setPending([], true)
    this.setTsConfigPath(null)
  }

  attachedCallback() {
    console.log("attached")
  }

  attributeChangedCallback() {
    console.log("attrs changed", arguments)
  }

  dispose() {
    this.remove()
  }

  openConfigPath() {
    if (this.configPath && !this.configPath.startsWith("/dev/null")) {
      openFile(this.configPath)
    } else {
      atom.notifications.addInfo("No tsconfig for current file")
    }
  }

  setTsConfigPath(configPath: string) {
    this.configPath = configPath

    if (configPath) {
      this.configPathContainer.textContent = configPath.startsWith("/dev/null") ? "No project" :
        dirname(getFilePathRelativeToAtomProject(configPath))

      this.configPathContainer.classList.remove("hide")
    } else {
      this.configPathContainer.classList.add("hide")
    }
  }

  setVersion(version: string) {
    if (version) {
      this.version.textContent = version
      this.version.classList.remove("hide")
    } else {
      this.version.classList.add("hide")
    }
  }

  private _setPending(pending: string[]) {
    this.pendingRequests = pending

    if (pending.length) {
      this.pendingContainer.classList.remove("hide")
      this.pendingCounter.textContent = pending.length.toString()
    } else {
      this.pendingContainer.classList.add("hide")
    }
  }

  setPending(pending: string[], immediate = false) {
    const timeout = immediate ? 0 : 100
    clearTimeout(this.pendingTimeout)
    this.pendingTimeout = setTimeout(() => this._setPending(pending), timeout)
  }

  showPendingRequests() {
    if (this.pendingRequests) {
      atom.notifications.addInfo("Pending Requests: <br/> - " + this.pendingRequests.join("<br/> - "))
    }
  }

  show() {
    this.style.display = "block"
  }

  hide() {
    this.style.display = "none"
  }

  static create() {
    return document.createElement("ts-status-panel") as StatusPanel
  }
}

(document as any).registerElement('ts-status-panel', StatusPanel)