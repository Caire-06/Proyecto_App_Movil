
import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { obtenerReporte } from '../../servicios/api';

export default function ReportesAdmin() {
  const [filtro, setFiltro] = useState('Mes');
  const [info, setInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  // Consulta los reportes del período seleccionado.
  const cargarReporte = useCallback(async () => {
    try {
      setError('');

      const respuesta = await obtenerReporte(filtro);
      setInfo(respuesta);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los reportes.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [filtro]);

  // Actualiza los datos cuando cambia el período.
  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const actualizar = () => {
    setActualizando(true);
    cargarReporte();
  };

  const formatoMoneda = (valor) => {
    return `S/ ${Number(valor || 0).toFixed(2)}`;
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Reportes</Text>

      <View style={styles.fila}>
        {['Semana', 'Mes', 'Año'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtro,
              filtro === f && styles.filtroActivo,
            ]}
            onPress={() => setFiltro(f)}
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === f && styles.textoFiltroActivo,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={actualizar}
          />
        }
      >
        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="large" color="#1E65C0" />
            <Text style={styles.mensaje}>Cargando reportes...</Text>
          </View>
        ) : error ? (
          <View style={styles.estado}>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={actualizar}
            >
              <Text style={styles.textoBoton}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : info ? (
          <>
            <View style={styles.filaCajas}>
              <View style={styles.caja}>
                <Text style={styles.numero}>
                  {formatoMoneda(info.totalVentas)}
                </Text>
                <Text style={styles.texto}>
                  Ventas {filtro.toLowerCase()}
                </Text>
              </View>

              <View style={styles.caja}>
                <Text style={styles.numero}>
                  {info.cantidadPedidos}
                </Text>
                <Text style={styles.texto}>Pedidos</Text>
              </View>
            </View>

            <View style={styles.filaCajas}>
              <View style={styles.caja}>
                <Text style={styles.numero}>
                  {formatoMoneda(info.ticketPromedio)}
                </Text>
                <Text style={styles.texto}>Ticket promedio</Text>
              </View>

              <View style={styles.caja}>
                <Text style={styles.numeroTop}>
                  {info.productoMasVendido || 'Sin ventas'}
                </Text>
                <Text style={styles.texto}>Más vendido</Text>
              </View>
            </View>

            <Text style={styles.seccion}>
              Ventas por categoría
            </Text>

            {info.ventasPorCategoria?.length > 0 ? (
              info.ventasPorCategoria.map((c, index) => {
                const porcentaje = Math.min(
                  Math.max(Number(c.porcentaje) || 0, 0),
                  100
                );

                return (
                  <View key={`${c.nombre}-${index}`} style={styles.barraFila}>
                    <Text style={styles.barraNombre}>
                      {c.nombre}
                    </Text>

                    <View style={styles.barraFondo}>
                      <View
                        style={[
                          styles.barraLlena,
                          { width: `${porcentaje}%` },
                        ]}
                      />
                    </View>

                    <Text style={styles.barraValor}>
                      {porcentaje.toFixed(0)}%
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.mensaje}>
                No hay ventas por categoría en este período.
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.mensaje}>
            No hay información disponible.
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
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 12,
  },
  fila: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filtro: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: '#1E65C0',
  },
  textoFiltro: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8A93A6',
  },
  textoFiltroActivo: {
    color: '#fff',
  },
  filaCajas: {
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
    justifyContent: 'center',
    minHeight: 85,
  },
  numero: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  numeroTop: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
    textAlign: 'center',
  },
  texto: {
    fontSize: 12,
    color: '#8A93A6',
    textAlign: 'center',
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
    marginBottom: 8,
  },
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  barraNombre: {
    width: 95,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  barraFondo: {
    flex: 1,
    height: 10,
    backgroundColor: '#E8ECF4',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barraLlena: {
    height: 10,
    backgroundColor: '#1E65C0',
    borderRadius: 5,
  },
  barraValor: {
    width: 38,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
    textAlign: 'right',
  },
  estado: {
    alignItems: 'center',
    padding: 30,
  },
  mensaje: {
    fontSize: 13,
    color: '#8A93A6',
    textAlign: 'center',
    marginTop: 12,
  },
  error: {
    fontSize: 13,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  botonReintentar: {
    backgroundColor: '#1E65C0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
