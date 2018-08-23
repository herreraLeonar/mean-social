'use strict'
//para crear los token antes de cualquier otra funcion
//se crean los middlework, esto es una funcion que se ejecuta antes que todas
         
//modelo del usuarios
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
//modulo de encriptacion
var bcrypt = require("bcrypt-nodejs");
//autenticacion basada en token servicio creado con datos de usuario
var jwt = require('../services/jwt');
//paginacion
var mongoosePaginate = require('mongoose-pagination');

//libreria para subir archivos fs
var fs=require('fs');
//libreria path para ruta con sistema de ficheros
var path=require('path');


//metodo de prueba
function home(req, res) {
    res.status(200).send({
        message: "acciones en el servidor de node"
    });
}

//metodo de prueba
function pruebas (req, res) {
    console.log(req);
    res.status(200).send({
        message: "acciones pruebas en el servidor de node"
    });
}

//registro
function saveUser(req,res){
    var params = req.body;
    var user = new User();
    
    if(params.name && params.surname && params.nick && params.email && 
       params.password){
       //instancion el objeto user con los datos
        user.name= params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email= params.email;
        user.role = "ROLE_USER";
        user.image =null;
        
        //controlar usuarios duplicados
        //find busca todos. findOne busca el primero uno solo
        //se utiliza or y un array con condiciones para evaluar conjuntos
        //busque cualquier de esos dos datos en la BD la funcion findOne
        User.findOne({$or: [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {//exe para ejecutar el calba
        if (err) return res.status(500).send({message: "error en peticion de usuarios"})
        if (users && users.length >= 1){
            return res.status(200).send({message:"este usuario ya existe"})
        }else{
   //si en el user.findOne no hizo return haga cifrado de password
            bcrypt.hash(params.password,null, null, (err, hash) =>{
                user.password = hash;
                //metodo de mongoose para guardar userStored es nombre opcional
               user.save((err, userStored)=>{
//clausulas de guarda, se hace un if si se cumple entrega la respuesta
//no es necesario if anidados o else
                   if(err) return res.status(500).send({message: "error al guardar el usuario"});
//si nos llega un objeto userstored devuelvo el objeto user
                   if(userStored){
                       res.status(200).send({user: userStored});
                   }else{
                       //si el userstored no llega devuelve 404
                       res.status(404).send({message: "no se ha registrado el usuario"});
                   }
               });
            });
        }
    });

        
    }
    else{
        res.status(200).send({
            message: "rellena todos los campos"
        });
    }
}

//login
function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    
    User.findOne({email:email},(err,user)=>{
        if(err) return res.status(500).send({
            message: "error en la peticion"});
        
        if(user){
            bcrypt.compare(password, user.password, (err, check) =>{
                if(check){
                    //devolver datos usuario. el usuario envia el token
                    if(params.gettoken){
                        //generar y devolver token
                        return res.status(200).send({
                            //llamo al servicio jwt createToken
//para crear los token antes de cualquier otra funcion
//se crean los middlework, esto es una funcion que se ejecuta antes que todas
                            
                            token: jwt.createToken(user)
                        });
                    }else{
                        //devolver datos de usuario 
                        user.password= undefined;//elimino la pass a enviar
                        return res.status(200).send({user});
                    }
                    
                }else{
                    return res.status(404).send({
                        message: "el usuario no se pudo identificar"});
                }
            });
        }else{
            return res.status(404).send({
                message: "el usuario no se pudo loguear"});
        }
    });
}

// conseguir datos de un usuario
function getUser(req, res){
    //datos por url utilizamos params cuando post o put utilizamos body
    var userId = req.params.id;
    
    User.findById(userId, (err, user) =>{
        if(err) return res.status(500).send({message: 'error en la peticion'});
        
        if (!user) return res.status(404).send({message: 'usuario no existe'});
        //el metodo then lo uso cuando tengo promesas. debo esperar a que se ejecute la funcion async para continuar
        followThisUser(req.user.sub, userId).then( (value)=>{
            user.password=undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}

//function asincrona
//al utilizar async devuelve una promesa, por lo cual tengo un metodo then cuando llame a la funciton
async function followThisUser(identity_user_id, user_id){

    var following = await Follow.findOne({"user":identity_user_id,"followed":user_id});
    
    var followed = await Follow.findOne({"user":user_id,"followed":identity_user_id});
    return{
        following: following,
        followed: followed
    }
}

//devolver un listado de usuarios paginados, al
function getUsers(req,res){
    //lo proximo se hace  para recoger id usuario en la autorizacion
    // bindeamos propieda user a la request con el objeto completo
    //  del usuario que 
    //envia peticion
    //la propiedad sub esta en el services lo monta dentro del
    // payload cuando se hizo la autorizacion se vindeo una propiedad 
    // user a la req el objeto del usuario que se decodifico del token
    var identity_user_id = req.user.sub;
    
    var page = 1;
    if(req.params.page){
        var page = req.params.page;
    }
    
    //usuarios por paginas, a partir de 5 se crea una nueva pagina
    var itemsPerPage = 5;
    //sort ordena por _id, aqui le envio a la funcion un posible error,
    //la lista de usuarios que obtuve y que va a ir entregando
    //y un total que seria un count que hace el paginate para sacar el total 
    //de registros en la tabla
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
        if(err) return res.status(500).send({
            message: 'error en la peticion'});
        
        if(!users) return res.status(404).send({
            message: 'no hay usuarios disponibles'
        });
        
        //una promesa tiene el metodo then
            followUserIds(identity_user_id).then((value)=>{
                    return res.status(200).send({
                    users,
                    users_following: value.following,
                    users_follow_me: value.followed,
                    total,
                    pages: Math.ceil(total/itemsPerPage)
                });
            });
        });
        //para devolver si no quiero colocar por ejemplo users:users
        //nodejs entiende que si lleva el mismo nombre no es necesario esto
}

//funcion asincrona para

async function followUserIds(user_id){//en select desactivo los campos que no quiero que me lleguen
    
    var following = await Follow.find({"user": user_id}).select({'_id':0,'__v':0,'user':0});
    
    var followed = await Follow.find({"followed": user_id}).select({'_id':0,'__v':0,'followed':0});
    
    //procesar following ids
    var following_clean=[];
    following.forEach((follow)=>{
        following_clean.push(follow.followed);
    });
    
    //procesar followed ids
    var followed_clean=[];
    followed.forEach((follow)=>{
        followed_clean.push(follow.user);
    });
    
    return{
        following:following_clean,
        followed:followed_clean
    };
}

//contador de cuanta gente nos sigue, cuantas personas nos siguen y cuantas publicaciones tenemos
function getCounters(req,res){
    var userId= req.user.sub;
    if(req.params.id){
        userId=req.params.id;
    }
    getCountFollow(userId).then((value)=>{
        return res.status(200).send({
            following: value.following,
            followed: value.followed
        }); 
    });
}

async function getCountFollow(user_id){
    var following= await Follow.count({'user':user_id});
    
    var followed = await Follow.count({'followed':user_id});

    var publications = await Publication.count({'user':user_id});
    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

//actualizar edicion de datos de usuario
function updateUser(req, res){
    //recojo el id del usuario a actualizar
    var userId = req.params.id;
    //con el body recoje los datos del usuario a actualizar
    //body porque viene por metodo post o put
    var update = req.body;
    console.log(update);
    //borrar la propiedad password para actualizar en otra funct
    delete update.password;
    
    //verificacion del usuario si no es el id correcto retorna
    if(userId != req.user.sub){
        return res.status(500).send({
        message: 'no tiene permisos de actualizacion'});
    }
   //la funcion findByIdAndUpdate de mongoose permite actulizar un id 
    // en  parametro {new:true}=> (esto es un json que permite diferentes 
    // opciones )
    // se pasan las opciones para que 
    // devuelva el objeto actualizado y no el original, si no se 
    // coloca devuelve el obejto sin atualizar
    //update son los datos que se van actualizar
    User.findByIdAndUpdate(userId, update, {new:true}, 
    //la function de calba obtiene un posible error o un usuario actualizado
    (err, userUpdated) =>{
        if (err) return res.status(500).send({
            message: 'error en peticion'});
        
        if(!userUpdated) return res.status(404).send({
            message: 'no se ha podido actualizar el usuario'});
        //devuelve el objeto antes de actualizar
        return res.status(200).send({
            user: userUpdated});
    });
}

//subir archivos de imagen /avatade usuario
function uploadImage(req,res){
    
    var userId = req.params.id;
    
    if(req.files){
        var file_path = req.files.image.path;
        //array con el nombre de cada uno de los segmentos de la ruta se corta con split y la barraa invertida
        var file_split = file_path.split('\\');
        //selecciono el nombre del archivo en la posicion 2 upload\users\nombre_archivo.jpg 0 1 2
        var file_name = file_split[2];
        //sacar extension del archivo por el punto
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        
        //verificacion del usuario si no es el id correcto retorna
        if(userId !== req.user.sub){
            return removerElArchivoCargado(res,file_path,'no tiene permisos de actualizacion');
        }
        if(file_ext=='png' || file_ext=='jpg' || file_ext=='jpeg' || file_ext=='gif'){
            //actualizo documento de usuario logueado
            User.findByIdAndUpdate(userId, {image: file_name }, {new:true}, (err,userUpdated) =>{
                if (err) return res.status(500).send({message: 'error en peticion'});
        
                if(!userUpdated) return res.status(404).send({message: 'no se ha podido actualizar el usuario'});
                //devuelve el objeto antes de actualizar
                return res.status(200).send({user: userUpdated});
            });
        }else{
            return removerElArchivoCargado(res,file_path,'extension no valida');
        }
    }else{
        return res.status(200).send({message: 'no se han subido archivos'});
    }
}

function removerElArchivoCargado(res, file_path, message){
    fs.unlink(file_path, (err) =>{
                   return res.status(200).send({message: message});
            });
 }
        
//devolver imagen de usuario
function getImageFile(req,res){
    //campo enviado por url image_file
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/'+image_file;
    
    fs.exists(path_file, (exists) =>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe imagen'});
        }
    });
}

//exportacion de las funciones como ruta para MVC
module.exports ={
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
};