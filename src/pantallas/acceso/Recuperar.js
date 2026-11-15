import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const CLAVE_RECUPERACION_LOCAL = 'sautex_recuperacion_local';

export default function Recuperar({ navigation }) {
  const [paso, setPaso] = useState(1);
  const [correo, setCorreo] = useState('');
  const [codigoGen, setCodigoGen] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nueva, setNueva] = useState('');
  const [verNueva, setVerNueva] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Genera un código local, sin llamar al backend.
  const enviarCodigo = () => {
    setMensaje('');
    if (!correo.includes('@') || !correo.includes('.')) {
      setMensaje('Ingrese un correo válido');
      return;
    }

    const numero = Math.floor(1000 + Math.random() * 9000).toString();
    setCodigoGen(numero);
    setPaso(2);
  };

  // Guarda el cambio solo en este teléfono.
  const cambiarClave = async () => {
    setMensaje('');
    if (codigo.trim() === '') {
      setMensaje('Ingrese el código');
      return;
    }
    if (codigo.trim() !== codigoGen) {
      setMensaje('El código no es correcto');
      return;
    }
    if (nueva.length < 6) {
      setMensaje('La nueva contraseña debe tener 6 caracteres');
      return;
    }

    try {
      const texto = await AsyncStorage.getItem(CLAVE_RECUPERACION_LOCAL);
      const registros = texto ? JSON.parse(texto) : {};
      registros[correo.trim().toLowerCase()] = {
        clave: nueva,
        fecha: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CLAVE_RECUPERACION_LOCAL, JSON.stringify(registros));
      setMensaje('Contraseña guardada solo en este teléfono');
      setCodigo('');
      setNueva('');
    } catch (error) {
      setMensaje('No se pudo guardar la contraseña en este teléfono');
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
          <Text style={styles.titulo}>Recuperar contraseña</Text>
          <Text style={styles.subtitulo}>Se generará un código en este dispositivo</Text>
          <Text style={styles.notaLocal}>Solo local: no cambia la contraseña del servidor.</Text>

          {paso === 1 && (
            <View>
              <Text style={styles.etiqueta}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
              />
              {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
              <TouchableOpacity style={styles.boton} onPress={enviarCodigo}>
                <Text style={styles.textoBoton}>Generar código</Text>
              </TouchableOpacity>
            </View>
          )}

          {paso === 2 && (
            <View>
              <Text style={styles.codigo}>Su código es: {codigoGen}</Text>
              <Text style={styles.etiqueta}>Código</Text>
              <TextInput
                style={styles.input}
                placeholder="4 dígitos"
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.etiqueta}>Nueva contraseña</Text>
              <View style={styles.cajaClave}>
                <TextInput
                  style={styles.inputClave}
                  placeholder="Mínimo 6 caracteres"
                  value={nueva}
                  onChangeText={setNueva}
                  secureTextEntry={!verNueva}
                />
                <TouchableOpacity onPress={() => setVerNueva(!verNueva)}>
                  <Ionicons name={verNueva ? 'eye-off' : 'eye'} size={20} color="#8A93A6" />
                </TouchableOpacity>
              </View>
              {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
              <TouchableOpacity style={styles.boton} onPress={cambiarClave}>
                <Text style={styles.textoBoton}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('InicioSesion')}>
            <Text style={styles.enlace}>
              Volver al <Text style={styles.enlaceAzul}>inicio de sesión</Text>
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
    height: 230,
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
    marginTop: 3,
  },
  notaLocal: {
    fontSize: 11,
    color: '#B7791F',
    backgroundColor: '#FFF7E6',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
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
  codigo: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E65C0',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
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
