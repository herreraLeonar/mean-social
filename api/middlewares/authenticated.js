'use strict'
//para crear los token antes de cualquier otra funcion
//se crean los middleware, esto es una funcion que se ejecuta 
//antes que todas
//para utilizarlo lo llamo desde el fichero de rutas
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';

//la req es los datos que recibo, la res es la respuesta que escupo
//y next permite funcionalidad para salta a otra cosa
//en este caso el metodo que estoy llamando cuando entramos al middleware
//mientras no entregemos next el programa no sale del middleware
//cuando ejecutamos el metodo next nodejs entiende que tiene que cargar lo
//siguiente que venga en la ejecucion en este caso el metodo de la ruta
//el token viene en una cabecera
exports.ensureAuth = function(req, res, next){
    //si no tiene authorization por cabecera error
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'la peticion no tiene cabecera de authe'});
    }
    //si llega creo variable token pero sin comillas simples y dobles 
    //de una de las partes o en cualquier parte sustituir por nada
   
    var token = req.headers.authorization.replace(/['"]+/g,'');
    //la siguiente funcioon es muy sensible y se mete en try catch
    try{
        //decodifico el payload que viene con todos los datos del usuario
        var payload = jwt.decode(token, secret);
        //si payload lleva una fecha de expiracion menor o igual a la fecha del momento actual
        //esto lo ebtengo porque ya lo decodificque y este dato viene desde jwt.js
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message:'token ha expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({
                message:'token no valido'
            });
    }
    //adjunto el payload a la req para tener siempre los datos del usuario logueado
    req.user = payload;
    //ejecuto next si todo esta bien
    next();
    
}