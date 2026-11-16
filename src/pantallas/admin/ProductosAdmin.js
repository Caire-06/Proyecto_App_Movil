import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  crearCategoria,
  listarCategoriasCompletas,
  listarTodosLosProductos,
} from '../../servicios/api';

const estadoProducto = (producto) => {
  if (producto.activo === false) {
    return { texto: 'Dado de baja', estilo: 'gris' };
  }
  const stock = Number(producto.stock || 0);
  if (stock <= 0) {
    return { texto: 'Sin stock', estilo: 'rojo' };
  }
  if (stock <= 10) {
    return { texto: 'Stock bajo', estilo: 'amarillo' };
  }
  return { texto: 'Disponible', estilo: 'verde' };
};

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [modalCategoria, setModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const [listaProductos, listaCategorias] = await Promise.all([
        listarTodosLosProductos(),
        listarCategoriasCompletas(),
      ]);
      setProductos(Array.isArray(listaProductos) ? listaProductos : []);
      setCategorias(Array.isArray(listaCategorias) ? listaCategorias : []);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar(true);
    }, [cargar])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargar(false);
  };

  const abrirModalCategoria = () => {
    setMensaje('');
    setNuevaCategoria('');
    setNuevaDescripcion('');
    setModalCategoria(true);
  };

  const guardarCategoria = async () => {
    if (guardando) {
      return;
    }
    setMensaje('');
    const nombre = nuevaCategoria.trim();
    if (nombre.length < 3) {
      setMensaje('Ingrese un nombre de al menos 3 caracteres');
      return;
    }

    setGuardando(true);
    try {
      await crearCategoria({ nombre, descripcion: nuevaDescripcion.trim() });
      setModalCategoria(false);
      setNuevaCategoria('');
      setNuevaDescripcion('');
      setMensaje('');
      await cargar(false);
      Alert.alert('Categoría creada', 'La categoría se guardó correctamente.');
    } catch (error) {
      setMensaje(error.message || 'No se pudo crear la categoría');
    } finally {
      setGuardando(false);
    }
  };

  const cabecera = (
    <View>
      <View style={styles.fila}>
        <View style={styles.caja}>
          <Text style={styles.numero}>{productos.length}</Text>
          <Text style={styles.texto}>Productos</Text>
        </View>
        <View style={styles.caja}>
          <Text style={styles.numero}>{categorias.length}</Text>
          <Text style={styles.texto}>Categorías</Text>
        </View>
      </View>

      <View style={styles.cabeceraSeccion}>
        <Text style={styles.seccion}>Categorías</Text>
        <TouchableOpacity style={styles.botonNueva} onPress={abrirModalCategoria}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.textoBotonNueva}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {categorias.length === 0 ? (
        <Text style={styles.vacioTexto}>Todavía no hay categorías registradas.</Text>
      ) : (
        categorias.map((categoria) => (
          <View key={categoria.id} style={styles.tarjetaCategoria}>
            <View style={styles.categoriaIcono}>
              <Ionicons name="pricetag" size={16} color="#1E65C0" />
            </View>
            <View style={styles.info}>
              <Text style={styles.nombre}>{categoria.nombre}</Text>
              {categoria.descripcion ? (
                <Text style={styles.dato}>{categoria.descripcion}</Text>
              ) : null}
            </View>
          </View>
        ))
      )}

      <Text style={styles.seccion}>Todos los productos</Text>
    </View>
  );

  const renderProducto = ({ item }) => {
    const estado = estadoProducto(item);
    return (
      <View style={styles.tarjetaProducto}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.dato}>
            {item.categoria || 'Sin categoría'} - {item.unidad || 'Sin presentación'}
          </Text>
        </View>
        <View style={styles.derecha}>
          <Text style={styles.precio}>S/ {Number(item.precio || 0).toFixed(2)}</Text>
          <Text style={[styles.estado, styles[estado.estilo]]}>{estado.texto}</Text>
          <Text style={styles.stock}>{item.stock} unid.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Productos y categorías</Text>

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {cargando && productos.length === 0 && categorias.length === 0 ? (
        <View style={styles.cargando}>
          <ActivityIndicator color="#1E65C0" />
          <Text style={styles.textoCargando}>Cargando información...</Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          ListHeaderComponent={cabecera}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
          }
          ListEmptyComponent={
            <Text style={styles.vacioTexto}>Todavía no hay productos registrados.</Text>
          }
        />
      )}

      <Modal
        visible={modalCategoria}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCategoria(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Nueva categoría</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.etiqueta}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Poliéster"
                placeholderTextColor="#A3ACBC"
                value={nuevaCategoria}
                onChangeText={setNuevaCategoria}
              />

              <Text style={styles.etiqueta}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputDescripcion]}
                placeholder="Descripción de la categoría"
                placeholderTextColor="#A3ACBC"
                value={nuevaDescripcion}
                onChangeText={setNuevaDescripcion}
                multiline
              />

              {mensaje !== '' && <Text style={styles.mensajeModal}>{mensaje}</Text>}

              <View style={styles.filaBotonesModal}>
                <TouchableOpacity
                  style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
                  onPress={guardarCategoria}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.textoBoton}>Guardar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonCancelar}
                  onPress={() => setModalCategoria(false)}
                >
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 10,
  },
  lista: {
    paddingBottom: 30,
  },
  fila: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  caja: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  numero: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  texto: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
    marginBottom: 8,
  },
  botonNueva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  textoBotonNueva: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tarjetaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoriaIcono: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F0FB',
    alignItems: 'center',
    justifyContent: 'center',
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
  tarjetaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  derecha: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  precio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  estado: {
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  verde: {
    color: '#2E9E5B',
    backgroundColor: '#DFF5E6',
  },
  amarillo: {
    color: '#B7791F',
    backgroundColor: '#FFF3D6',
  },
  rojo: {
    color: '#E53935',
    backgroundColor: '#FDE8E8',
  },
  gris: {
    color: '#8A93A6',
    backgroundColor: '#EEF1F6',
  },
  stock: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 3,
  },
  vacioTexto: {
    fontSize: 12,
    color: '#8A93A6',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCargando: {
    marginTop: 8,
    color: '#8A93A6',
    fontSize: 12,
  },
  mensaje: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 64, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCaja: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 8,
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
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0D1B3E',
  },
  inputDescripcion: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  mensajeModal: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  filaBotonesModal: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 5,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#8A93A6',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
