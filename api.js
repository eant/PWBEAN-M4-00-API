const express = require("express")
const bodyParser = require("body-parser")
const server = express()

const port = 2000
const header = { "Content-Type" : "application/json; charset=utf-8" }

server.listen( port )
server.use( bodyParser.urlencoded({ extended : false }) )
server.use( bodyParser.json() )

server.get("/api", (req, res) => {
	res.set( header )
	res.end("Acá voy a devolver datos en formato JSON")
})

server.post("/api", (req, res) => {
	res.set( header )
	res.json( req.body )
})