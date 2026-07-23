import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export async function notifySessionCompleted(
  title: string,
  body: string,
): Promise<void> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }

    if (granted) {
      sendNotification({ title, body });
    }
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[notification] failed to send:", err);
    }
  }
}
