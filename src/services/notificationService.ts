/**
 * Notification stub — designed so a real Windows notification plugin
 * can be plugged in later without changing Pomodoro call sites.
 */
export async function notifySessionCompleted(
  title: string,
  body: string,
): Promise<void> {
  if (typeof console !== "undefined") {
    console.info(`[notification] ${title}: ${body}`);
  }
}
