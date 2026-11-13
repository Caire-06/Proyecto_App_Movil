import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarProductos, registrarEntrada } from '../../servicios/api';

export default function RegistrarEntrada() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [referencia, setReferencia] = useState('');
  const [observacion, setObservacion] = useState('');
  const [modalProductos, setModalProductos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState(false);

  const cargarProductos = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const lista = await listarProductos();
      setProductos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      setExito(false);
      setMensaje(error.message || 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos(true);
    }, [cargarProductos])
  );

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setModalProductos(false);
    setMensaje('');
    setExito(false);
  };

  const guardarEntrada = async () => {
    if (guardando) {
      return;
    }
    setMensaje('');
    setExito(false);

    if (!productoSeleccionado) {
      setMensaje('Seleccione un producto');
      return;
    }

    const cantidadNumero = Number(cantidad);
    if (cantidad === '' || Number.isNaN(cantidadNumero) || cantidadNumero <= 0 || !Number.isInteger(cantidadNumero)) {
      setMensaje('Ingrese una cantidad mayor a cero');
      return;
    }

    setGuardando(true);
    try {
      const movimiento = await registrarEntrada({
        productoId: productoSeleccionado.id,
        cantidad: cantidadNumero,
        referencia: referencia.trim(),
        observacion: observacion.trim(),
      });

      setProductoSeleccionado({
        ...productoSeleccionado,
        stock: movimiento.stockNuevo,
      });
      setCantidad('');
      setReferencia('');
      setObservacion('');
      setExito(true);
      setMensaje(`Entrada registrada. Stock actual: ${movimiento.stockNuevo} unidades.`);
      await cargarProductos(false);
    } catch (error) {
      setExito(false);
      setMensaje(error.message || 'No se pudo registrar la entrada');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Registrar entrada</Text>
      <Text style={styles.subtitulo}>Aumenta el stock de un producto existente.</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenido}>
        <Text style={styles.etiqueta}>Producto</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setModalProductos(true)}>
          <Text style={productoSeleccionado ? styles.textoSelector : styles.textoPlaceholder}>
            {productoSeleccionado ? productoSeleccionado.nombre : 'Seleccionar producto'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#8A93A6" />
        </TouchableOpacity>

        {productoSeleccionado !== null && (
          <View style={styles.tarjetaProducto}>
            <View style={styles.filaEntre}>
              <Text style={styles.nombre}>{productoSeleccionado.nombre}</Text>
              <Text style={styles.stock}>{productoSeleccionado.stock} unid.</Text>
            </View>
            <Text style={styles.dato}>
              {productoSeleccionado.categoria || 'Sin categoría'} -{' '}
              {productoSeleccionado.unidad || 'Sin presentación'}
            </Text>
          </View>
        )}

        <Text style={styles.etiqueta}>Cantidad que ingresa</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#A3ACBC"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />

        <Text style={styles.etiqueta}>Referencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Compra a proveedor"
          placeholderTextColor="#A3ACBC"
          value={referencia}
          onChangeText={setReferencia}
        />

        <Text style={styles.etiqueta}>Observación</Text>
        <TextInput
          style={[styles.input, styles.inputObservacion]}
          placeholder="Detalle opcional"
          placeholderTextColor="#A3ACBC"
          value={observacion}
          onChangeText={setObservacion}
          multiline
        />

        {mensaje !== '' && (
          <Text style={[styles.mensaje, exito ? styles.mensajeExito : styles.mensajeError]}>
            {mensaje}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardarEntrada}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBoton}>Registrar entrada</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalProductos}
        animationType="slide"
        transparent
        onRequestClose={() => setModalProductos(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Seleccionar producto</Text>

            {cargando ? (
              <View style={styles.modalCargando}>
                <ActivityIndicator color="#1E65C0" />
                <Text style={styles.textoCargando}>Cargando productos...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalLista} showsVerticalScrollIndicator={false}>
                {productos.length === 0 ? (
                  <Text style={styles.modalVacio}>No hay productos registrados.</Text>
                ) : (
                  productos.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.modalItem}
                      onPress={() => seleccionarProducto(item)}
                    >
                      <View style={styles.modalInfo}>
                        <Text style={styles.modalNombre}>{item.nombre}</Text>
                        <Text style={styles.modalDato}>
                          {item.categoria || 'Sin categoría'} - Stock: {item.stock}
                        </Text>
                      </View>
                      {productoSeleccionado?.id === item.id && (
                        <Ionicons name="checkmark" size={18} color="#1E65C0" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.modalCerrar} onPress={() => setModalProductos(false)}>
              <Text style={styles.textoBoton}>Cerrar</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 18,
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
    marginBottom: 6,
  },
  contenido: {
    paddingBottom: 35,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A93A6',
    marginTop: 10,
    marginBottom: 5,
  },
  selector: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 11,
  },
  textoSelector: {
    fontSize: 13,
    color: '#0D1B3E',
    flexShrink: 1,
  },
  textoPlaceholder: {
    fontSize: 13,
    color: '#A3ACBC',
    flexShrink: 1,
  },
  tarjetaProducto: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  filaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
    flexShrink: 1,
  },
  stock: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  dato: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
    color: '#0D1B3E',
  },
  inputObservacion: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mensaje: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  mensajeExito: {
    color: '#2E9E5B',
  },
  mensajeError: {
    color: '#E53935',
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
    maxHeight: '70%',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 10,
  },
  modalLista: {
    maxHeight: 320,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
  },
  modalInfo: {
    flex: 1,
  },
  modalNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  modalDato: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 2,
  },
  modalVacio: {
    textAlign: 'center',
    color: '#8A93A6',
    fontSize: 13,
    paddingVertical: 20,
  },
  modalCargando: {
    paddingVertical: 25,
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 8,
    color: '#8A93A6',
    fontSize: 12,
  },
  modalCerrar: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
});
