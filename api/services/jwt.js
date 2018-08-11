'use strict';

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';
//aqui se envian todos los datos del usuario para ser encriptados
//junto a la fecha en que se creo el token la fecha de exp a 30 dias
exports.createToken = function(user){
  var payload = {
    sub: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30,'days').unix
  };
  //todo se codifica junto a la clave secreta
  return jwt.encode(payload, secret);
};