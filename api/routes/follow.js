'use strict'

//fichero express para trabajar con las rutas
var express=require('express');
var FollowController = require('../controllers/follow');
var api = express.Router();
//se carga libreria para autenticacion
var md_auth = require('../middlewares/authenticated');

api.get('/pruebas-follow',md_auth.ensureAuth, FollowController.prueba);
api.post('/follow',md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id',md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?',md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?',md_auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/get-my-follows/:followed?',md_auth.ensureAuth, FollowController.getMyFollows);

//exporto las rutas para que sean visibles
module.exports = api;