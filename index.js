var webSocketServer = new (require('ws')).Server({port: 9000}),
    webSockets = {} // userID: webSocket
const express = require('express');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
  
console.log("server started on :9000")

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