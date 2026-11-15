import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { solicitar } from '../../servicios/api';

// Adapta un pedido del backend (tabla pedidos) a la forma que usa esta pantalla
const adaptarPedido = (p) => {
  const estado = p.estado === 'entregado' ? 'Entregado' : 'En camino';
  return {
    id: p.idPedido,
    idUsuario: p.idUsuario,
    cliente: p.cliente,
    fecha: p.fechaGeneracion,
    estado,
    colorEstado: estado === 'Entregado' ? '#2ECC71' : '#F39C12',
    idProductos: p.idProductos || [],
    articulos: (p.productos || []).map((art) => ({
      productoId: art.productoId,
      nombre: art.nombre,
      cantidad: Number(art.cantidad) || 0,
      precioUnit: Number(art.precioUnitario) || 0,
      subtotal: Number(art.importe) || 0,
    })),
    subtotal: Number(p.subtotal) || 0,
    igv: Number(p.igv) || 0,
    total: Number(p.total) || 0,
  };
};

export default function Compras({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Lista los pedidos del usuario: GET /api/pedidos/mis-pedidos
  const cargarPedidos = async () => {
    try {
      const datos = await solicitar('/api/pedidos/mis-pedidos');
      setPedidos(Array.isArray(datos) ? datos.map(adaptarPedido) : []);
    } catch (e) {
      console.log('Error al leer pedidos:', e);
    }
  };

  // Se ejecuta automáticamente cada vez que tocas la pestaña "Compras"
  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  // Detalle del pedido según su id: GET /api/pedidos/{id}
  const abrirRecibo = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
    try {
      const detalle = await solicitar(`/api/pedidos/${pedido.id}`);
      setPedidoSeleccionado(adaptarPedido(detalle));
    } catch (e) {
      console.log('Error al leer el detalle del pedido:', e);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'Todos') return true;
    return p.estado === filtro;
  });

  return (
    <View style={styles.fondo}>
      {/* Cabecera limpia */}
      <View style={styles.cabecera}>
        <Text style={styles.tituloCabecera}>Mis Compras</Text>
        <Text style={styles.subtituloCabecera}>Historial de pedidos realizados</Text>
      </View>

      {/* Filtros por estado */}
      <View style={styles.filaFiltros}>
        {['Todos', 'En camino', 'Entregado'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.chipFiltro, filtro === tipo && styles.chipFiltroActivo]}
            onPress={() => setFiltro(tipo)}
          >
            <Text style={[styles.textoFiltro, filtro === tipo && styles.textoFiltroActivo]}>
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de pedidos */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {pedidosFiltrados.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="receipt-outline" size={54} color="#8A93A6" />
            <Text style={styles.textoVacio}>No tienes pedidos en esta categoría</Text>
          </View>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <View key={pedido.id} style={styles.tarjetaPedido}>
              <View style={styles.filaEncabezado}>
                <View>
                  <Text style={styles.numeroPedido}>Pedido #{pedido.id}</Text>
                  <Text style={styles.fechaPedido}>{pedido.fecha}</Text>
                </View>
                <View style={[styles.badgeEstado, { backgroundColor: `${pedido.colorEstado}20` }]}>
                  <Text style={[styles.textoBadge, { color: pedido.colorEstado }]}>
                    {pedido.estado}
                  </Text>
                </View>
              </View>

              <View style={styles.divisor} />

              <View style={styles.contenedorItems}>
                {pedido.articulos.map((item, idx) => (
                  <View key={idx} style={styles.filaItem}>
                    <Text style={styles.nombreItem}>
                      <Text style={styles.cantidadItem}>{item.cantidad}x </Text>
                      {item.nombre}
                    </Text>
                    <Text style={styles.precioItem}>S/ {item.subtotal.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divisor} />

              <View style={styles.filaPie}>
                <View>
                  <Text style={styles.labelTotal}>Total pagado</Text>
                  <Text style={styles.montoTotal}>S/ {pedido.total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.botonDetalle}
                  onPress={() => abrirRecibo(pedido)}
                >
                  <Text style={styles.textoBotonDetalle}>Ver recibo</Text>
                  <Ionicons name="chevron-forward" size={14} color="#1E65C0" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Boleta de Venta */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <View style={styles.cabeceraModal}>
              <Text style={styles.empresaModal}>SAUTEX E.I.R.L.</Text>
              <Text style={styles.rucModal}>RUC: 20601234567</Text>
              <Text style={styles.boletaModal}>BOLETA DE VENTA ELECTRÓNICA</Text>
            </View>

            {pedidoSeleccionado && (
              <>
                <View style={styles.datosBoleta}>
                  <Text style={styles.textoDato}>Pedido: <Text style={styles.negrita}>#{pedidoSeleccionado.id}</Text></Text>
                  <Text style={styles.textoDato}>ID usuario: {pedidoSeleccionado.idUsuario}</Text>
                  <Text style={styles.textoDato}>Cliente: {pedidoSeleccionado.cliente}</Text>
                  <Text style={styles.textoDato}>Fecha: {pedidoSeleccionado.fecha}</Text>
                  <Text style={styles.textoDato}>Estado: {pedidoSeleccionado.estado}</Text>
                  <Text style={styles.textoDato}>ID productos: {pedidoSeleccionado.idProductos.join(', ')}</Text>
                  <Text style={styles.textoDato}>Cantidades: {pedidoSeleccionado.articulos.map((a) => a.cantidad).join(', ')}</Text>
                </View>

                <View style={styles.divisor} />

                <ScrollView style={{ maxHeight: 180 }}>
                  {pedidoSeleccionado.articulos.map((art, i) => (
                    <View key={i} style={styles.filaBoletaItem}>
                      <Text style={styles.nombreBoleta}>{art.cantidad}x {art.nombre}</Text>
                      <Text style={styles.subtotalBoleta}>S/ {art.subtotal.toFixed(2)}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.divisor} />

                <View style={styles.filaResumen}>
                  <Text style={styles.textoResumen}>Subtotal (sin IGV):</Text>
                  <Text style={styles.textoResumen}>S/ {pedidoSeleccionado.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.filaResumen}>
                  <Text style={styles.textoResumen}>IGV (18%):</Text>
                  <Text style={styles.textoResumen}>S/ {pedidoSeleccionado.igv.toFixed(2)}</Text>
                </View>
                <View style={[styles.filaResumen, { marginTop: 6 }]}>
                  <Text style={styles.totalBoleta}>TOTAL:</Text>
                  <Text style={styles.totalBoleta}>S/ {pedidoSeleccionado.total.toFixed(2)}</Text>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalVisible(false)}>
              <Text style={styles.textoBotonCerrar}>Cerrar comprobante</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
  },
  cabecera: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  subtituloCabecera: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  filaFiltros: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipFiltro: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E2EE',
  },
  chipFiltroActivo: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  textoFiltro: {
    fontSize: 12,
    color: '#556987',
    fontWeight: '600',
  },
  textoFiltroActivo: {
    color: '#fff',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },
  tarjetaPedido: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numeroPedido: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  fechaPedido: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 2,
  },
  badgeEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  textoBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F4F9',
    marginVertical: 12,
  },
  contenedorItems: {
    gap: 6,
  },
  filaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cantidadItem: {
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  nombreItem: {
    fontSize: 12,
    color: '#2C3E50',
    flex: 1,
  },
  precioItem: {
    fontSize: 12,
    color: '#0D1B3E',
    fontWeight: '600',
  },
  filaPie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelTotal: {
    fontSize: 11,
    color: '#8A93A6',
  },
  montoTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  botonDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  textoBotonDetalle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  textoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 8,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cajaModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  cabeceraModal: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  empresaModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  rucModal: {
    fontSize: 11,
    color: '#8A93A6',
  },
  boletaModal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E65C0',
    marginTop: 4,
  },
  datosBoleta: {
    gap: 4,
  },
  textoDato: {
    fontSize: 12,
    color: '#556987',
  },
  negrita: {
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  filaBoletaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  nombreBoleta: {
    fontSize: 12,
    color: '#2C3E50',
    flex: 1,
  },
  subtotalBoleta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B3E',
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  textoResumen: {
    fontSize: 11,
    color: '#8A93A6',
  },
  totalBoleta: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  botonCerrarModal: {
    backgroundColor: '#0D1B3E',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  textoBotonCerrar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
