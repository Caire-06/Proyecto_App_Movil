import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { buscarUsuario, guardarSesion, inicializar } from '../../guardado/guardadoAcceso';

export default function InicioSesion({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const esCorreoValido = (valor) => {
    return valor.includes('@') && valor.includes('.');
  };

  const entrar = async () => {
    if (correo.trim() === '' || clave.trim() === '') {
      setMensaje('Ingrese correo y contraseña');
      return;
    }
    if (!esCorreoValido(correo.trim())) {
      setMensaje('Ingrese un correo válido con @ y punto');
      return;
    }
    await inicializar();
    const usuario = await buscarUsuario(correo.trim(), clave);
    if (usuario === null) {
      setMensaje('Correo o contraseña incorrectos');
      return;
    }
    await guardarSesion(usuario);
    if (usuario.rol === 'admin') {
      navigation.replace('Admin');
    } else if (usuario.rol === 'almacen') {
      navigation.replace('Almacen');
    } else {
      navigation.replace('Principal');
    }
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.arriba}>
        <Image source={require('../../../assets/logo-sautex.png')} style={styles.logoPequeno} />
        <Text style={styles.tituloSautex}>SAUTEX</Text>
        <Text style={styles.subSautex}>E.I.R.L.</Text>
      </View>

      <View style={styles.tarjeta}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>Bienvenido</Text>
          <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <View style={styles.cajaClave}>
            <TextInput
              style={styles.inputClave}
              placeholder="Mínimo 6 caracteres"
              value={clave}
              onChangeText={setClave}
              secureTextEntry={!verClave}
            />
            <TouchableOpacity onPress={() => setVerClave(!verClave)}>
              <Ionicons name={verClave ? 'eye-off' : 'eye'} size={20} color="#8A93A6" />
            </TouchableOpacity>
          </View>

          {mensaje !== '' && (
            <Text style={styles.mensaje}>{mensaje}</Text>
          )}

          <TouchableOpacity style={styles.boton} onPress={entrar}>
            <Text style={styles.textoBoton}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.enlace}>
              ¿Sin cuenta? <Text style={styles.enlaceAzul}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#0A1440',
  },
  arriba: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  logoPequeno: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginBottom: 8,
  },
  tituloSautex: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subSautex: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 22,
    paddingBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  subtitulo: {
    fontSize: 12,
    color: '#8A93A6',
    marginBottom: 15,
    marginTop: 3,
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
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  cajaClave: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputClave: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  enlace: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 15,
    marginBottom: 20,
  },
  enlaceAzul: {
    color: '#1E65C0',
    fontWeight: 'bold',
  },
  mensaje: {
    textAlign: 'center',
    color: '#1E65C0',
    fontSize: 13,
    marginTop: 10,
    fontWeight: 'bold',
  },
});
