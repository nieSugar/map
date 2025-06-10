importScripts("signalr.js");
const signalRUrl = "http://139.196.243.9:5286/ImpeDanceHub";
// const signalRUrl = "http://localhost:5000/ImpeDanceHub";
let signalRConnection = new signalR.HubConnectionBuilder()
  .withUrl(signalRUrl, {})
  .configureLogging(signalR.LogLevel.Error)
  .build();

signalRConnection.keepAliveIntervalInMilliseconds = 60000;
signalRConnection.serverTimeoutInMilliseconds = 120000;

async function start() {
  try {
    await signalRConnection.start();
    console.log("连接成功");
  } catch (err) {
    console.error("连接失败", err);
    setTimeout(start, 5000);
  }
}

signalRConnection.onclose(async () => {
  await start();
});

signalRConnection.on("ReceiveMessage", (deviceId, response) => {
  console.log("Worker接收到消息:", { deviceId, response });
  postMessage({
    deviceId: deviceId,
    response: response,
    timestamp: new Date().toISOString()
  });
});

start();
