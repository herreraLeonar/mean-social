'use strict'

var mongoosePaginate = require('mongoose-pagination');

//se cargan los modelos
var User = require('../models/user');
var Follow = require('../models/follow');

function prueba(req,res){
    res.status(200).send({message: "follow"});
}

//funcion seguir un usuario
function saveFollow(req,res){
    //recoger los valores recibidos
    var params=req.body;
    var follow = new Follow();
    //en la propiedad user del objeto req tengo a la hora de hacer autenticacion todo un objeto con datos de usuario en authenticated.js payload
    follow.user = req.user.sub;
    follow.followed = params.followed;
    
    follow.save((err, followStored) =>{
        if(err) return res.status(500).send({message: 'error al guardar el seguimiento'});
        
        if(!followStored) return res.status(404).send({message: "el seguimiento no se guardo"});
        
        return res.status(200).send({follow:followStored});
    });
}

//dejar de seguir
function deleteFollow(req,res){
    //recojo el usuario en uso
    var userId = req.user.sub;
    //recojo el usuario a dejar de seguir
    var followId = req.params.id;
    
    //elimino los usuarios que tengan como user el userId y como followed el followId
    Follow.find({'user':userId,'followed':followId}).remove(err =>{
        if(err) return res.status(500).send({message: 'error al borrar el registro'});
        
        return res.status(200).send({message: 'el follow se elimino'});
    });
}

//listado de usuarios
function getFollowingUsers(req,res){
    //recojo el usuario logueado
    var userId=req.user.sub;
    //compruebo si nos llega parametro url el usuario, en caso de que llegue es prioritario en el caso de que no llegue usamos el usuario identificado
    //si no existe el usuario en la url toma el ususario por el token si no tiene paginacion u usuario la url el dato de users el url por get no es obligatorio en esta funcion
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    //compruebo si llega la pagina, para la paginacion a seleccionar
    var page =1;
    if(req.params.page){
        page=req.params.page;
    }else{//si no existe el dato de usuario en la url toma la paginacion
        page=req.params.id;
    }
    //4 usuarios por pagina
    var itemsPerPage = 4;
    //buscar todos los follow cuyo user sea userID. el path se relaciona con la tabla de coleccion de usuarios y 
    //se sustituye por followed
    Follow.find({user:userId}).populate({path:'followed'}).paginate(page,itemsPerPage,(err,follows,total)=>{
        if(err) return res.status(500).send({message: 'error en servidor'});
        
        if(!follows) return res.status(404).send({message:'no esta siguiendo a ningun usuario'});
        
        return res.status(200).send({
            total:total,
            //con Math y ceil hago un redondeo de las paginas y obtengo pages
            pages:Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

//listar los usuarios que nos siguen
function getFollowedUsers(req,res){
    //recojo el usuario logueado
    var userId=req.user.sub;
    //compruebo si nos llega parametro url el usuario, en caso de que llegue es prioritario en el caso de que no llegue usamos el usuario identificado
    //si no existe el usuario en la url toma el ususario por el token si no tiene paginacion u usuario la url el dato de users el url por get no es obligatorio en esta funcion
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    //compruebo si llega la pagina, para la paginacion a seleccionar
    var page =1;
    if(req.params.page){
        page=req.params.page;
    }else{//si no existe el dato de usuario en la url toma la paginacion
        page=req.params.id;
    }
    //4 usuarios por pagina
    var itemsPerPage = 4;
    //buscar todos los follow cuyo followed sea userID. 
    //para user me trae los datos de la tabla user del usuario que me sigue
    Follow.find({followed:userId}).populate('user').paginate(page,itemsPerPage,(err,follows,total)=>{
        if(err) return res.status(500).send({message: 'error en servidor'});
        
        if(!follows) return res.status(404).send({message:'no te sigue ningun usuario'});
        
        return res.status(200).send({
            total:total,
            //con Math y ceil hago un redondeo de las paginas y obtengo pages
            pages:Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

//listado de usuarios sin paginar
//devolver usuarios que sigo, o que me siguen
function getMyFollows(req,res){
    var userId=req.user.sub;
    //si no recibo followed obtengo los usuarios que sigo
    var find = Follow.find({user:userId});
    
    //si recibo el parametro followed me obtinene los usuarios que me estan siguiendo
    if(req.params.followed) {
        find = Follow.find({followed:userId});
    }
            
    find.populate('user followed').exec((err,follows)=>{
       if(err) return res.status(500).send({message: 'error en el servidor'});
       
       if(!Follow) return res.status(404).send({message: 'no sigues ningun usuario'});
       return res.status(200).send({
          follows
       });
    });
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
};