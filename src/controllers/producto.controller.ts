import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema, Filter, FilterExcludingWhere, repository, Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Producto} from '../models';
import {ProductoRepository} from '../repositories';

//PARA PROTEGER TODO DEBO PONERLE AUTENTICACIÓN A TODA LA CLASE (va antes de la clase y no antes del método)
@authenticate("admin")//AUTENTICACIÓN DEL ADMIN (la estrategia se llama admin) .Para crear un producto la persona debe estar autenticada: token)

export class ProductoController {
  constructor(
    @repository(ProductoRepository)
    public productoRepository : ProductoRepository,
  ) {}

  //aqui solo protego al metodo post(./productos), a los demás no, por ejemplo: get(post(./productos))
  //@authenticate("admin")//AUTENTICACIÓN DEL ADMIN (la estrategia se llama admin) .Para crear un producto la persona debe estar autenticada: token)
  @post('/productos')
  @response(200, {
    description: 'Producto model instance',
    content: {'application/json': {schema: getModelSchemaRef(Producto)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Producto, {
            title: 'NewProducto',
            exclude: ['id'],
          }),
        },
      },
    })
    producto: Omit<Producto, 'id'>,
  ): Promise<Producto> {
    return this.productoRepository.create(producto);
  }

  @authenticate.skip()//con esto hago una excepción de autenticación en el método que sigue (ES DECIR SE PROTEGE TODO EL CONTROLADOR MENOS DICHO MÉTODO)
  @get('/productos/count')
  @response(200, {
    description: 'Producto model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Producto) where?: Where<Producto>,
  ): Promise<Count> {
    return this.productoRepository.count(where);
  }

  @get('/productos')
  @response(200, {
    description: 'Array of Producto model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Producto, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Producto) filter?: Filter<Producto>,
  ): Promise<Producto[]> {
    return this.productoRepository.find(filter);
  }

  @patch('/productos')
  @response(200, {
    description: 'Producto PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Producto, {partial: true}),
        },
      },
    })
    producto: Producto,
    @param.where(Producto) where?: Where<Producto>,
  ): Promise<Count> {
    return this.productoRepository.updateAll(producto, where);
  }

  @get('/productos/{id}')
  @response(200, {
    description: 'Producto model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Producto, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Producto, {exclude: 'where'}) filter?: FilterExcludingWhere<Producto>
  ): Promise<Producto> {
    return this.productoRepository.findById(id, filter);
  }

  @patch('/productos/{id}')
  @response(204, {
    description: 'Producto PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Producto, {partial: true}),
        },
      },
    })
    producto: Producto,
  ): Promise<void> {
    await this.productoRepository.updateById(id, producto);
  }

  @put('/productos/{id}')
  @response(204, {
    description: 'Producto PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() producto: Producto,
  ): Promise<void> {
    await this.productoRepository.replaceById(id, producto);
  }

  @del('/productos/{id}')
  @response(204, {
    description: 'Producto DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.productoRepository.deleteById(id);
  }
}
