'use strict';

var mongoose = require('mongoose');
//se carga el app.js 
var app = require('./app');
var port = 3800;

//conexion a la DATABASE
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/new-mean')
        .then(()=>{
            console.log("DB se conecto correctamente");
            //crear servidor
            app.listen(port, (err) => {
                if(err) return err;
                console.log("el servidor corriendo en http://localhost:3800 correctamente");
            });
        })
        .catch(err => console.log(err));



