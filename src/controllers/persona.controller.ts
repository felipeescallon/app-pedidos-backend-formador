//INTEGRACIÓN DE SERVICIOS:EMAIL,SMS:
import {service} from '@loopback/core/dist/service'; //para servicio de autenticación de loopback
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/llaves';
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {AutenticacionService} from '../services'; //complementando para servicio de autenticación de loopback
const fetch = require("node-fetch");//importamos para acceder a urls externas
//PARA QUE FUNCIONE DEBE TRABAJARSE CON LA VERSIÓN DE node-fetch 2.6.5 y los type de node-fetch, ejecutando en la terminal los comandos:
//npm i node-fetch@2.6.5
//npm i @types/node-fetch
//Pagina de la versión específica: https://www.npmjs.com/package/node-fetch/v/2.6.5

export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,
    @service(AutenticacionService)
    public servicioAutenticacion : AutenticacionService,
  ) {}

  //UTILIZANDO LOS MÉTODOS (cuando una persona los invoque) DE autenticacion.service.ts (identificación de usuarios):
  @post("/identificarPersona", {//ruta específica del post
    responses: {
      '200': {
        description: "Identificación de usuarios"
      }
    }
  })
  async identificarPersona(//lo anterior es recibido por esta función
    @requestBody() credenciales: Credenciales //modelo específico: ojo que no es de tipo Entity(almacenar info persistente con ID) sino de tipo Model (lógica de negocio), creado en loopback (lb4 model) para la estructura de usuario-congtraseña
  ) {
    let p = await this.servicioAutenticacion.IdentificarPersona(credenciales.usuario, credenciales.clave);//identificar persona es una función que opera como Promise (asíóncrona, por eso se debe anteponer el await: espera la respuesta y luego sigue la ejecución)
    if (p) {
      let token = this.servicioAutenticacion.GenerarTokenJWT(p);
      return {
        datos: {
          nombre: p.nombres,
          correo: p.correo,
          id: p.id
        },
        tk: token
      }
    } else {
      throw new HttpErrors[401]("Datos inválidos");//código 401 (usuario NO autorizado)
    }
  }


  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {
    //return this.personaRepository.create(persona);

    let clave = this.servicioAutenticacion.GenerarClave();
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    persona.clave = claveCifrada;//asignada a la persona (en ese campo de la base de datos es ilegible)
    let p = await this.personaRepository.create(persona);

    //NOTIFICAR AL USUARIO:
    let destino = persona.correo;
    let asunto = 'Registro en la plataforma';
    //let contenido = `Hola ${persona.nombres}, su nombre de usuario es: ${persona.correo} y su contraseña es: ${personas.clave}`;
    let contenido = `Hola ${persona.nombres}, su nombre de usuario es: ${persona.correo} y su contraseña es: ${clave}`;////como lo modifiqué, si muestra el texto plano, pero con esto que tenía el profe Jefferson ${persona.clave}` sería para mostrar la clave cifrada que no sirve;//los string templates(``) son usados aquí para dinamizar. Se hace login con el correo
    //fetch(`http://127.0.0.1:5000/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)//el ? se usa para el get. & se usa para agregar más parámetros a la petición
    fetch(`${Llaves.urlServicioNotificaciones}/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
      .then((data: any) => {//any es un tipo genérico de datos en typescript
        console.log(data);//controlando: para darse cuenta que fue enviado o no

      })//.then usado para obtener la respuesta del fetch
    return p;//retorna la persona que fue creada
    //YA CON LO ANTERIOR SE CORRE LA APP (ejecutando npm start en la terminal) y luego probando la funcionalidad con Postman

  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
