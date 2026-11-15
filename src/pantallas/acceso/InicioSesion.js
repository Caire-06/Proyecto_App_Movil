import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { guardarSesion } from '../../guardado/guardadoAcceso';
import { iniciarSesion } from '../../servicios/api';

export default function InicioSesion({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const esCorreoValido = (valor) => {
    return valor.includes('@') && valor.includes('.');
  };

  // Inicia sesión contra el backend y guarda el token de la sesión
  const entrar = async () => {
    if (cargando) {
      return;
    }
    setMensaje('');

    if (correo.trim() === '' || clave.trim() === '') {
      setMensaje('Ingrese correo y contraseña');
      return;
    }
    if (!esCorreoValido(correo.trim())) {
      setMensaje('Ingrese un correo válido con @ y punto');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await iniciarSesion(correo.trim(), clave);

      if (!respuesta || !respuesta.exitoso || !respuesta.token) {
        setMensaje(respuesta?.mensaje || 'Correo o contraseña incorrectos');
        return;
      }

      const rol = respuesta.rol || respuesta.usuario?.rol || 'cliente';
      const sesion = {
        ...respuesta.usuario,
        token: respuesta.token,
        rol,
      };

      await guardarSesion(sesion);

      if (rol === 'admin') {
        navigation.replace('Admin');
      } else if (rol === 'almacen') {
        navigation.replace('Almacen');
      } else {
        navigation.replace('Principal');
      }
    } catch (error) {
      setMensaje(error.message || 'No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
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

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={entrar}
            disabled={cargando}
          >
            <Text style={styles.textoBoton}>
              {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Recuperar')}>
            <Text style={styles.enlaceOlvidado}>¿Olvidaste tu contraseña?</Text>
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
  botonDeshabilitado: {
    opacity: 0.6,
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
  enlaceOlvidado: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
    marginTop: 12,
  },
  mensaje: {
    textAlign: 'center',
    color: '#1E65C0',
    fontSize: 13,
    marginTop: 10,
    fontWeight: 'bold',
  },
});
