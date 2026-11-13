import * as ImagePicker from 'expo-image-picker';

const imagenesLocales = {
  'hilo-polieter150.jpg': require('../../assets/hilo-polieter150.jpg'),
  'hilo-nylon.jpg': require('../../assets/hilo-nylon.jpg'),
  'hilo-poliester300.jpg': require('../../assets/hilo-poliester300.jpg'),
  'hilo-texturizado75.jpg': require('../../assets/hilo-texturizado75.jpg'),
  'hilo-nylon-industrial.jpg': require('../../assets/hilo-nylon-industrial.jpg'),
  'hilo-poliester-150d.jpg': require('../../assets/hilo-poliester-150d.jpg'),
  'hilo-poliester-300d.jpg': require('../../assets/hilo-poliester-300d.jpg'),
  'hilo-texturizado-75d.jpg': require('../../assets/hilo-texturizado-75d.jpg'),
};

export function fuenteImagen(imagen) {
  if (!imagen) {
    return null;
  }
  if (imagen.startsWith('data:') || imagen.startsWith('http') || imagen.startsWith('file:')) {
    return { uri: imagen };
  }
  return imagenesLocales[imagen] || null;
}

export async function elegirImagen() {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) {
    return { error: 'Debes permitir el acceso a las fotos para elegir una imagen.' };
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.35,
    base64: true,
  });

  if (resultado.canceled) {
    return { cancelado: true };
  }

  const archivo = resultado.assets?.[0];
  if (!archivo) {
    return { error: 'No se pudo leer la imagen seleccionada.' };
  }

  if (!archivo.base64) {
    return { imagen: archivo.uri };
  }

  const tipo = archivo.mimeType || 'image/jpeg';
  const imagen = `data:${tipo};base64,${archivo.base64}`;

  if (imagen.length > 1900000) {
    return { error: 'La imagen es muy grande. Elige una imagen más pequeña.' };
  }

  return { imagen };
}
