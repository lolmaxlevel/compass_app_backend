var webSocketServer = new (require('ws')).Server({port: 9000}),
    webSockets = {} // userID: webSocket

connections = {}
console.log("server started on :9000")

webSocketServer.on('connection', function connection(webSocket, req) {
	console.log("new user")
    webSocket.on('message', function(message) {
		let request = JSON.parse(message)
		console.log('new request: ' + request['type'])
		if (request['type'].toLowerCase() === 'handshake'){
			console.log("handshake with " + request['id'])
			webSockets[request['id']] = webSocket
		}
		if (request['type'].toLowerCase() === 'compass'){
			if (request['status'] === 'start'){
				connections[request['partnerId']] = request['id']
				console.log(`new connection with ${request['partnerId']} : ${request['id']}`)
			}
		}
		if (request['type'].toLowerCase() === 'location'){
			console.log("got location:" + request['id'])
			if (connections[request['id']] !== undefined && webSockets[connections[request['id']]] !== undefined){
				webSockets[connections[request['id']]].send(JSON.stringify(request))
			}
		}
    })

    webSocket.on('close', function () {
        console.log('deleted')
    })
})