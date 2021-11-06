//namespace: para tener info confodencial dentro de un mismo archivo que se va a reutilizar desde diferentes servicios o controladores
export namespace Llaves {
  export const claveJWT = 'JWT@2022*';//clave "fuerte" (alphanum + caracteres especiales)
  export const urlServicioNotificaciones = 'http://localhost:5000';//para que esa url (que entrega el servicio de notificaciones de Flask-Python) sea utilizada desde otra parte
}
