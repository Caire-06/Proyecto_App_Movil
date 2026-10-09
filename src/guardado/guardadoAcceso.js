import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_USUARIOS = 'sautex_usuarios';
const CLAVE_SESION = 'sautex_sesion';

const porDefecto = [
  {
    nombre: 'Admin',
    apellido: 'SAUTEX',
    correo: 'admin@sautex.com',
    telefono: '999000000',
    direccion: 'Oficina SAUTEX',
    clave: 'admin123',
    rol: 'admin',
  },
  {
    nombre: 'Almacen',
    apellido: 'SAUTEX',
    correo: 'almacen@sautex.com',
    telefono: '999000001',
    direccion: 'Almacén SAUTEX',
    clave: 'almacen123',
    rol: 'almacen',
  },
];

export async function inicializar() {
  const actual = await AsyncStorage.getItem(CLAVE_USUARIOS);
  if (actual === null) {
    await AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify(porDefecto));
  }
}

export async function obtenerUsuarios() {
  const texto = await AsyncStorage.getItem(CLAVE_USUARIOS);
  return texto ? JSON.parse(texto) : [];
}

async function guardarLista(lista) {
  await AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

export async function agregarUsuario(usuario) {
  const lista = await obtenerUsuarios();
  const existe = lista.some((u) => u.correo === usuario.correo);
  if (existe) {
    return false;
  }
  lista.push(usuario);
  await guardarLista(lista);
  return true;
}

export async function eliminarUsuario(correo) {
  const lista = await obtenerUsuarios();
  const nueva = lista.filter((u) => u.correo !== correo);
  await guardarLista(nueva);
}

export async function actualizarUsuario(correo, cambios) {
  const lista = await obtenerUsuarios();
  const nueva = lista.map((u) =>
    u.correo === correo ? { ...u, ...cambios } : u
  );
  await guardarLista(nueva);
}

export async function buscarUsuario(correo, clave) {
  const lista = await obtenerUsuarios();
  return lista.find((u) => u.correo === correo && u.clave === clave) || null;
}

export async function guardarSesion(usuario) {
  await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

export async function obtenerSesion() {
  const texto = await AsyncStorage.getItem(CLAVE_SESION);
  return texto ? JSON.parse(texto) : null;
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(CLAVE_SESION);
}
