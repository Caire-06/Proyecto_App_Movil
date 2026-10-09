import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PEDIDOS_INICIALES = [
  {
    id: 'PED-1042',
    fecha: '08/10/2026',
    estado: 'Entregado',
    colorEstado: '#2ECC71',
    metodoPago: 'Transferencia BCP',
    articulos: [
      { nombre: 'Hilo Poliéster 150D', cantidad: 4, precioUnit: 12.5, subtotal: 50.0 },
      { nombre: 'Hilo Nylon Industrial', cantidad: 2, precioUnit: 15.0, subtotal: 30.0 },
    ],
    total: 80.0,
  },
  {
    id: 'PED-1039',
    fecha: '25/09/2026',
    estado: 'En camino',
    colorEstado: '#F39C12',
    metodoPago: 'Yape / Plin',
    articulos: [
      { nombre: 'Hilo Poliéster 300D', cantidad: 3, precioUnit: 18.5, subtotal: 55.5 },
    ],
    total: 55.5,
  },
  {
    id: 'PED-1021',
    fecha: '12/09/2026',
    estado: 'Entregado',
    colorEstado: '#2ECC71',
    metodoPago: 'Tarjeta de Crédito',
    articulos: [
      { nombre: 'Hilo Texturizado 75D', cantidad: 5, precioUnit: 9.8, subtotal: 49.0 },
      { nombre: 'Hilo Poliéster 150D', cantidad: 2, precioUnit: 12.5, subtotal: 25.0 },
    ],
    total: 74.0,
  },
];

export default function Compras({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarPedidos = async () => {
    try {
      const guardados = await AsyncStorage.getItem('@historial_pedidos');
      if (guardados !== null) {
        setPedidos(JSON.parse(guardados));
      } else {
        await AsyncStorage.setItem('@historial_pedidos', JSON.stringify(PEDIDOS_INICIALES));
        setPedidos(PEDIDOS_INICIALES);
      }
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

  // Simula una compra con productos y montos variados
  const simularNuevaCompra = async () => {
    const catalogo = [
      { nombre: 'Hilo Poliéster 150D', precioUnit: 12.5 },
      { nombre: 'Hilo Nylon Industrial', precioUnit: 15.0 },
      { nombre: 'Hilo Poliéster 300D', precioUnit: 18.5 },
      { nombre: 'Hilo Texturizado 75D', precioUnit: 9.8 },
    ];

    // Selecciona 1 o 2 tipos de hilo al azar
    const cantidadTipos = Math.random() > 0.5 ? 2 : 1;
    const itemsComprados = [];
    let totalCalculado = 0;

    for (let i = 0; i < cantidadTipos; i++) {
      const hiloAzar = catalogo[Math.floor(Math.random() * catalogo.length)];
      if (!itemsComprados.some((it) => it.nombre === hiloAzar.nombre)) {
        const cant = Math.floor(Math.random() * 4) + 1;
        const sub = hiloAzar.precioUnit * cant;
        itemsComprados.push({
          nombre: hiloAzar.nombre,
          cantidad: cant,
          precioUnit: hiloAzar.precioUnit,
          subtotal: sub,
        });
        totalCalculado += sub;
      }
    }

    const idNuevo = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const formasPago = ['Yape', 'Plin', 'Transferencia BCP', 'Tarjeta de Crédito'];
    const pagoAzar = formasPago[Math.floor(Math.random() * formasPago.length)];

    const nuevoPedido = {
      id: idNuevo,
      fecha: new Date().toLocaleDateString('es-PE'),
      estado: 'En camino',
      colorEstado: '#F39C12',
      metodoPago: pagoAzar,
      articulos: itemsComprados,
      total: totalCalculado,
    };

    try {
      const listaActualizada = [nuevoPedido, ...pedidos];
      await AsyncStorage.setItem('@historial_pedidos', JSON.stringify(listaActualizada));
      setPedidos(listaActualizada);
      Alert.alert('¡Compra registrada!', `Se generó el pedido ${idNuevo} por un total de S/ ${totalCalculado.toFixed(2)}.`);
    } catch (e) {
      console.log('Error al guardar pedido:', e);
    }
  };

  const abrirRecibo = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'Todos') return true;
    return p.estado === filtro;
  });

  return (
    <View style={styles.fondo}>
      {/* Cabecera */}
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.tituloCabecera}>Mis Compras</Text>
          <Text style={styles.subtituloCabecera}>Historial de pedidos realizados</Text>
        </View>
        <TouchableOpacity style={styles.botonSimular} onPress={simularNuevaCompra}>
          <Ionicons name="add-circle-outline" size={18} color="#1E65C0" />
          <Text style={styles.textoBotonSimular}>+ Probar compra</Text>
        </TouchableOpacity>
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
                  <Text style={styles.numeroPedido}>{pedido.id}</Text>
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
                  <Text style={styles.textoDato}>Pedido: <Text style={styles.negrita}>{pedidoSeleccionado.id}</Text></Text>
                  <Text style={styles.textoDato}>Fecha: {pedidoSeleccionado.fecha}</Text>
                  <Text style={styles.textoDato}>Método: {pedidoSeleccionado.metodoPago}</Text>
                  <Text style={styles.textoDato}>Estado: {pedidoSeleccionado.estado}</Text>
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
                  <Text style={styles.textoResumen}>S/ {(pedidoSeleccionado.total / 1.18).toFixed(2)}</Text>
                </View>
                <View style={styles.filaResumen}>
                  <Text style={styles.textoResumen}>IGV (18%):</Text>
                  <Text style={styles.textoResumen}>S/ {(pedidoSeleccionado.total - pedidoSeleccionado.total / 1.18).toFixed(2)}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  botonSimular: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FD',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  textoBotonSimular: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E65C0',
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