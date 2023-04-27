var webSocketServer = new (require('ws')).Server({port: 9000}),
    webSockets = {} // userID: webSocket

// CONNECT /:userID
// wscat -c ws://localhost:5000/1
console.log("server started on :9000")
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(results)
webSocketServer.on('connection', function connection(webSocket, req) {
    webSocket.upgradeReq = req;
    var userID = parseInt(webSocket.upgradeReq.url.slice(1,webSocket.upgradeReq.url.size), 10)
    webSockets[userID] = webSocket
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(webSockets))

    // Forward Message
    //
    // Receive               Example
    // [toUserID, text]      [2, "Hello, World!"]
    //
    // Send                  Example
    // [fromUserID, text]    [1, "Hello, World!"]
    webSocket.on('message', function(message) {
        console.log('received from ' + userID + ': ' + message)
        var request = JSON.parse(message)
        var toUserWebSocket = webSockets[request['partner_id']]
        if (toUserWebSocket) {
            console.log('sent to ' + request['partner_id'])
            toUserWebSocket.send(JSON.stringify(message))
        }
    })

    webSocket.on('close', function () {
        delete webSockets[userID]
        console.log('deleted: ' + userID)
    })
})