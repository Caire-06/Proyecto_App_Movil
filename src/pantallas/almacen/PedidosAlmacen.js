import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarPedidos, cambiarEstadoPedido } from '../../servicios/api';

const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

// Presentación de cada estado del pedido.
const ESTADOS = {
  'en preparación': { texto: 'En preparación', color: '#B7791F', fondo: '#FFF1CC' },
  'en camino': { texto: 'En camino', color: '#1E65C0', fondo: '#E4EEFC' },
  entregado: { texto: 'Entregado', color: '#16834A', fondo: '#DDF5E7' },
};

const infoEstado = (estado) =>
  ESTADOS[estado] || { texto: estado, color: '#64748B', fondo: '#EEF1F6' };

export default function PedidosAlmacen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [filtro, setFiltro] = useState('en preparación');

  // Lista todos los pedidos (solo admin / almacén): GET /api/pedidos
  const cargar = useCallback(async () => {
    try {
      const datos = await listarPedidos();
      setPedidos(Array.isArray(datos) ? datos : []);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const refrescar = () => {
    setRefrescando(true);
    cargar();
  };

  // El almacén despacha el pedido: pasa de "en preparación" a "en camino".
  const marcarEnCamino = (pedido) => {
    Alert.alert(
      'Marcar en camino',
      `¿Confirmas que el pedido #${pedido.idPedido} salió del almacén?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setProcesandoId(pedido.idPedido);
              await cambiarEstadoPedido(pedido.idPedido, 'en camino');
              await cargar();
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo actualizar el pedido.');
            } finally {
              setProcesandoId(null);
            }
          },
        },
      ]
    );
  };

  const filtros = [
    { valor: 'en preparación', texto: 'En preparación' },
    { valor: 'en camino', texto: 'En camino' },
    { valor: 'entregado', texto: 'Entregados' },
  ];

  const visibles = pedidos.filter((pedido) => pedido.estado === filtro);

  const cabecera = (
    <View style={styles.cabecera}>
      <TouchableOpacity style={styles.botonAtras} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#0D1B3E" />
      </TouchableOpacity>
      <Text style={styles.tituloCabecera}>Pedidos</Text>
      <View style={styles.espacioAtras} />
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.fondo}>
        {cabecera}
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#1E65C0" />
          <Text style={styles.dato}>Cargando pedidos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fondo}>
      {cabecera}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filaFiltrosContenedor}
        contentContainerStyle={styles.filaFiltros}
      >
        {filtros.map((opcion) => {
          const cantidad = pedidos.filter((p) => p.estado === opcion.valor).length;
          const activo = filtro === opcion.valor;
          return (
            <TouchableOpacity
              key={opcion.valor}
              style={[styles.chip, activo && styles.chipActivo]}
              onPress={() => setFiltro(opcion.valor)}
            >
              <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>
                {opcion.texto} ({cantidad})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
        }
      >
        {visibles.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="cube-outline" size={54} color="#8A93A6" />
            <Text style={styles.textoVacio}>No hay pedidos en este estado</Text>
          </View>
        ) : (
          visibles.map((pedido) => {
            const info = infoEstado(pedido.estado);
            const procesando = procesandoId === pedido.idPedido;
            return (
              <View key={pedido.idPedido} style={styles.tarjeta}>
                <View style={styles.filaEncabezado}>
                  <View>
                    <Text style={styles.numero}>Pedido #{pedido.idPedido}</Text>
                    <Text style={styles.dato}>{pedido.fechaGeneracion}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: info.fondo }]}>
                    <Text style={[styles.textoBadge, { color: info.color }]}>{info.texto}</Text>
                  </View>
                </View>

                <Text style={styles.cliente}>{pedido.cliente}</Text>

                <View style={styles.divisor} />

                {(pedido.productos || []).map((item, index) => (
                  <View key={index} style={styles.filaItem}>
                    <Text style={styles.nombreItem} numberOfLines={1}>
                      <Text style={styles.cantidad}>{item.cantidad}x </Text>
                      {item.nombre}
                    </Text>
                    <Text style={styles.importe}>{formatearMoneda(item.importe)}</Text>
                  </View>
                ))}

                <View style={styles.divisor} />

                <View style={styles.filaPie}>
                  <Text style={styles.total}>{formatearMoneda(pedido.total)}</Text>

                  {pedido.estado === 'en preparación' ? (
                    <TouchableOpacity
                      style={styles.botonAccion}
                      onPress={() => marcarEnCamino(pedido)}
                      disabled={procesando}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="car-outline" size={16} color="#fff" />
                      <Text style={styles.textoAccion}>
                        {procesando ? 'Actualizando...' : 'Marcar en camino'}
                      </Text>
                    </TouchableOpacity>
                  ) : pedido.estado === 'en camino' ? (
                    <Text style={styles.esperando}>Esperando confirmación del cliente</Text>
                  ) : (
                    <Text style={styles.recibido}>Recibido por el cliente</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  botonAtras: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  espacioAtras: {
    width: 36,
  },
  tituloCabecera: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaFiltrosContenedor: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filaFiltros: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    paddingBottom: 12,
  },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E2EE',
  },
  chipActivo: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  textoChip: {
    fontSize: 12,
    color: '#556987',
    fontWeight: '600',
  },
  textoChipActivo: {
    color: '#fff',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  textoBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cliente: {
    fontSize: 12,
    color: '#556987',
    marginTop: 8,
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F4F9',
    marginVertical: 12,
  },
  filaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  nombreItem: {
    flex: 1,
    fontSize: 12,
    color: '#2C3E50',
  },
  cantidad: {
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  importe: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B3E',
  },
  filaPie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  total: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E65C0',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  textoAccion: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  esperando: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    color: '#B7791F',
    fontWeight: '600',
  },
  recibido: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    color: '#16834A',
    fontWeight: '600',
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
});
