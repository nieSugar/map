importScripts('signalr.js');
const signalRUrl = 'http://192.168.12.134:5262/ImpeDanceHub';
let signalRConnection = new signalR.HubConnectionBuilder()
    .withUrl(signalRUrl, {})
    .configureLogging(signalR.LogLevel.Error)
    .build();

signalRConnection.keepAliveIntervalInMilliseconds = 60000;
signalRConnection.serverTimeoutInMilliseconds = 120000;
// signalRConnection.onclose(async () => {
//     await start();
// })
signalRConnection.start().then(() => {
    console.log('连接成功')
}).catch(() => {
    console.log('连接失败')
});

signalRConnection.on("ReceiveMessage", (deviceId, min, max, response) => {
    // console.log({deviceId, min, max, response})
    if (deviceId === 1) {
        postMessage({min, max, response});
    }
});

// start().then(() => {
//     signalRConnection.invoke('subScribe', '1');
//     signalRConnection.stream('receive').subscribe({
//         next: (item) => {
//             postMessage(item);
//         },
//         complete: () => {
//             console.log('complete');
//         },
//         error: (err) => {
//             console.log(err, 'err');
//         },
//     });
// })

// onmessage = function (e) {
//     const {method, body} = e.data;
//     signalRConnection.invoke('PublishAsync', '1', method, body)
// }
//
// async function start() {
//     try {
//         await signalRConnection.start();
//         console.log("SignalR Connected.");
//     } catch (err) {
//         console.error(err);
//         setTimeout(start, 5000);
//     }
// }

// signalRConnection.send('')

