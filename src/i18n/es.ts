import merge from 'lodash.merge';

import en from './en.js';

const overrides = {

  config: {

    continue: 'Continuar %s',
    needed: 'Necesitarás tu nombre de usuario, contraseña y el ID/secreto de cliente de %s',
    support: 'Para ayuda y soporte, visita %s',
    thankYou: 'Gracias por instalar Homebridge Flume',
	
    description: {
      clientSecret: 'Puedes encontrar tu identificacion y secreto de cliente de Flume en https://portal.flumetech.com',
      disableDeviceLogging: 'Si es verdadero, los cambios de estado del accesorio no se registrarán',
      excludeDevices: 'Busca "Agregando nuevo dispositivo: [ID del dispositivo]" en los registros',
      refreshInterval: 'Número de minutos entre solicitudes a Flume para información de fugas',
      units: 'Unidades de volumen para usar en características personalizadas',
      useNotifications: 'Si es verdadero, una alerta de uso no leída se considerará una fuga',
      verbose: 'Habilitar registro de depuración adicional',
    },
	
    enumNames: {
      gallons: 'Galones',
      liters: 'Litros',
      cubicFeet: 'Pies cúbicos',
      cubicMeters: 'Metros cúbicos',
    },

    title: {
      clientId: 'ID de cliente',
      clientSecret: 'Secreto de cliente',
      deviceId: 'ID del dispositivo',
      disableDeviceLogging: 'Deshabilitar registro del dispositivo',
      excludeDevices: 'Excluir dispositivos',
      password: 'Contraseña de Flume',
      refreshInterval: 'Intervalo de actualización',
      units: 'Unidades',
      useNotifications: 'Usar notificaciones de uso no leídas',
      username: 'Usuario de Flume',
      verbose: 'Registro detallado',
    },
  },
  
  customChar: {
    lastMonth: 'Mes pasado',
    monthUsage: 'Este mes',
    todayUsage: 'Hoy',
  },
  
  errors: {
    badConfig: 'Faltan una o más variables requeridas en la configuración. Por favor, revise la documentación.',
    httpRetry: 'Solicitud fallida. Reintentando en %s minutos…',
    noDataReceived: 'No se recibieron datos de la solicitud HTTP',
    noDevices: 'No se encontraron dispositivos en tu cuenta',
    noRefreshToken: 'No se ha recuperado el token de actualización. Realizando autenticación completa…',
  },
  
  general: {
    brand: 'Flume',
    redacted: '****redacted****',
  },
  
  startup: {
    complete: '✓ Configuración completa.',
    newDevice: 'Agregando nuevo dispositivo:',
    removeDevice: 'Eliminando dispositivo:',
    restoringDevice: 'Restaurando dispositivo:',
    welcome: [
      'Por favor, ★ este plugin en GitHub si te resulta útil: https://github.com/mpatfield/homebridge-flume',
      '¿Te gustaría patrocinar este plugin? https://github.com/sponsors/mpatfield',
      'Por favor, califícanos en HOOBS: https://plugins.hoobs.org/plugin/homebridge-flume',
      '¿Quieres ver este plugin en tu idioma? Visita https://github.com/mpatfield/homebridge-flume/issues/107',
    ],
  },
  
  status: {
    batteryLow: 'La batería está baja',
    batteryNormal: 'La batería está normal',
    connectionFault: 'No se detectó conexión',
    connectionNormal: 'Conexión restaurada',
    leakDetected: '¡Fuga detectada!',
    leakNotDetected: 'No se detectaron fugas',
  },
};

const es = merge({}, en, overrides);

export default es;