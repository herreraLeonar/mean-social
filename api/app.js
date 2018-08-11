//fichero para llevar carga de ficheros configuracion y otros
// en este fichero se carga todo del framework express y luego se 
// llama desde
// el index.js
'use strict';
//variable para carga el modulo de express para rutas y http
var express = require('express');
//bodyparser sirve para recibir las peticiones post, etc en objeto JS
var bodyParser = require('body-parser');
//se instancia express en variable app para cargar framework
var app = express();

//cargar rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');

//middlewares

//permite crear middlewares un medio que se ejecuta antes de
//llegar a un controlador 
app.use(bodyParser.urlencoded({extended:false}));
//convierte lo recibido en la peticion a json


//cors


//rutas. reescribir rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api',publication_routes);

app.use(bodyParser.json());


// exportar
module.exports = app;