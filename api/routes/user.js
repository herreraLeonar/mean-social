'use strict'
//los ficheros de rutas se deben cargar en app.js
//fichero express para trabajar con las rutas
var express=require('express');
//cargo el controlador correspondiente
var UserController=require('../controllers/user');

var api = express.Router();
//cargo el middleware que antepone a la ejecucion y hasta no ejecutar next de la funcion
//el no pasa a la siguiente funcion de la url
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.get('/home', UserController.home);

//aqui le cargo el md_auth.ensureAuth para que valide primero luego pase al metodo
api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
//se usa md_auth.ensureAuth para comprobar si esta autenticado o logeado correctamente
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
//page? nro de paginas es opcional
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
//metodo put para actualizar. en un servicio restful se utiliza put
//conteo de cuantos sigo, cuantos me siguen y cuantos post tengo
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
// para actualizar, para guardar post, para listar get
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.post('/get-image-user/:imageFile', md_auth.ensureAuth, UserController.getImageFile);


//exporto las rutas para que sean visibles
module.exports = api;