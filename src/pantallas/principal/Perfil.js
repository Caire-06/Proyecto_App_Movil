import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { obtenerSesion, actualizarUsuario, guardarSesion, cerrarSesion } from '../../guardado/guardadoAcceso';

export default function Perfil({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [foto, setFoto] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const sesion = await obtenerSesion();
    if (sesion) {
      setCorreo(sesion.correo);
      setFoto(sesion.foto || '');
      setNombre(sesion.nombre);
      setApellido(sesion.apellido);
      setTelefono(sesion.telefono || '');
      setDireccion(sesion.direccion || '');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const elegirFoto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    });
    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;
      setFoto(uri);
      await actualizarUsuario(correo, { foto: uri });
      await guardarSesion({ ...(await obtenerSesion()), foto: uri });
      setMensaje('Foto actualizada');
    }
  };

  const guardarDatos = async () => {
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      setMensaje('Ingrese nombre y apellido');
      return;
    }
    const cambios = { nombre: nombre.trim(), apellido: apellido.trim(), telefono, direccion: direccion.trim() };
    await actualizarUsuario(correo, cambios);
    await guardarSesion({ ...(await obtenerSesion()), ...cambios });
    setMensaje('Datos actualizados');
  };

  const cambiarClave = async () => {
    const sesion = await obtenerSesion();
    if (!sesion || claveActual !== sesion.clave) {
      setMensaje('Su contraseña actual no es correcta');
      return;
    }
    if (claveNueva.length < 6) {
      setMensaje('La nueva debe tener 6 caracteres');
      return;
    }
    await actualizarUsuario(correo, { clave: claveNueva });
    await guardarSesion({ ...sesion, clave: claveNueva });
    setClaveActual('');
    setClaveNueva('');
    setMensaje('Contraseña actualizada');
  };

  const salir = async () => {
    await cerrarSesion();
    navigation.getParent()?.replace('InicioSesion');
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Perfil</Text>
      <TouchableOpacity style={styles.circulo} onPress={elegirFoto}>
        {foto !== '' ? (
          <Image source={{ uri: foto }} style={styles.foto} />
        ) : (
          <Ionicons name="person" size={45} color="#8A93A6" />
        )}
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.correo}>{correo}</Text>

        <Text style={styles.etiqueta}>Nombres</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
        <Text style={styles.etiqueta}>Apellidos</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />
        <Text style={styles.etiqueta}>Teléfono</Text>
        <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="numeric" maxLength={9} />
        <Text style={styles.etiqueta}>Dirección</Text>
        <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
        <TouchableOpacity style={styles.botonAzul} onPress={guardarDatos}>
          <Text style={styles.textoBoton}>Guardar datos</Text>
        </TouchableOpacity>

        <Text style={styles.seccion}>Cambiar contraseña</Text>
        <Text style={styles.etiqueta}>Contraseña actual</Text>
        <View style={styles.cajaClave}>
          <TextInput style={styles.inputClave} value={claveActual} onChangeText={setClaveActual} secureTextEntry={!verActual} />
          <TouchableOpacity onPress={() => setVerActual(!verActual)}>
            <Ionicons name={verActual ? 'eye-off' : 'eye'} size={20} color="#8A93A6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.etiqueta}>Nueva contraseña</Text>
        <View style={styles.cajaClave}>
          <TextInput style={styles.inputClave} value={claveNueva} onChangeText={setClaveNueva} secureTextEntry={!verNueva} />
          <TouchableOpacity onPress={() => setVerNueva(!verNueva)}>
            <Ionicons name={verNueva ? 'eye-off' : 'eye'} size={20} color="#8A93A6" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.botonAzul} onPress={cambiarClave}>
          <Text style={styles.textoBoton}>Cambiar contraseña</Text>
        </TouchableOpacity>

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

        <TouchableOpacity style={styles.botonRojo} onPress={salir}>
          <Text style={styles.textoBoton}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
    paddingHorizontal: 18,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 10,
  },
  circulo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  foto: {
    width: 100,
    height: 100,
  },
  correo: {
    fontSize: 13,
    color: '#8A93A6',
    marginBottom: 8,
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 18,
    marginBottom: 5,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A93A6',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  cajaClave: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputClave: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  botonAzul: {
    backgroundColor: '#1E65C0',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    marginTop: 15,
  },
  botonRojo: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mensaje: {
    textAlign: 'center',
    color: '#1E65C0',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
