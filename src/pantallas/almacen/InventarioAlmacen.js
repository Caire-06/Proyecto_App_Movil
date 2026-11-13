import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  actualizarProducto,
  eliminarProducto,
  listarCategorias,
  listarProductos,
} from '../../servicios/api';
import { elegirImagen, fuenteImagen } from '../../utilidades/imagenesProducto';

const estadoProducto = (stockNumero) => {
  if (stockNumero <= 0) {
    return { texto: 'Sin stock', estilo: 'rojo' };
  }
  if (stockNumero <= 10) {
    return { texto: 'Stock bajo', estilo: 'amarillo' };
  }
  return { texto: 'Disponible', estilo: 'verde' };
};

export default function InventarioAlmacen() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [modalEditar, setModalEditar] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editUnidad, setEditUnidad] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImagen, setEditImagen] = useState(null);

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const lista = await listarProductos();
      setProductos(Array.isArray(lista) ? lista : []);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message || 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar(true);
    }, [cargar])
  );

  const cargarCategorias = async () => {
    try {
      const lista = await listarCategorias();
      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (error) {
      setMensaje(error.message || 'No se pudieron cargar las categorías');
    }
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargar(false);
  };

  const abrirEditar = (producto) => {
    setMensaje('');
    setProductoEditado(producto);
    setEditNombre(producto.nombre || '');
    setEditDescripcion(producto.descripcion || '');
    setEditPrecio(String(producto.precio ?? ''));
    setEditCategoria(producto.categoria || '');
    setEditUnidad(producto.unidad || '');
    setEditStock(String(producto.stock ?? 0));
    setEditImagen(producto.imagen || null);
    setModalEditar(true);
  };

  const seleccionarImagenEdicion = async () => {
    setMensaje('');
    const resultado = await elegirImagen();
    if (resultado.error) {
      setMensaje(resultado.error);
      return;
    }
    if (resultado.cancelado) {
      return;
    }
    setEditImagen(resultado.imagen);
  };

  const guardarEdicion = async () => {
    if (!productoEditado || guardando) {
      return;
    }
    setMensaje('');

    if (editNombre.trim().length < 3) {
      setMensaje('Ingrese un nombre de al menos 3 caracteres');
      return;
    }
    if (editCategoria.trim() === '') {
      setMensaje('Seleccione una categoría');
      return;
    }

    const precioNumero = Number(String(editPrecio).replace(',', '.'));
    if (!editPrecio || Number.isNaN(precioNumero) || precioNumero <= 0) {
      setMensaje('Ingrese un precio mayor a cero');
      return;
    }

    const stockNumero = Number(editStock);
    if (editStock === '' || Number.isNaN(stockNumero) || stockNumero < 0 || !Number.isInteger(stockNumero)) {
      setMensaje('Ingrese un stock válido');
      return;
    }

    setGuardando(true);
    try {
      await actualizarProducto(productoEditado.id, {
        nombre: editNombre.trim(),
        unidad: editUnidad.trim(),
        precio: precioNumero,
        stock: stockNumero,
        categoria: editCategoria.trim(),
        imagen: editImagen,
        descripcion: editDescripcion.trim(),
      });
      setModalEditar(false);
      setProductoEditado(null);
      await cargar(false);
    } catch (error) {
      setMensaje(error.message || 'No se pudo actualizar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (producto) => {
    setMensaje('');
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarProducto(producto.id);
              await cargar(false);
            } catch (error) {
              setMensaje(error.message || 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProducto = ({ item }) => {
    const estado = estadoProducto(Number(item.stock));
    const foto = fuenteImagen(item.imagen);

    return (
      <View style={styles.tarjeta}>
        <View style={styles.filaPrincipal}>
          {foto ? (
            <Image source={foto} style={styles.foto} resizeMode="cover" />
          ) : (
            <View style={styles.fotoVacia}>
              <Ionicons name="cube-outline" size={26} color="#8A93A6" />
            </View>
          )}
          <View style={styles.infoPrincipal}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.dato}>
              {item.categoria || 'Sin categoría'} - {item.unidad || 'Sin presentación'}
            </Text>
            <View style={styles.filaPrecio}>
              <Text style={styles.precio}>S/ {Number(item.precio).toFixed(2)}</Text>
              <Text style={[styles.estado, styles[estado.estilo]]}>{estado.texto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.filaStock}>
          <Text style={styles.stockTitulo}>Stock actual</Text>
          <Text style={styles.stockNumero}>{item.stock} unid.</Text>
        </View>

        <View style={styles.filaBotones}>
          <TouchableOpacity style={styles.botonEditar} onPress={() => abrirEditar(item)}>
            <Ionicons name="pencil" size={14} color="#1E65C0" />
            <Text style={styles.textoEditar}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminar(item)}>
            <Ionicons name="trash" size={14} color="#E53935" />
            <Text style={styles.textoEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Lista de productos</Text>
        <Text style={styles.contador}>{productos.length} productos</Text>
      </View>

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {cargando && productos.length === 0 ? (
        <View style={styles.cargando}>
          <ActivityIndicator color="#1E65C0" />
          <Text style={styles.textoCargando}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Ionicons name="cube-outline" size={38} color="#8A93A6" />
              <Text style={styles.textoVacio}>No hay productos registrados</Text>
              <Text style={styles.subtextoVacio}>Agrega un producto desde la pestaña Agregar.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalEditar}
        animationType="slide"
        transparent
        onRequestClose={() => setModalEditar(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Editar producto</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.selectorImagen} onPress={seleccionarImagenEdicion}>
                {fuenteImagen(editImagen) ? (
                  <Image source={fuenteImagen(editImagen)} style={styles.vistaPrevia} resizeMode="cover" />
                ) : (
                  <View style={styles.sinImagen}>
                    <Ionicons name="image-outline" size={26} color="#8A93A6" />
                    <Text style={styles.textoSinImagen}>Seleccionar imagen</Text>
                  </View>
                )}
              </TouchableOpacity>
              {editImagen ? (
                <TouchableOpacity onPress={() => setEditImagen('')}>
                  <Text style={styles.quitarImagen}>Quitar imagen</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.etiqueta}>Nombre</Text>
              <TextInput style={styles.input} value={editNombre} onChangeText={setEditNombre} />

              <Text style={styles.etiqueta}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputDescripcion]}
                value={editDescripcion}
                onChangeText={setEditDescripcion}
                multiline
              />

              <View style={styles.filaDoble}>
                <View style={styles.mitad}>
                  <Text style={styles.etiqueta}>Precio (S/)</Text>
                  <TextInput
                    style={styles.input}
                    value={editPrecio}
                    onChangeText={setEditPrecio}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.mitad}>
                  <Text style={styles.etiqueta}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={editStock}
                    onChangeText={setEditStock}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.etiqueta}>Categoría</Text>
              {categorias.length === 0 ? (
                <Text style={styles.sinCategorias}>No hay categorías registradas.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                >
                  {categorias.map((item) => {
                    const activa = editCategoria === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.chip, activa && styles.chipActivo]}
                        onPress={() => setEditCategoria(item)}
                      >
                        <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={styles.etiqueta}>Presentación</Text>
              <TextInput style={styles.input} value={editUnidad} onChangeText={setEditUnidad} />

              {mensaje !== '' && <Text style={styles.mensajeModal}>{mensaje}</Text>}

              <View style={styles.filaBotonesModal}>
                <TouchableOpacity
                  style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
                  onPress={guardarEdicion}
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
                  onPress={() => {
                    setModalEditar(false);
                    setProductoEditado(null);
                    setMensaje('');
                  }}
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
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  contador: {
    fontSize: 12,
    color: '#8A93A6',
  },
  lista: {
    paddingBottom: 25,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  filaPrincipal: {
    flexDirection: 'row',
    gap: 12,
  },
  foto: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: '#F8FAFD',
  },
  fotoVacia: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPrincipal: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  filaPrecio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  precio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  estado: {
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
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
  filaStock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F6',
  },
  stockTitulo: {
    fontSize: 11,
    color: '#8A93A6',
  },
  stockNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  botonEditar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 8,
    padding: 8,
  },
  textoEditar: {
    color: '#1E65C0',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botonEliminar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    padding: 8,
  },
  textoEliminar: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 12,
  },
  mensaje: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 10,
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
    textAlign: 'center',
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
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 8,
  },
  selectorImagen: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#D7DEEA',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
  },
  vistaPrevia: {
    width: '100%',
    height: 140,
  },
  sinImagen: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSinImagen: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 5,
  },
  quitarImagen: {
    textAlign: 'center',
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
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
  filaDoble: {
    flexDirection: 'row',
    gap: 10,
  },
  mitad: {
    flex: 1,
  },
  chips: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: '#fff',
  },
  chipActivo: {
    backgroundColor: '#1E65C0',
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  chipTextoActivo: {
    color: '#fff',
  },
  sinCategorias: {
    fontSize: 12,
    color: '#8A93A6',
    paddingVertical: 6,
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
