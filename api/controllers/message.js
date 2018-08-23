'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando (req, res){
    res.status(200).send({message: "hola que tal"});
}

function saveMessage(req,res){
    var params = req.body;
    if(!params.text || !params.receiver) return res.status(200).send({message: "envia los datos necesarios"});
    

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = "false";

    message.save((err, messageStored)=>{
        if(err) return res.status(500).send({message: "error en la peticion"});
        if(!messageStored) return res.status(404).send({message: "error no existe"});

        return res.status(200).send({messageStored});
    });
    

}

function getReceivedMessage(req, res){
    var userId = req.user.sub;

    var page = 1;

    if(req.params.page)
        page = req.params.page;

    var itemsPerPage = 4;
    //despues del populate de emitter puedo decirle que campos quiero mostrar
    Message.find({receiver: userId}).populate('emitter', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total)=>{
        
        if(err) return res.status(500).send({message: "error en la peticion"});
        if(!messages) return res.status(404).send({message: "no hay messages"});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getEmmitMessage(req, res){
    var userId = req.user.sub;

    var page = 1;

    if(req.params.page)
        page = req.params.page;

    var itemsPerPage = 4;
    //despues del populate de emitter puedo decirle que campos quiero mostrar
    Message.find({emitter: userId}).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total)=>{
        
        if(err) return res.status(500).send({message: "error en la peticion"});
        if(!messages) return res.status(404).send({message: "no hay messages"});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getUnviewedMessages(req, res){
    var userId = req.user.sub;

    Message.count({receiver:userId, viewed:'false'}).exec((err, count)=>{
        if(err) return res.status(500).send({message: "error en la peticion"});
        return res.status(200).send({
            'unviewed': count
        });
    });
}
function setViewedMessages(req,res){
    var userId = req.user.sub;

    Message.update({receiver:userId, viewed:'false'}, {viewed:'true'},{"multi":true}, (err, messageUpdated)=>{
        if(err) return res.status(500).send({message: "error en la peticion"});
        if(!messageUpdated) return res.status(404).send({message: "no se han podido actualizar"});
        
        return res.status(200).send({message: messageUpdated});
    });
}

module.exports ={
    probando,
    saveMessage,
    getReceivedMessage,
    getEmmitMessage,
    getUnviewedMessages,
    setViewedMessages
}