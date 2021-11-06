import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';

const generador = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */
    @repository(PersonaRepository)//con esto se puede acceder a los métodos del repositorio
    public personaRepository: PersonaRepository //atributo publico llamado personaRepository de tipo PersonaRepository
    ) {}

  /*
   * Add service methods here
   */

GenerarClave(){
  let clave = generador(8,false);//por defecto así para claves alfanuméricas (letras-numeros) de 8 caracteres
  return clave;
}

CifrarClave(clave:string){
  let claveCifrada = cryptoJS.MD5(clave).toString(); //método de cifrado en forma de string
  return claveCifrada;
}

IdentificarPersona(usuario: string, clave: string) {
  try {
    let p = this.personaRepository.findOne({where: {correo: usuario, clave: clave}});//se ha agregado un filtro web (como se hacía en .Net en el ciclo3 de misionTIC)
    if (p) {//si existe la persona
      return p;//se retorna a la persona encontrada
    }
    return false;//no encontró nada
  } catch {
    return false;//no encontró nada
  }
}

//JWT: Jason Web Token
GenerarTokenJWT(persona: Persona) {
  let token = jwt.sign({//genera una firma de un token
    data: {
      id: persona.id,
      correo: persona.correo,
      nombre: persona.nombres + " " + persona.apellidos
    }
  },
    Llaves.claveJWT);//aquí se firma con esa llave (única que va a acceder a la info que está justo arriba de esta línea)
  return token;
}

ValidarTokenJWT(token: string) {
  try {
    let datos = jwt.verify(token, Llaves.claveJWT);//verificando el token contra una llave
    return datos;//retornar los datos obtenidos (si en el try no se genera una excepción)
  } catch {
    return false;
  }
}

}
