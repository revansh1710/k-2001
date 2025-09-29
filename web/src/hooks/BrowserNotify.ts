export async function browserNotify(title: string, options?: NotificationOptions) {
  try {
    if (!("Notification" in window)) return false;

    // If permission undetermined, request it once
    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return false;
    }

    if (Notification.permission === "granted") {
      new Notification(title, options);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
