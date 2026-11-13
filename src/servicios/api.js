import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const CLAVE_SESION = 'sautex_sesion';
const PUERTO = 8080;

// Si la detección automática no funciona (por ejemplo, con Expo en modo túnel),
// escribe aquí la IP de tu PC. Ejemplo: '192.168.1.25'
const IP_MANUAL = '';

// Busca la IP de la PC donde está corriendo el backend.
// En el emulador suele ser 10.0.2.2 y en el celular es la IP de la red local.
function obtenerHost() {
  if (IP_MANUAL.trim() !== '') {
    return IP_MANUAL.trim();
  }

  const sourceCode = NativeModules.SourceCode;
  const scriptURL = sourceCode?.scriptURL || sourceCode?.getConstants?.().scriptURL;

  if (typeof scriptURL === 'string' && scriptURL.startsWith('http')) {
    const autoridad = scriptURL.split('://')[1]?.split('/')[0] || '';
    const host = autoridad.split(':')[0];

    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('[')) {
      return host;
    }
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const URL_BASE = `http://${obtenerHost()}:${PUERTO}`;

// Lee el token guardado dentro de la sesión.
export async function obtenerToken() {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_SESION);
    if (!texto) {
      return null;
    }
    const sesion = JSON.parse(texto);
    return sesion?.token || null;
  } catch (error) {
    return null;
  }
}

async function leerRespuesta(respuesta) {
  const texto = await respuesta.text();
  if (!texto) {
    return null;
  }
  try {
    return JSON.parse(texto);
  } catch (error) {
    return { mensaje: texto };
  }
}

// Función general para llamar al backend.
export async function solicitar(ruta, opciones = {}) {
  const { metodo = 'GET', cuerpo = null, conToken = true } = opciones;
  const cabeceras = { 'Content-Type': 'application/json' };

  if (conToken) {
    const token = await obtenerToken();
    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
    }
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 30000);

  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === null ? undefined : JSON.stringify(cuerpo),
      signal: controlador.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Inténtalo nuevamente.');
    }
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
  } finally {
    clearTimeout(temporizador);
  }

  const datos = await leerRespuesta(respuesta);

  if (!respuesta.ok) {
    const mensaje = datos?.mensaje || datos?.message || datos?.error || 'Ocurrió un error en el servidor.';
    const error = new Error(mensaje);
    error.estado = respuesta.status;
    error.datos = datos;
    throw error;
  }

  return datos;
}

// Inicia sesión con correo y contraseña.
export function iniciarSesion(correo, clave) {
  return solicitar('/api/auth/login', {
    metodo: 'POST',
    cuerpo: { correo, clave },
    conToken: false,
  });
}

// Registra un cliente nuevo en el backend.
export function registrarUsuario(datos) {
  return solicitar('/api/auth/registro', {
    metodo: 'POST',
    cuerpo: datos,
    conToken: false,
  });
}

// Lista los usuarios. Solo funciona con una sesión de administrador.
export function listarUsuarios() {
  return solicitar('/api/usuarios');
}

// Crea un usuario con el rol indicado. Solo administrador.
export function crearUsuario(datos) {
  return solicitar('/api/usuarios', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

// Actualiza los datos de un usuario por su id. Solo administrador.
export function actualizarUsuario(id, datos) {
  return solicitar(`/api/usuarios/${id}`, {
    metodo: 'PUT',
    cuerpo: datos,
  });
}

// Elimina un usuario por su id. Solo administrador.
export function eliminarUsuario(id) {
  return solicitar(`/api/usuarios/${id}`, {
    metodo: 'DELETE',
  });
}

// Datos del usuario que tiene la sesión iniciada.
export function obtenerPerfil() {
  return solicitar('/api/perfil');
}

// Actualiza nombre, apellido, teléfono, dirección o foto del usuario actual.
export function actualizarPerfil(datos) {
  return solicitar('/api/perfil', {
    metodo: 'PUT',
    cuerpo: datos,
  });
}

// Cambia la contraseña del usuario actual.
export function cambiarClave(claveActual, claveNueva) {
  return solicitar('/api/perfil/clave', {
    metodo: 'PUT',
    cuerpo: { claveActual, claveNueva },
  });
}

// Lista los productos activos. Puede filtrar por categoría o por nombre.
export function listarProductos(categoria, buscar) {
  const parametros = [];
  if (categoria) {
    parametros.push(`categoria=${encodeURIComponent(categoria)}`);
  }
  if (buscar) {
    parametros.push(`buscar=${encodeURIComponent(buscar)}`);
  }
  const consulta = parametros.length > 0 ? `?${parametros.join('&')}` : '';
  return solicitar(`/api/productos${consulta}`, { conToken: false });
}

// Lista las categorías que existen en la base de datos.
export function listarCategorias() {
  return solicitar('/api/productos/categorias', { conToken: false });
}

// Crea un producto nuevo. Solo admin o almacén.
export function crearProducto(datos) {
  return solicitar('/api/productos', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

// Actualiza un producto existente. Solo admin o almacén.
export function actualizarProducto(id, datos) {
  return solicitar(`/api/productos/${id}`, {
    metodo: 'PUT',
    cuerpo: datos,
  });
}

// Da de baja un producto. Solo admin o almacén.
export function eliminarProducto(id) {
  return solicitar(`/api/productos/${id}`, {
    metodo: 'DELETE',
  });
}

// Resumen real del almacén para el panel principal.
export function obtenerResumenAlmacen() {
  return solicitar('/api/almacen/resumen');
}

// Registra una entrada de productos y actualiza el stock.
export function registrarEntrada(datos) {
  return solicitar('/api/almacen/entradas', {
    metodo: 'POST',
    cuerpo: datos,
  });
}

// Lista el kardex de entradas y salidas. Puede filtrar por producto o tipo.
export function listarMovimientos(productoId, tipo) {
  const parametros = [];
  if (productoId) {
    parametros.push(`productoId=${encodeURIComponent(productoId)}`);
  }
  if (tipo) {
    parametros.push(`tipo=${encodeURIComponent(tipo)}`);
  }
  const consulta = parametros.length > 0 ? `?${parametros.join('&')}` : '';
  return solicitar(`/api/almacen/movimientos${consulta}`);
}
