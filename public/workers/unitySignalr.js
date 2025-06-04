importScripts("signalr.js");
const signalRUrl = "http://139.196.243.9:5286/ImpeDanceHub";
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

signalRConnection.on("ReceiveMessage", (deviceId, min, max, response) => {
  if (deviceId && deviceId.includes('01000000000000000000')) {
    postMessage({ min, max, response });
  }
});

start();
