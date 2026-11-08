import * as signalR from "@microsoft/signalr";

let connection = null;

export const startSignalRConnection = async (userId, role, onNotificationReceived) => {
  if (!userId) return null;

  // Əgər artıq aktiv əlaqə varsa və işləyirsə, sadəcə qulaq as
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    if (onNotificationReceived) {
      connection.off("ReceiveNotification");
      connection.on("ReceiveNotification", onNotificationReceived);
    }
    return connection;
  }

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "https://localhost:7108/api";
  const hubUrl = baseUrl.replace(/\/api\/?$/, "") + "/hubs/notifications";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token || "",
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.None)
    .build();

  if (onNotificationReceived) {
    connection.on("ReceiveNotification", (notification) => {
      onNotificationReceived(notification);
    });
  }

  try {
    await connection.start();
    // Qruplara dərhal qoşul
    await connection.invoke("RegisterConnection", userId, role || "User");
  } catch (err) {
    console.warn("[SignalR] Qoşulma xətası:", err);
  }

  return connection;
};

export const stopSignalRConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
    } catch {}
    connection = null;
  }
};
