//ESTRATEGIA PARA IDENTIFICAR UN USUARIO ADMINISTRADOR (usuario válido que se puede autorizar)
//SIRVE PARA TRABAJAR CON ROLES (aquí se simula el del admin)
import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {AutenticacionService} from '../services';

export class EstrategiaAdministrador implements AuthenticationStrategy {
  name: string = 'admin'; //se puede extender para una persona, vendedor o X role que se tengan dentro del sistema

  constructor(//aquí se inyectan servicios/repositorios...
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) {

  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token) {
      let datos = this.servicioAutenticacion.ValidarTokenJWT(token);
      if (datos) {
        //if(datos.data.role)//SIRVE PARA EL DESARROLLO DEL PROYECTO: habría que validar PARA TRABJAR CON MAS ROLES (si se hubiere asignado en autenticacion.service.ts (habría que incluir el rol en validarToken también) y con admin.strategy.ts se podría manejar para más roles aparte del admin)
        //En este caso como no tenemos roles, entonces se definbe un perfil de usuario:
        let perfil: UserProfile = Object.assign({
          nombre: datos.data.nombre //debe corresponder a lo que se tiene en autenticacion.service.ts
        });
        return perfil;
      } else {
        throw new HttpErrors[401]("El token incluido no es válido.")
      }
    } else {
      throw new HttpErrors[401]("No se ha incluido un token en la solicitud.")
    }
  }
}
