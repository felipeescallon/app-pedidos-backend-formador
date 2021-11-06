import {Entity, hasMany, model, property} from '@loopback/repository';
import {Pedido} from './pedido.model';

@model()
export class Persona extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombres: string;

  @property({
    type: 'string',
    required: true,
  })
  apellidos: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  celular: string;

  @property({
    type: 'string',
    required: false,//se cambió a false (clave NO obligatoria para hacer la prueba inicial desde el Postman y así no solicita la clave) para cambiar el valor true que estaba por defecto con Loopback (clave obligatoria)
  })
  clave: string;

  @hasMany(() => Pedido)
  pedidos: Pedido[];

  constructor(data?: Partial<Persona>) {
    super(data);
  }
}

export interface PersonaRelations {
  // describe navigational properties here
}

export type PersonaWithRelations = Persona & PersonaRelations;
