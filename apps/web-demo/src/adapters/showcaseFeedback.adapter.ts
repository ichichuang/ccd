export interface ShowcaseFeedbackAdapter {
  showInfoMessage: (message: string, title?: string) => void
  showSuccessMessage: (message: string, title?: string) => void
  showInfoToast: (position: ToastPosition, summary: string, detail?: string) => void
  showSuccessToast: (position: ToastPosition, summary: string, detail?: string) => void
}

function getFeedbackWindow(): Window {
  return window
}

export const showcaseFeedbackAdapter: ShowcaseFeedbackAdapter = {
  showInfoMessage(message, title) {
    getFeedbackWindow().$message?.info(message, title)
  },
  showSuccessMessage(message, title) {
    getFeedbackWindow().$message?.success(message, title)
  },
  showInfoToast(position, summary, detail) {
    getFeedbackWindow().$toast?.infoIn(position, summary, detail)
  },
  showSuccessToast(position, summary, detail) {
    getFeedbackWindow().$toast?.successIn(position, summary, detail)
  },
}
