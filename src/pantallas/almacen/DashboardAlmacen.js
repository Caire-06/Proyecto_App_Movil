import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cerrarSesion } from '../../guardado/guardadoAcceso';
import { obtenerResumenAlmacen } from '../../servicios/api';

const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

export default function DashboardAlmacen({ navigation }) {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const datos = await obtenerResumenAlmacen();
      setResumen(datos);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message || 'No se pudo cargar el panel de almacén');
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

  const salir = async () => {
    await cerrarSesion();
    navigation.getParent()?.replace('InicioSesion');
  };

  const categorias = resumen?.categorias || [];
  const alertas = resumen?.alertas || [];
  const movimientos = resumen?.ultimosMovimientos || [];

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Almacén</Text>
        <TouchableOpacity style={styles.botonSalir} onPress={salir}>
          <Ionicons name="exit-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {cargando && resumen === null ? (
        <View style={styles.cargando}>
          <ActivityIndicator color="#1E65C0" />
          <Text style={styles.textoCargando}>Cargando información...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contenido}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
          }
        >
          <View style={styles.fila}>
            <View style={styles.caja}>
              <Text style={styles.numero}>{resumen?.totalProductos ?? 0}</Text>
              <Text style={styles.texto}>Productos</Text>
            </View>
            <View style={styles.caja}>
              <Text style={styles.numero}>{resumen?.stockTotal ?? 0}</Text>
              <Text style={styles.texto}>Stock total</Text>
            </View>
          </View>

          <View style={styles.fila}>
            <View style={styles.caja}>
              <Text style={styles.numero}>{formatearMoneda(resumen?.valorInventario)}</Text>
              <Text style={styles.texto}>Valor inventario</Text>
            </View>
            <View style={styles.caja}>
              <Text style={styles.numero}>{resumen?.productosStockBajo ?? 0}</Text>
              <Text style={styles.texto}>Stock bajo</Text>
            </View>
          </View>

          <View style={styles.acciones}>
            <TouchableOpacity style={styles.accion} onPress={() => navigation.navigate('Entradas')}>
              <Ionicons name="arrow-down-circle" size={22} color="#1E65C0" />
              <Text style={styles.accionTexto}>Registrar entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accion} onPress={() => navigation.navigate('Kardex')}>
              <Ionicons name="swap-vertical" size={22} color="#1E65C0" />
              <Text style={styles.accionTexto}>Ver kardex</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.seccion}>Productos por categoría</Text>
          {categorias.length === 0 ? (
            <Text style={styles.vacioTexto}>Sin categorías registradas.</Text>
          ) : (
            categorias.map((categoria) => (
              <View key={categoria.categoria} style={styles.tarjeta}>
                <View style={styles.filaEntre}>
                  <Text style={styles.nombre}>{categoria.categoria}</Text>
                  <Text style={styles.dato}>
                    {categoria.productos} {categoria.productos === 1 ? 'producto' : 'productos'}
                  </Text>
                </View>
                <Text style={styles.dato}>Stock: {categoria.stock} unid.</Text>
              </View>
            ))
          )}

          <Text style={styles.seccion}>Alertas de stock</Text>
          {alertas.length === 0 ? (
            <Text style={styles.vacioTexto}>No hay productos con stock bajo.</Text>
          ) : (
            alertas.map((producto) => (
              <View key={producto.id} style={styles.alerta}>
                <Text style={styles.nombre}>{producto.nombre}</Text>
                <Text style={styles.alertaTexto}>
                  {producto.stock <= 0
                    ? 'Sin stock'
                    : `Stock bajo: ${producto.stock} unidades`}
                </Text>
              </View>
            ))
          )}

          <Text style={styles.seccion}>Últimos movimientos</Text>
          {movimientos.length === 0 ? (
            <Text style={styles.vacioTexto}>Sin movimientos registrados.</Text>
          ) : (
            movimientos.map((movimiento) => (
              <View key={movimiento.id} style={styles.movimiento}>
                <View style={styles.filaEntre}>
                  <Text
                    style={[
                      styles.tipo,
                      movimiento.tipo === 'ENTRADA' ? styles.entrada : styles.salida,
                    ]}
                  >
                    {movimiento.tipo}
                  </Text>
                  <Text style={styles.fecha}>{movimiento.fecha}</Text>
                </View>
                <Text style={styles.nombre}>{movimiento.productoNombre}</Text>
                <Text style={styles.dato}>
                  {movimiento.cantidad} unid. - Stock: {movimiento.stockAnterior} a{' '}
                  {movimiento.stockNuevo}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  botonSalir: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 10,
    padding: 8,
  },
  contenido: {
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
    textAlign: 'center',
  },
  texto: {
    fontSize: 12,
    color: '#8A93A6',
    textAlign: 'center',
    marginTop: 2,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  accion: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  accionTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 14,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
  dato: {
    fontSize: 12,
    color: '#8A93A6',
  },
  alerta: {
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertaTexto: {
    fontSize: 12,
    color: '#B7791F',
    fontWeight: 'bold',
    marginTop: 3,
  },
  movimiento: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipo: {
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  entrada: {
    color: '#2E9E5B',
    backgroundColor: '#DFF5E6',
  },
  salida: {
    color: '#E53935',
    backgroundColor: '#FDE8E8',
  },
  fecha: {
    fontSize: 10,
    color: '#8A93A6',
  },
  vacioTexto: {
    fontSize: 12,
    color: '#8A93A6',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
});
