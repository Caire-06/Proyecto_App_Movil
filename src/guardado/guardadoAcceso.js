import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_SESION = 'sautex_sesion';
const CLAVE_USUARIOS_ANTIGUA = 'sautex_usuarios';

// Guarda quién inició sesión, junto con su token y rol.
export async function guardarSesion(usuario) {
  await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

// Lee quién inició sesión.
export async function obtenerSesion() {
  const texto = await AsyncStorage.getItem(CLAVE_SESION);
  return texto ? JSON.parse(texto) : null;
}

// Borra la sesión al salir.
export async function cerrarSesion() {
  await AsyncStorage.removeItem(CLAVE_SESION);
}

// Borra la lista de usuarios que antes se guardaba en el teléfono.
export async function limpiarUsuariosLocales() {
  await AsyncStorage.removeItem(CLAVE_USUARIOS_ANTIGUA);
}
