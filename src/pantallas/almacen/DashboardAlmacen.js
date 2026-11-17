import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { obtenerResumenAlmacen, listarPedidos } from '../../servicios/api';

const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

export default function DashboardAlmacen({ navigation }) {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [alertasRevisadas, setAlertasRevisadas] = useState(false);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const datos = await obtenerResumenAlmacen();
      setResumen(datos);
      setAlertasRevisadas(false);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message || 'No se pudo cargar el panel de almacén');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }

    // Cuenta los pedidos que el almacén todavía debe preparar.
    try {
      const pedidos = await listarPedidos();
      const pendientes = Array.isArray(pedidos)
        ? pedidos.filter((p) => p.estado === 'en preparación').length
        : 0;
      setPedidosPendientes(pendientes);
    } catch (error) {
      setPedidosPendientes(0);
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

  const categorias = resumen?.categorias || [];
  const alertas = resumen?.alertas || [];
  const movimientos = resumen?.ultimosMovimientos || [];
  const agotados = alertas.filter((p) => Number(p.stock ?? 0) <= 0).length;
  const notificacionesPendientes = alertasRevisadas ? 0 : alertas.length;

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.titulo}>Almacén</Text>
          <Text style={styles.subtitulo}>Control de inventario y alertas de stock</Text>
        </View>
        <TouchableOpacity
          style={styles.botonCampana}
          onPress={() => setModalNotificaciones(true)}
        >
          <Ionicons
            name={
              notificacionesPendientes > 0
                ? 'notifications'
                : 'notifications-outline'
            }
            size={22}
            color="#0D1B3E"
          />
          {notificacionesPendientes > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{notificacionesPendientes}</Text>
            </View>
          )}
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
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refrescar}
              colors={['#1E65C0']}
            />
          }
        >
          {alertas.length > 0 && (
            <TouchableOpacity
              style={[
                styles.bannerNotificacion,
                agotados > 0 && styles.bannerCritico,
              ]}
              onPress={() => setModalNotificaciones(true)}
            >
              <Ionicons
                name={agotados > 0 ? 'alert-circle' : 'warning'}
                size={22}
                color={agotados > 0 ? '#C62828' : '#B7791F'}
              />
              <View style={styles.bannerTextos}>
                <Text
                  style={[
                    styles.bannerTitulo,
                    agotados > 0 && styles.bannerTituloCritico,
                  ]}
                >
                  {agotados > 0
                    ? `¡Reposición urgente! ${agotados} producto(s) sin stock`
                    : `${alertas.length} producto(s) requieren reposición`}
                </Text>
                <Text style={styles.bannerSub}>
                  Toca para ver las notificaciones y registrar entradas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#68758B" />
            </TouchableOpacity>
          )}

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
              <Text style={styles.numero}>
                {formatearMoneda(resumen?.valorInventario)}
              </Text>
              <Text style={styles.texto}>Valor inventario</Text>
            </View>
            <View style={styles.caja}>
              <Text style={styles.numero}>
                {resumen?.productosStockBajo ?? 0}
              </Text>
              <Text style={styles.texto}>Stock bajo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.tarjetaPedidos}
            onPress={() => navigation.navigate('PedidosAlmacen')}
            activeOpacity={0.85}
          >
            <View style={styles.iconoPedidos}>
              <Ionicons name="clipboard-outline" size={22} color="#1E65C0" />
            </View>
            <View style={styles.textosPedidos}>
              <Text style={styles.tituloPedidos}>Pedidos por preparar</Text>
              <Text style={styles.subPedidos}>
                {pedidosPendientes > 0
                  ? `${pedidosPendientes} pedido(s) en preparación`
                  : 'No hay pedidos pendientes'}
              </Text>
            </View>
            {pedidosPendientes > 0 && (
              <View style={styles.contadorPedidos}>
                <Text style={styles.contadorPedidosTexto}>{pedidosPendientes}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#68758B" />
          </TouchableOpacity>

          <View style={styles.acciones}>
            <TouchableOpacity
              style={styles.accion}
              onPress={() => navigation.navigate('Entradas')}
            >
              <Ionicons name="arrow-down-circle" size={22} color="#1E65C0" />
              <Text style={styles.accionTexto}>Registrar entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accion}
              onPress={() => navigation.navigate('Kardex')}
            >
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
                    {categoria.productos}{' '}
                    {categoria.productos === 1 ? 'producto' : 'productos'}
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
            alertas.map((producto) => {
              const sinStock = Number(producto.stock ?? 0) <= 0;
              return (
                <View
                  key={producto.id}
                  style={[styles.alerta, sinStock && styles.alertaCritica]}
                >
                  <View style={styles.filaEntre}>
                    <Text style={styles.nombre}>{producto.nombre}</Text>
                    <TouchableOpacity
                      style={styles.botonReponer}
                      onPress={() => navigation.navigate('Entradas')}
                    >
                      <Text style={styles.textoReponer}>+ Reponer</Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      styles.alertaTexto,
                      sinStock && styles.alertaTextoCritico,
                    ]}
                  >
                    {sinStock
                      ? 'Sin stock (0 unidades)'
                      : `Stock bajo: ${producto.stock} unidades`}
                  </Text>
                </View>
              );
            })
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
                      movimiento.tipo === 'ENTRADA'
                        ? styles.entrada
                        : styles.salida,
                    ]}
                  >
                    {movimiento.tipo}
                  </Text>
                  <Text style={styles.fecha}>{movimiento.fecha}</Text>
                </View>
                <Text style={styles.nombre}>{movimiento.productoNombre}</Text>
                <Text style={styles.dato}>
                  {movimiento.cantidad} unid. - Stock: {movimiento.stockAnterior}{' '}
                  a {movimiento.stockNuevo}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={modalNotificaciones}
        transparent
        animationType="slide"
        onRequestClose={() => setModalNotificaciones(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <View style={styles.modalCabecera}>
              <View style={styles.filaTituloModal}>
                <Ionicons name="notifications" size={20} color="#1E65C0" />
                <Text style={styles.modalTitulo}>
                  Notificaciones de stock
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalNotificaciones(false)}>
                <Ionicons name="close" size={24} color="#68758B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {alertas.length === 0 ? (
                <View style={styles.sinNotificaciones}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={42}
                    color="#2E9E5B"
                  />
                  <Text style={styles.sinNotifTitulo}>
                    Todo el stock está completo
                  </Text>
                  <Text style={styles.sinNotifSub}>
                    No hay alertas de reposición pendientes en el almacén.
                  </Text>
                </View>
              ) : (
                alertas.map((producto) => {
                  const sinStock = Number(producto.stock ?? 0) <= 0;
                  return (
                    <View
                      key={producto.id}
                      style={[
                        styles.itemNotificacion,
                        sinStock && styles.alertaCritica,
                      ]}
                    >
                      <Ionicons
                        name={sinStock ? 'close-circle' : 'warning'}
                        size={22}
                        color={sinStock ? '#D32F2F' : '#B7791F'}
                      />
                      <View style={styles.itemNotifInfo}>
                        <Text style={styles.nombre}>{producto.nombre}</Text>
                        <Text
                          style={[
                            styles.alertaTexto,
                            sinStock && styles.alertaTextoCritico,
                          ]}
                        >
                          {sinStock
                            ? 'Agotado (0 unidades)'
                            : `Stock bajo: ${producto.stock} unidades`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.botonReponer}
                        onPress={() => {
                          setModalNotificaciones(false);
                          navigation.navigate('Entradas');
                        }}
                      >
                        <Text style={styles.textoReponer}>Reponer</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.modalBotones}>
              {alertas.length > 0 && !alertasRevisadas && (
                <TouchableOpacity
                  style={styles.botonMarcarLeido}
                  onPress={() => {
                    setAlertasRevisadas(true);
                    setModalNotificaciones(false);
                  }}
                >
                  <Text style={styles.textoMarcarLeido}>
                    Marcar notificaciones como leídas
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.botonCerrarModal}
                onPress={() => setModalNotificaciones(false)}
              >
                <Text style={styles.textoCerrarModal}>Cerrar</Text>
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
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  subtitulo: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  botonCampana: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#D32F2F',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#F6AD55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  bannerCritico: {
    backgroundColor: '#FDE8E8',
    borderColor: '#FC8181',
  },
  bannerTextos: {
    flex: 1,
  },
  bannerTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B7791F',
  },
  bannerTituloCritico: {
    color: '#C62828',
  },
  bannerSub: {
    fontSize: 11,
    color: '#68758B',
    marginTop: 2,
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
  tarjetaPedidos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 2,
    marginBottom: 10,
    gap: 12,
  },
  iconoPedidos: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EBF2FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosPedidos: {
    flex: 1,
  },
  tituloPedidos: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  subPedidos: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  contadorPedidos: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E65C0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  contadorPedidosTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  alertaCritica: {
    backgroundColor: '#FDE8E8',
  },
  alertaTexto: {
    fontSize: 12,
    color: '#B7791F',
    fontWeight: 'bold',
    marginTop: 3,
  },
  alertaTextoCritico: {
    color: '#C62828',
  },
  botonReponer: {
    backgroundColor: '#1E65C0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  textoReponer: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 62, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCaja: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: '75%',
  },
  modalCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  filaTituloModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  itemNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemNotifInfo: {
    flex: 1,
  },
  sinNotificaciones: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  sinNotifTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 8,
  },
  sinNotifSub: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 4,
    textAlign: 'center',
  },
  modalBotones: {
    marginTop: 12,
    gap: 8,
  },
  botonMarcarLeido: {
    backgroundColor: '#EBF4FF',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoMarcarLeido: {
    color: '#1E65C0',
    fontWeight: 'bold',
    fontSize: 13,
  },
  botonCerrarModal: {
    backgroundColor: '#0D1B3E',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoCerrarModal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});