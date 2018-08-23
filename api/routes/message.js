'use strict'

//fichero express para trabajar con las rutas
var express=require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
//se carga libreria para autenticacion
var md_auth = require('../middlewares/authenticated');

api.get('/probando-md',md_auth.ensureAuth, MessageController.probando);
api.post('/message',md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?',md_auth.ensureAuth, MessageController.getReceivedMessage);
api.get('/messages/:page?',md_auth.ensureAuth, MessageController.getEmmitMessage);
api.get('/unviewed-messages',md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages',md_auth.ensureAuth, MessageController.setViewedMessages);

//exporto las rutas para que sean visibles
module.exports = api;