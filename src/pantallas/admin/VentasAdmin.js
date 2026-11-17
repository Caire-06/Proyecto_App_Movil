
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import { useCallback, useEffect, useState } from 'react';

import {
  listarPedidos,
  obtenerPedido,
} from '../../servicios/api';

export default function VentasAdmin() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarVentas = useCallback(async () => {
    try {
      const respuesta = await listarPedidos();
      setVentas(Array.isArray(respuesta) ? respuesta : []);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudieron cargar las ventas.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const actualizarLista = () => {
    setActualizando(true);
    cargarVentas();
  };

  const verDetalle = async (id) => {
    try {
      setCargandoDetalle(true);
      setVentaSeleccionada(null);

      const detalle = await obtenerPedido(id);
      setVentaSeleccionada(detalle);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cargar el detalle.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const moneda = (valor) =>
    `S/ ${Number(valor || 0).toFixed(2)}`;

  // Texto y color según el estado del pedido.
  const estadoInfo = (estado) => {
    if (estado === 'entregado') {
      return { texto: 'Entregado', estilo: styles.entregado };
    }
    if (estado === 'en preparación') {
      return { texto: 'En preparación', estilo: styles.enPreparacion };
    }
    return { texto: 'En camino', estilo: styles.enCamino };
  };

  const renderVenta = ({ item }) => (
    <View style={styles.tarjeta}>
      <Text style={styles.numero}>Venta #{item.idPedido}</Text>

      <Text style={styles.dato}>
        Cliente: {item.cliente}
      </Text>

      <Text style={styles.dato}>
        Fecha: {item.fechaGeneracion}
      </Text>

      <Text style={styles.total}>
        {moneda(item.total)}
      </Text>

      <View style={styles.filaEstado}>
        <Text style={styles.dato}>Estado:</Text>
        <Text style={[styles.estado, estadoInfo(item.estado).estilo]}>
          {estadoInfo(item.estado).texto}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => verDetalle(item.idPedido)}
      >
        <Text style={styles.textoBoton}>Ver detalle</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1E65C0" />
        <Text style={styles.dato}>Cargando ventas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Ventas</Text>

      <FlatList
        data={ventas}
        keyExtractor={(item) => String(item.idPedido)}
        renderItem={renderVenta}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={actualizarLista}
          />
        }
        ListEmptyComponent={
          <Text style={styles.vacio}>
            No hay ventas registradas.
          </Text>
        }
      />

      <Modal
        visible={cargandoDetalle || !!ventaSeleccionada}
        transparent
        animationType="slide"
        onRequestClose={() => setVentaSeleccionada(null)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.contenidoModal}>
            {cargandoDetalle ? (
              <ActivityIndicator size="large" color="#1E65C0" />
            ) : ventaSeleccionada ? (
              <>
                <Text style={styles.tituloModal}>
                  Detalle de venta #{ventaSeleccionada.idPedido}
                </Text>

                <Text style={styles.dato}>
                  Cliente: {ventaSeleccionada.cliente}
                </Text>

                <Text style={styles.dato}>
                  Fecha: {ventaSeleccionada.fechaGeneracion}
                </Text>

                <Text style={styles.subtitulo}>Productos</Text>

                <FlatList
                  data={ventaSeleccionada.productos || []}
                  keyExtractor={(item, index) =>
                    String(item.productoId || index)
                  }
                  renderItem={({ item }) => (
                    <View style={styles.producto}>
                      <Text style={styles.nombreProducto}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.dato}>
                        Cantidad: {item.cantidad}
                      </Text>
                      <Text style={styles.dato}>
                        Precio: {moneda(item.precioUnitario)}
                      </Text>
                      <Text style={styles.dato}>
                        Importe: {moneda(item.importe)}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.dato}>
                      No hay productos disponibles.
                    </Text>
                  }
                />

                <View style={styles.resumen}>
                  <Text style={styles.dato}>
                    Subtotal: {moneda(ventaSeleccionada.subtotal)}
                  </Text>
                  <Text style={styles.dato}>
                    IGV: {moneda(ventaSeleccionada.igv)}
                  </Text>
                  <Text style={styles.total}>
                    Total: {moneda(ventaSeleccionada.total)}
                  </Text>
                </View>

                <Text style={styles.estadoDetalle}>
                  Estado: {estadoInfo(ventaSeleccionada.estado).texto}
                </Text>

                <TouchableOpacity
                  style={styles.botonCerrar}
                  onPress={() => setVentaSeleccionada(null)}
                >
                  <Text style={styles.textoBoton}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F8',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 12,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  numero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 5,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E65C0',
    marginTop: 8,
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  estado: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  entregado: {
    color: '#16834A',
    backgroundColor: '#DDF5E7',
  },
  enCamino: {
    color: '#1E65C0',
    backgroundColor: '#E4EEFC',
  },
  enPreparacion: {
    color: '#B7791F',
    backgroundColor: '#FFF1CC',
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  vacio: {
    textAlign: 'center',
    color: '#8A93A6',
    marginTop: 30,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  contenidoModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 18,
    marginBottom: 8,
  },
  producto: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF2',
    paddingVertical: 9,
  },
  nombreProducto: {
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  resumen: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
    marginTop: 12,
    paddingTop: 10,
  },
  estadoDetalle: {
    color: '#0D1B3E',
    fontWeight: 'bold',
    marginTop: 12,
    textTransform: 'capitalize',
  },
  botonCerrar: {
    backgroundColor: '#64748B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 9,
  },
});

