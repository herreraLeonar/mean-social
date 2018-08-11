'use strict'

var path=require('path');
var fs=require('fs');
var moment=require('moment');
var mongoosePaginate=require('mongoose-pagination');

var Publication=require('../models/publication');
var User=require('../models/user');
var Follow=require('../models/follow');

function probando(req,res){
    res.status(200).send({message:"hola desde el controlador de publicaciones"});
}

//dar de alta nuevas publicaciones
function savePublication(req,res){
    var params=req.body;
    
    if(!params.text) return res.status(200).send({message: 'debes enviar un texto!!'});
    
    var publication=new Publication();
    publication.text=params.text;
    publication.file='null';
    publication.user=req.user.sub;
    publication.create_at=moment().unix();
    
    publication.save((err,publicationStored)=>{
        if(err) return res.status(500).send({message: 'error al guardar'});
        
        if(!publicationStored) return res.status(404).send({message: 'la publicacion no se guardo'});
        
        return res.status(200).send({publication: publicationStored});
    })
}


//obtener una publication por id
function getPublication(req,res){
    var publicationId=req.params.id;
    
    Publication.findById(publicationId,(err,publication)=>{
       if(err) return res.status(500).send({message: "retorno error"});
       
       if(!publication) return res.status(404).send({message:"no existe la publicacion"});
       
       return res.status(200).send({publication});
    });
}

//eliminar publication
function deletePublication(req,res){
    var publicationId=req.params.id;
    //aqui compruebo que el usuario logueado es el usuario que creo la publicacion
    Publication.find({user: req.user.sub,'_id':publicationId}).remove((err,publicationRemove)=>{
        if(err) if(err) return res.status(500).send({message: "retorno error"});
       // if(!publicationRemove) return res.status(404).send({message:"no se borro la publicacion"});
        return res.status(200).send({message: "publicacion eliminada exitosamente"});
    });
    
    /*la siguiente funcion borra pero no comprueba que el que borro sea el creador, por eso se cambio
     Publication.findByIdAndRemove(publicationId,(err,publicationRemove)=>{
        if(err) if(err) return res.status(500).send({message: "retorno error"});
        if(!publicationRemove) return res.status(404).send({message:"no se borro la publicacion"});
        return res.status(200).send({publication: publicationRemove});
    })
     */
}
//busco todos los usuarios que sigo, los meto en un array, y luego con "$in" busco si esos usuarios tienen publicaciones y las devuelvo
function getPublications(req,res){
    var page=1;
    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage = 4;
    
    //con el populate sustituyo el id del usuario por el objeto completo. Osea hago un join
    Follow.find({'user':req.user.sub}).populate('followed').exec((err,follows)=>{
        if(err) return res.status(500).send({message:'erro al devolver el seguimiento'});
        
        var follows_clean=[];
        
        follows.forEach((follow)=>{
            follows_clean.push(follow.followed);
        });
        
        //busco los usuarios que estan dentro del array del follows_clean 
        //para buscar dentro de un array utilizo el operador $in
        //sin coincide alguna publication con el user indicado lo saca
        //sort ordeno la publication por fecha
        Publication.find({user:{"$in":follows_clean}}).sort('-create_at').populate('user').paginate(page,itemsPerPage,(err,publications,total)=>{
            if(err) return res.status(500).send({message:'erro al devolver publicaciones'});
            
            if(!publications) return res.status(404).send({message: 'no hay publicaciones'});
            
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page:page,
                publications
            });
        });
        
    });
}
//metodo para subir imagenes a las publicaciones
function uploadImage(req,res){
    var publicationId = req.params.id;
    
    if(req.files){
        var file_path = req.files.image.path;
        //array con el nombre de cada uno de los segmentos de la ruta se corta con split y la barraa invertida
        var file_split = file_path.split('\\');
        //selecciono el nombre del archivo en la posicion 2 upload\users\nombre_archivo.jpg 0 1 2
        var file_name = file_split[2];
        //sacar extension del archivo por el punto
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        
        if(file_ext=='png' || file_ext=='jpg' || file_ext=='jpeg' || file_ext=='gif'){
            //actualizo documento de usuario logueado
            Publication.findByIdAndUpdate(publicationId, {image: file_name }, {new:true}, (err,publicationUpdated) =>{
                if (err) return res.status(500).send({message: 'error en peticion'});
        
                if(!publicationUpdated) return res.status(404).send({message: 'no se ha podido actualizar la imagen'});
                //devuelve el objeto antes de actualizar
                return res.status(200).send({user: publicationUpdated});
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
    var path_file = './uploads/publications/'+image_file;
    
    fs.exists(path_file, (exists) =>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe imagen'});
        }
    });
}

module.exports={
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
};