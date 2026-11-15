import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarMovimientos } from '../../servicios/api';

const filtros = [
  { valor: 'TODOS', texto: 'Todos' },
  { valor: 'ENTRADA', texto: 'Entradas' },
  { valor: 'SALIDA', texto: 'Salidas' },
];

export default function MovimientosAlmacen() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      const lista = await listarMovimientos(null, filtro === 'TODOS' ? null : filtro);
      setMovimientos(Array.isArray(lista) ? lista : []);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message || 'No se pudieron cargar los movimientos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [filtro]);

  useFocusEffect(
    useCallback(() => {
      cargar(true);
    }, [cargar])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargar(false);
  };

  const entradas = movimientos.filter((movimiento) => movimiento.tipo === 'ENTRADA').length;
  const salidas = movimientos.filter((movimiento) => movimiento.tipo === 'SALIDA').length;

  const renderMovimiento = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.filaEntre}>
        <Text style={[styles.tipo, item.tipo === 'ENTRADA' ? styles.entrada : styles.salida]}>
          {item.tipo}
        </Text>
        <Text style={styles.fecha}>{item.fecha}</Text>
      </View>

      <Text style={styles.nombre}>{item.productoNombre}</Text>

      <View style={styles.filaDatos}>
        <Text style={styles.dato}>
          Cantidad: <Text style={styles.datoFuerte}>{item.cantidad}</Text>
        </Text>
        <Text style={styles.dato}>
          Stock: <Text style={styles.datoFuerte}>{item.stockAnterior} a {item.stockNuevo}</Text>
        </Text>
      </View>

      {item.referencia ? <Text style={styles.referencia}>Ref: {item.referencia}</Text> : null}
      {item.observacion ? <Text style={styles.observacion}>{item.observacion}</Text> : null}
      {item.usuarioNombre ? (
        <Text style={styles.usuario}>Registrado por: {item.usuarioNombre}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Kardex de movimientos</Text>
      <Text style={styles.subtitulo}>Entradas y salidas registradas en el almacén.</Text>

      <View style={styles.filtros}>
        {filtros.map((opcion) => {
          const activo = filtro === opcion.valor;
          return (
            <TouchableOpacity
              key={opcion.valor}
              style={[styles.filtro, activo && styles.filtroActivo]}
              onPress={() => setFiltro(opcion.valor)}
            >
              <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]}>
                {opcion.texto}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.resumen}>
        <View style={styles.resumenCaja}>
          <Text style={styles.resumenNumero}>{entradas}</Text>
          <Text style={styles.resumenTexto}>Entradas</Text>
        </View>
        <View style={styles.resumenCaja}>
          <Text style={styles.resumenNumero}>{salidas}</Text>
          <Text style={styles.resumenTexto}>Salidas</Text>
        </View>
        <View style={styles.resumenCaja}>
          <Text style={styles.resumenNumero}>{movimientos.length}</Text>
          <Text style={styles.resumenTexto}>Movimientos</Text>
        </View>
      </View>

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {cargando && movimientos.length === 0 ? (
        <View style={styles.cargando}>
          <ActivityIndicator color="#1E65C0" />
          <Text style={styles.textoCargando}>Cargando movimientos...</Text>
        </View>
      ) : (
        <FlatList
          data={movimientos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMovimiento}
          showsVerticalScrollIndicator={false}
          style={styles.listaContenedor}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>No hay movimientos registrados</Text>
              <Text style={styles.subtextoVacio}>
                Las entradas manuales y las salidas por pedidos aparecerán aquí.
              </Text>
            </View>
          }
        />
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
  subtitulo: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 3,
    marginBottom: 10,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filtro: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  filtroActivo: {
    backgroundColor: '#1E65C0',
  },
  filtroTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  filtroTextoActivo: {
    color: '#fff',
  },
  resumen: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  resumenCaja: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  resumenTexto: {
    fontSize: 10,
    color: '#8A93A6',
    marginTop: 1,
  },
  listaContenedor: {
    flex: 1,
  },
  lista: {
    paddingBottom: 25,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
  },
  filaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
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
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 7,
  },
  filaDatos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 5,
  },
  dato: {
    fontSize: 12,
    color: '#68758B',
  },
  datoFuerte: {
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  referencia: {
    fontSize: 11,
    color: '#1E65C0',
    marginTop: 6,
    fontWeight: 'bold',
  },
  observacion: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 4,
  },
  usuario: {
    fontSize: 10,
    color: '#A3ACBC',
    marginTop: 5,
  },
  mensaje: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
    textAlign: 'center',
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
    textAlign: 'center',
  },
});
