import { LogMessage, LogLevel, flattenMessage, FlattenedLogMessage } from './log-message'
import { LogAppender } from './log-appender'

export class ApiLogAppender implements LogAppender {
  public batchSize = 10
  public minimumTimePassedInSec = 60
  public maximumTimePassedInSec = 120
  public threshold: LogLevel

  private msgBuffer: FlattenedLogMessage[] = []
  private lastSent = 0

  constructor(
    public readonly apiEndpoint: string,
    public authToken?: string,
    threshold?: LogLevel
  ) {
    setTimeout(this.checkPost, 1000)
    this.threshold = threshold ?? LogLevel.ALL
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) {
      return
    }

    this.msgBuffer.push(flattenMessage(msg))
  }

  private doPost() {
    if (this.msgBuffer.length > 0 && this.authToken) {
      fetch(this.apiEndpoint, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(this.msgBuffer),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`
        }
      })

      this.lastSent = Date.now()
      this.msgBuffer = []
    }
  }

  private checkPost = () => {
    const now = Date.now()
    const min = this.lastSent + this.minimumTimePassedInSec * 1000
    const max = this.lastSent + this.maximumTimePassedInSec * 1000

    if (
      (this.msgBuffer.length >= this.batchSize && min < now) ||
      (this.msgBuffer.length > 0 && max < now)
    ) {
      this.doPost()
    }
    setTimeout(
      this.checkPost,
      Math.max(10000, this.minimumTimePassedInSec * 1000)
    )
  }
}

export default ApiLogAppender
