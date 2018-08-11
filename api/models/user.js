'use strict'

//los modelos seran creados de la forma de mongoose
//por eso para los modelos se carga mongoose
var mongoose = require("mongoose");
//schema permite definir nuevos schemas
var Schema =   mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
});
//para que funcione se debe exportar. La palabra User mongoose la toma la pluraliza
//la pone en minuscula paras saber la tabla donde se guardara el modelo
module.exports = mongoose.model('User',UserSchema);