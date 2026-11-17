import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarProductos } from '../../servicios/api';
import { fuenteImagen } from '../../utilidades/imagenesProducto';
import { agregarAlCarrito } from './Catalogo';

const imagenPorDefecto = require('../../../assets/logo-sautex.png');

export default function Inicio({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargarProductos = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      setError('');
      const respuesta = await listarProductos();
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.productos || [];
      setProductos(lista);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los productos del servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos(true);
    }, [cargarProductos])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargarProductos(false);
  };

  const manejarAgregarRapido = async (producto) => {
    const prodNormalizado = {
      ...producto,
      id: String(producto.id),
      unidad: producto.unidad || producto.presentacion || producto.categoria || 'Unidad',
      foto: fuenteImagen(producto.imagen || producto.foto) || imagenPorDefecto,
    };
    const resultado = await agregarAlCarrito(prodNormalizado);
    Alert.alert(resultado.ok ? 'Producto agregado' : 'Aviso', resultado.mensaje);
  };

  const destacados = productos.slice(0, 6);

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <View style={styles.filaCabecera}>
          <Image source={require('../../../assets/logo-sautex.png')} style={styles.logo} />
          <View>
            <Text style={styles.textoSautex}>SAUTEX E.I.R.L.</Text>
            <Text style={styles.textoHilos}>Hilos industriales</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.campana}
          onPress={() =>
            Alert.alert(
              'Catálogo SAUTEX',
              `Actualmente contamos con ${productos.length} productos disponibles en nuestro catálogo en línea.`
            )
          }
        >
          <Ionicons name="notifications-outline" size={20} color="#0D1B3E" />
          {productos.length > 0 && <View style={styles.puntoNotificacion} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={['#1E65C0']} />
        }
      >
        <View style={styles.banner}>
          <Text style={styles.bannerHola}>Bienvenido a SAUTEX</Text>
          <Text style={styles.bannerTitulo}>Encuentra los hilos para tu producción</Text>
          <Text style={styles.bannerSubtitulo}>
            {productos.length} {productos.length === 1 ? 'producto registrado' : 'productos disponibles'} en stock
          </Text>
          <TouchableOpacity
            style={styles.botonBanner}
            onPress={() => navigation.navigate('Catalogo')}
          >
            <Text style={styles.textoBotonBanner}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filaSeccion}>
          <Text style={styles.seccion}>Destacados</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catalogo')}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <View style={styles.estadoCaja}>
            <ActivityIndicator size="large" color="#1E65C0" />
            <Text style={styles.textoEstado}>Cargando productos del servidor...</Text>
          </View>
        ) : error !== '' ? (
          <View style={styles.estadoCaja}>
            <Text style={styles.textoError}>{error}</Text>
            <TouchableOpacity style={styles.botonReintentar} onPress={() => cargarProductos(true)}>
              <Text style={styles.textoReintentar}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : destacados.length === 0 ? (
          <View style={styles.estadoCaja}>
            <Text style={styles.textoEstado}>No hay productos registrados en el servidor.</Text>
          </View>
        ) : (
          <View style={styles.grilla}>
            {destacados.map((h) => {
              const sinStock = Number(h.stock ?? 0) <= 0;
              const imgSource = fuenteImagen(h.imagen || h.foto) || imagenPorDefecto;

              return (
                <TouchableOpacity
                  key={String(h.id)}
                  style={styles.tarjetaHilo}
                  onPress={() => navigation.navigate('Catalogo')}
                >
                  <Image source={imgSource} style={styles.fotoHilo} resizeMode="cover" />
                  <Text style={styles.nombreHilo} numberOfLines={2}>
                    {h.nombre}
                  </Text>
                  <Text style={styles.unidadHilo}>
                    {h.unidad || h.presentacion || h.categoria || 'Cono industrial'}
                  </Text>
                  <Text style={[styles.stockHilo, sinStock && styles.sinStockTexto]}>
                    {sinStock ? 'Sin stock' : `Stock: ${h.stock} unid.`}
                  </Text>
                  <View style={styles.filaPrecio}>
                    <Text style={styles.precio}>S/ {Number(h.precio || 0).toFixed(2)}</Text>
                    <TouchableOpacity
                      style={[styles.botonMas, sinStock && styles.botonDeshabilitado]}
                      onPress={() => manejarAgregarRapido(h)}
                      disabled={sinStock}
                    >
                      <Text style={styles.textoMas}>{sinStock ? '×' : '+'}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 12,
  },
  filaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 10,
  },
  textoSautex: {
    fontSize: 11,
    color: '#8A93A6',
  },
  textoHilos: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  campana: {
    width: 38,
    height: 38,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  puntoNotificacion: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E65C0',
  },
  banner: {
    backgroundColor: '#0A1440',
    borderRadius: 20,
    margin: 18,
    padding: 20,
  },
  bannerHola: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  bannerSubtitulo: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 15,
  },
  botonBanner: {
    backgroundColor: '#4FC3F7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  textoBotonBanner: {
    color: '#0A1440',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filaSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 5,
    marginBottom: 10,
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  verTodos: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 20,
  },
  tarjetaHilo: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  fotoHilo: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFD',
  },
  nombreHilo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D1B3E',
    minHeight: 32,
  },
  unidadHilo: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 2,
  },
  stockHilo: {
    fontSize: 11,
    color: '#2E9E5B',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '600',
  },
  sinStockTexto: {
    color: '#E53935',
  },
  filaPrecio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  botonMas: {
    width: 28,
    height: 28,
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#AAB3C2',
  },
  textoMas: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  estadoCaja: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoEstado: {
    color: '#68758B',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  textoError: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  botonReintentar: {
    backgroundColor: '#1E65C0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoReintentar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});