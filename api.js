/* Modulos */
const express = require("express")
const bodyParser = require("body-parser")
const loki = require("lokijs")
const joi = require('@hapi/joi')
const hb = require("express-handlebars")

/* Auxiliares */
const server = express()
const port = 80

const schema = joi.object({
	titulo : joi.string().min(3).max(50).required(),
	descripcion : joi.string().max(280).required(),
	estreno : joi.number().integer().min(1895).max( (new Date().getFullYear()) ),
	poster : joi.string().uri(),
	trailer : joi.string().uri()
})

let peliculas = null

const db = new loki("nerdflix.json", {
	autoload : true,
	autosave : true,
	autosaveInterval : 5000,
	autoloadCallback : () => {
		//Obtener la colección "peliculas" o crear la colección "peliculas"
		peliculas = db.getCollection("peliculas") || db.addCollection("peliculas")
	}
})


/* Configuraciones */
server.listen( port )

server.use( bodyParser.urlencoded({ extended : false }) )
server.use( bodyParser.json() )
server.use( express.static("./public") )

server.engine(".hbs", hb({ extname : ".hbs", defaultLayout : "main" }) )

server.set("view engine", ".hbs")

server.set('json spaces', 4)


/* Procesos */
server.get("/panel", (req, res) => {
	res.render("panel", {
		title : "Nerdflix Generator",
		films : peliculas.data
	})
})
server.get("/panel/nueva", (req, res) => {
	res.render("pelicula", { title : "Nueva pelicula" })
})

server.get("/panel/actualizar/:id", (req, res) => {
	let elID = req.params.id

	res.render("pelicula", {
		title : "Actualizar pelicula",
		film : peliculas.get(elID)
	})

})

// ↓ Obtener todas las peliculas...
server.get("/api", (req, res) => {
	res.json( peliculas.data )
})

// ↓ Obtener una sola pelicula x ID...
server.get("/api/:id", (req, res) => {
	let elID = req.params.id

	let laPelicula = peliculas.get(elID) || { error : "pelicula no encontrada" }

	res.json( laPelicula )
})

// ↓ Crear una nueva pelicula...
server.post("/api", (req, res) => {

	let pelicula = req.body

	 let rta = schema.validate( pelicula, { abortEarly : false })

	 if( rta.error ){

	 	let errores = rta.error.details.map(function(error){
	 		let msg = new Object()

	 		msg[error.path[0]] = error.message

	 		return msg 
	 	})

		res.json( { "errores" : errores })
	 } else {
		peliculas.insert(pelicula)
		res.json({ "rta" : "ok" })
	 }

})

// ↓ Actualizar una pelicula por ID...
server.put("/api/:id", (req, res) => {

	let elID = req.params.id
	let laPelicula = peliculas.get(elID)

	let nuevosDatos = req.body

	laPelicula.titulo = nuevosDatos.titulo
	laPelicula.descripcion = nuevosDatos.descripcion
	laPelicula.estreno = nuevosDatos.estreno
	laPelicula.poster = nuevosDatos.poster
	laPelicula.trailer = nuevosDatos.trailer

	peliculas.update(laPelicula)

	res.json({ "pelicula_actualizada" : laPelicula })
})

// ↓ Borrar una pelicula por ID...
server.delete("/api/:id", (req, res) => {
	let elID = req.params.id
	let laPelicula = peliculas.get(elID)

	peliculas.remove( laPelicula )

	res.json({ "pelicula_borrada" : laPelicula })
})