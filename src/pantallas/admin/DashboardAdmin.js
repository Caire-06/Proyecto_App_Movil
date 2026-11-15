
import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import { obtenerResumenDashboard } from '../../servicios/api';

export default function DashboardAdmin() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarDashboard = useCallback(async () => {
    try {
      setError('');
      const respuesta = await obtenerResumenDashboard();
      setDatos(respuesta);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const moneda = (valor) =>
    `S/ ${Number(valor || 0).toFixed(2)}`;

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#1E65C0" />
        <Text style={styles.textoCargando}>Cargando panel...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.cargando}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.reintentar} onPress={cargarDashboard}>
          Volver a intentar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Panel</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarDashboard}
          />
        }
      >
        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>
              {moneda(datos.totalVendido)}
            </Text>
            <Text style={styles.texto}>Total vendido</Text>
          </View>

          <View style={styles.caja}>
            <Text style={styles.numero}>
              {datos.cantidadPedidos}
            </Text>
            <Text style={styles.texto}>Pedidos</Text>
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>
              {datos.cantidadProductos}
            </Text>
            <Text style={styles.texto}>Productos</Text>
          </View>

          <View style={styles.caja}>
            <Text style={styles.numero}>
              {datos.cantidadUsuarios}
            </Text>
            <Text style={styles.texto}>Usuarios</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Ventas recientes</Text>

        {datos.ventasRecientes.length > 0 ? (
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

        {datos.productosMasVendidos.length > 0 ? (
          datos.productosMasVendidos.map((producto) => (
            <View style={styles.tarjeta} key={producto.idProducto}>
              <Text style={styles.nombre}>{producto.nombre}</Text>
              <Text style={styles.dato}>
                {producto.vendidos} vendidos
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.vacio}>No hay productos vendidos.</Text>
        )}

        <Text style={styles.seccion}>Alertas de inventario</Text>

        {datos.alertasInventario.length > 0 ? (
          datos.alertasInventario.map((alerta) => (
            <View style={styles.alerta} key={alerta.id}>
              <Text style={styles.nombre}>{alerta.nombre}</Text>
              <Text style={styles.alertaTexto}>
                Stock bajo: {alerta.stock} unidades
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.vacio}>
            No hay alertas de inventario.
          </Text>
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
    paddingHorizontal: 15,
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
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 12,
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
  alertaTexto: {
    fontSize: 12,
    color: '#B7791F',
    fontWeight: 'bold',
  },
  vacio: {
    fontSize: 12,
    color: '#8A93A6',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
});
