import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { agregarUsuario, inicializar } from '../../guardado/guardadoAcceso';

// Pantalla de registro de usuarios
export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [verClave2, setVerClave2] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const esCorreoValido = (valor) => {
    return valor.includes('@') && valor.includes('.');
  };

  const soloNumeros = (valor) => {
    return /^[0-9]*$/.test(valor);
  };

  const registrar = async () => {
    if (nombre.trim().length < 2) {
      setMensaje('Ingrese su nombre');
      return;
    }
    if (apellido.trim().length < 2) {
      setMensaje('Ingrese su apellido');
      return;
    }
    if (!esCorreoValido(correo.trim())) {
      setMensaje('Ingrese un correo válido con @ y punto');
      return;
    }
    if (telefono.length !== 9 || !soloNumeros(telefono)) {
      setMensaje('El teléfono debe tener 9 números');
      return;
    }
    if (direccion.trim().length < 5) {
      setMensaje('Ingrese su dirección');
      return;
    }
    if (clave.length < 6) {
      setMensaje('La contraseña debe tener 6 caracteres');
      return;
    }
    if (clave !== clave2) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }
    await inicializar();
    const ok = await agregarUsuario({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim(),
      telefono,
      direccion: direccion.trim(),
      clave,
      rol: 'cliente',
    });
    if (!ok) {
      setMensaje('Ese correo ya está registrado');
      return;
    }
    setMensaje('Cuenta creada. Ahora inicie sesión');
    setNombre('');
    setApellido('');
    setCorreo('');
    setTelefono('');
    setDireccion('');
    setClave('');
    setClave2('');
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
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

          <View style={styles.fila}>
            <View style={styles.columna}>
              <Text style={styles.etiqueta}>Nombres</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>
            <View style={styles.columna}>
              <Text style={styles.etiqueta}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Pérez"
                value={apellido}
                onChangeText={setApellido}
              />
            </View>
          </View>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />

          <Text style={styles.etiqueta}>Teléfono (9 dígitos)</Text>
          <TextInput
            style={styles.input}
            placeholder="999 000 000"
            value={telefono}
            onChangeText={(t) => { if (soloNumeros(t) && t.length <= 9) setTelefono(t); }}
            keyboardType="numeric"
            maxLength={9}
          />

          <Text style={styles.etiqueta}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Av. Los Olivos 456"
            value={direccion}
            onChangeText={setDireccion}
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

          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <View style={styles.cajaClave}>
            <TextInput
              style={styles.inputClave}
              placeholder="Repite tu contraseña"
              value={clave2}
              onChangeText={setClave2}
              secureTextEntry={!verClave2}
            />
            <TouchableOpacity onPress={() => setVerClave2(!verClave2)}>
              <Ionicons name={verClave2 ? 'eye-off' : 'eye'} size={20} color="#8A93A6" />
            </TouchableOpacity>
          </View>

          {mensaje !== '' && (
            <Text style={styles.mensaje}>{mensaje}</Text>
          )}

          <TouchableOpacity style={styles.boton} onPress={registrar}>
            <Text style={styles.textoBoton}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('InicioSesion')}>
            <Text style={styles.enlace}>
              ¿Ya tienes cuenta? <Text style={styles.enlaceAzul}>Inicia sesión</Text>
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
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 25,
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
  fila: {
    flexDirection: 'row',
    gap: 10,
  },
  columna: {
    flex: 1,
  },
});
