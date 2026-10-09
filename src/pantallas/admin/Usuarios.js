import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { obtenerUsuarios, agregarUsuario, eliminarUsuario, actualizarUsuario, cerrarSesion } from '../../guardado/guardadoAcceso';

export default function Usuarios({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState('almacen');
  const [mensaje, setMensaje] = useState('');

  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editClave, setEditClave] = useState('');
  const [editRol, setEditRol] = useState('cliente');

  const cargar = async () => {
    const lista = await obtenerUsuarios();
    setUsuarios(lista);
  };

  useEffect(() => {
    cargar();
  }, []);

  const agregar = async () => {
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      setMensaje('Ingrese nombre y apellido');
      return;
    }
    if (!correo.includes('@') || !correo.includes('.')) {
      setMensaje('Correo inválido');
      return;
    }
    if (clave.length < 6) {
      setMensaje('La clave debe tener 6 caracteres');
      return;
    }
    const ok = await agregarUsuario({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim(),
      telefono,
      direccion: '',
      clave,
      rol,
    });
    if (!ok) {
      setMensaje('Ese correo ya existe');
      return;
    }
    setNombre('');
    setApellido('');
    setCorreo('');
    setTelefono('');
    setClave('');
    setMensaje('');
    setModalAgregar(false);
    cargar();
  };

  const abrirEditar = (usuario) => {
    setEditNombre(usuario.nombre);
    setEditApellido(usuario.apellido);
    setEditTelefono(usuario.telefono);
    setEditClave('');
    setEditRol(usuario.rol);
    setUsuarioEditado(usuario);
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    if (usuarioEditado) {
      const cambios = {
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
        telefono: editTelefono,
        rol: editRol,
      };
      if (editClave !== '') {
        cambios.clave = editClave;
      }
      await actualizarUsuario(usuarioEditado.correo, cambios);
      setModalEditar(false);
      setUsuarioEditado(null);
      setEditClave('');
      cargar();
    }
  };

  const eliminar = async (correoBorrar) => {
    if (correoBorrar === 'admin@sautex.com') {
      return;
    }
    await eliminarUsuario(correoBorrar);
    cargar();
  };

  const salir = async () => {
    await cerrarSesion();
    navigation.replace('InicioSesion');
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Cuentas</Text>
        <TouchableOpacity onPress={salir}>
          <Text style={styles.salir}>Salir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalAgregar(true)}>
        <Text style={styles.textoBoton}>+ Agregar usuario</Text>
      </TouchableOpacity>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.correo}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
              <Text style={styles.dato}>{item.correo} - {item.rol}</Text>
            </View>
            <TouchableOpacity style={styles.botonIconoAzul} onPress={() => abrirEditar(item)}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonIconoRojo} onPress={() => eliminar(item.correo)}>
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalAgregar} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Nuevo usuario</Text>
            <TextInput style={styles.input} placeholder="Nombres" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Apellidos" value={apellido} onChangeText={setApellido} />
            <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="numeric" maxLength={9} />
            <TextInput style={styles.input} placeholder="Clave" value={clave} onChangeText={setClave} secureTextEntry={true} />
            <View style={styles.fila}>
              {['cliente', 'almacen', 'admin'].map((r) => (
                <TouchableOpacity key={r} style={[styles.rol, rol === r && styles.rolActivo]} onPress={() => setRol(r)}>
                  <Text style={rol === r ? styles.rolTextoActivo : styles.rolTexto}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonGuardar} onPress={agregar}>
                <Text style={styles.textoBotonPequeno}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalAgregar(false)}>
                <Text style={styles.textoBotonPequeno}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEditar} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Editar usuario</Text>
            <TextInput style={styles.input} placeholder="Nombres" value={editNombre} onChangeText={setEditNombre} />
            <TextInput style={styles.input} placeholder="Apellidos" value={editApellido} onChangeText={setEditApellido} />
            <TextInput style={styles.input} placeholder="Teléfono" value={editTelefono} onChangeText={setEditTelefono} keyboardType="numeric" maxLength={9} />
            <TextInput style={styles.input} placeholder="Nueva contraseña" value={editClave} onChangeText={setEditClave} secureTextEntry={true} />
            <View style={styles.fila}>
              {['cliente', 'almacen', 'admin'].map((r) => (
                <TouchableOpacity key={r} style={[styles.rol, editRol === r && styles.rolActivo]} onPress={() => setEditRol(r)}>
                  <Text style={editRol === r ? styles.rolTextoActivo : styles.rolTexto}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarEdicion}>
                <Text style={styles.textoBotonPequeno}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalEditar(false)}>
                <Text style={styles.textoBotonPequeno}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
    paddingHorizontal: 15,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  salir: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  botonAgregar: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  botonIconoAzul: {
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  botonIconoRojo: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFD',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  fila: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rol: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFD',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  rolActivo: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  rolTexto: {
    fontSize: 12,
    color: '#8A93A6',
  },
  rolTextoActivo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  mensaje: {
    textAlign: 'center',
    color: '#E53935',
    fontSize: 12,
    marginBottom: 6,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#2E9E5B',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#8A93A6',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  textoBotonPequeno: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalCaja: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D1B3E',
    textAlign: 'center',
    marginBottom: 10,
  },
});
