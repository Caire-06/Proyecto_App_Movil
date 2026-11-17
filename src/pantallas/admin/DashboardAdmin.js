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
import { obtenerResumenDashboard } from '../../servicios/api';

export default function DashboardAdmin() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [alertasVistas, setAlertasVistas] = useState(false);

  const cargarDashboard = useCallback(async () => {
    try {
      setError('');
      const respuesta = await obtenerResumenDashboard();
      setDatos(respuesta);
      setAlertasVistas(false);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDashboard();
    }, [cargarDashboard])
  );

  const moneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  if (cargando && !datos) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#1E65C0" />
        <Text style={styles.textoCargando}>Cargando panel...</Text>
      </View>
    );
  }

  if (error && !datos) {
    return (
      <View style={styles.cargando}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.reintentar} onPress={cargarDashboard}>
          Volver a intentar
        </Text>
      </View>
    );
  }

  const alertas = datos?.alertasInventario || [];
  const agotados = alertas.filter((a) => Number(a.stock ?? 0) <= 0).length;
  const pendientes = alertasVistas ? 0 : alertas.length;

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.titulo}>Panel Administrador</Text>
          <Text style={styles.subtitulo}>Resumen general y alertas de stock</Text>
        </View>
        <TouchableOpacity
          style={styles.botonCampana}
          onPress={() => setModalNotificaciones(true)}
        >
          <Ionicons
            name={pendientes > 0 ? 'notifications' : 'notifications-outline'}
            size={22}
            color="#0D1B3E"
          />
          {pendientes > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{pendientes}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={cargarDashboard} />
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
                  ? `¡Atención! ${agotados} producto(s) agotado(s)`
                  : `${alertas.length} alerta(s) de stock bajo`}
              </Text>
              <Text style={styles.bannerSub}>
                Toca aquí para abrir el centro de notificaciones de stock
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#68758B" />
          </TouchableOpacity>
        )}

        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>{moneda(datos?.totalVendido)}</Text>
            <Text style={styles.texto}>Total vendido</Text>
          </View>

          <View style={styles.caja}>
            <Text style={styles.numero}>{datos?.cantidadPedidos ?? 0}</Text>
            <Text style={styles.texto}>Pedidos</Text>
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>{datos?.cantidadProductos ?? 0}</Text>
            <Text style={styles.texto}>Productos</Text>
          </View>

          <View style={styles.caja}>
            <Text style={styles.numero}>{datos?.cantidadUsuarios ?? 0}</Text>
            <Text style={styles.texto}>Usuarios</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Ventas recientes</Text>

        {datos?.ventasRecientes?.length > 0 ? (
          datos.ventasRecientes.map((venta) => (
            <View style={styles.tarjeta} key={venta.idPedido}>
              <Text style={styles.nombre}>
                Pedido #{venta.idPedido} - {venta.cliente}
              </Text>
              <Text style={styles.dato}>
                {moneda(venta.total)} · {venta.fecha}
              </Text>
              <Text style={styles.estado}>{venta.estado}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.vacio}>Todavía no hay ventas registradas.</Text>
        )}

        <Text style={styles.seccion}>Más vendidos</Text>

        {datos?.productosMasVendidos?.length > 0 ? (
          datos.productosMasVendidos.map((producto) => (
            <View style={styles.tarjeta} key={producto.idProducto}>
              <Text style={styles.nombre}>{producto.nombre}</Text>
              <Text style={styles.dato}>{producto.vendidos} vendidos</Text>
            </View>
          ))
        ) : (
          <Text style={styles.vacio}>No hay productos vendidos.</Text>
        )}

      </ScrollView>

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
                    Inventario en niveles óptimos
                  </Text>
                  <Text style={styles.sinNotifSub}>
                    No existen alertas de stock bajo ni productos agotados.
                  </Text>
                </View>
              ) : (
                alertas.map((item) => {
                  const esCero = Number(item.stock ?? 0) <= 0;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemNotificacion,
                        esCero && styles.itemNotificacionCritica,
                      ]}
                    >
                      <Ionicons
                        name={esCero ? 'close-circle' : 'warning'}
                        size={22}
                        color={esCero ? '#D32F2F' : '#B7791F'}
                      />
                      <View style={styles.itemNotifInfo}>
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text
                          style={[
                            styles.alertaTexto,
                            esCero && styles.alertaTextoCritico,
                          ]}
                        >
                          {esCero
                            ? 'Producto agotado en almacén (0 unid.)'
                            : `Quedan solo ${item.stock} unidades en inventario`}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.modalBotones}>
              {alertas.length > 0 && !alertasVistas && (
                <TouchableOpacity
                  style={styles.botonMarcarLeido}
                  onPress={() => {
                    setAlertasVistas(true);
                    setModalNotificaciones(false);
                  }}
                >
                  <Text style={styles.textoMarcarLeido}>
                    Marcar como revisadas
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
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F8',
  },
  textoCargando: {
    marginTop: 10,
    color: '#8A93A6',
  },
  error: {
    color: '#D32F2F',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  reintentar: {
    color: '#1E65C0',
    fontWeight: 'bold',
    marginTop: 15,
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
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    marginTop: 3,
  },
  estado: {
    fontSize: 11,
    color: '#1E65C0',
    marginTop: 4,
    textTransform: 'capitalize',
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
  filaAlerta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  etiquetaNivel: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  etiquetaRoja: {
    backgroundColor: '#FEB2B2',
    color: '#9B2C2C',
  },
  etiquetaAmbar: {
    backgroundColor: '#FBD38D',
    color: '#975A16',
  },
  alertaTexto: {
    fontSize: 12,
    color: '#B7791F',
    fontWeight: 'bold',
  },
  alertaTextoCritico: {
    color: '#C62828',
  },
  vacio: {
    fontSize: 12,
    color: '#8A93A6',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
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
  itemNotificacionCritica: {
    backgroundColor: '#FDE8E8',
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