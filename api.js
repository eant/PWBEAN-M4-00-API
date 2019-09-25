/* Modulos */
const express = require("express")
const bodyParser = require("body-parser")
const loki = require("lokijs")

/* Auxiliares */
const server = express()
const port = 2000
const header = { "Content-Type" : "application/json; charset=utf-8" }

let personas = null

const db = new loki("datos.json", {
	autoload : true,
	autosave : true,
	autosaveInterval : 5000,
	autoloadCallback : () => {
		//Obtener la colección "personas" o crear la colección "personas"
		personas = db.getCollection("personas") || db.addCollection("personas")
	}
})


/* Configuraciones */
server.listen( port )
server.use( bodyParser.urlencoded({ extended : false }) )
server.use( bodyParser.json() )

/* Procesos */
server.get("/api", (req, res) => {
	//console.log(personas)

	res.set( header )
	res.json( personas.data )
})

server.post("/api", (req, res) => {

	let persona = req.body

	personas.insert(persona)

	res.set( header )
	res.json({ "rta" : "ok" })
})