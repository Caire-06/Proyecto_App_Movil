import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { listarCategorias, listarProductos } from '../../servicios/api';
import { fuenteImagen } from '../../utilidades/imagenesProducto';

const PRODUCTOS_CARRITO = '@productos_carrito';
const imagenPorDefecto = require('../../../assets/logo-sautex.png');

export async function agregarAlCarrito(producto) {
  if (!producto || Number(producto.stock ?? 0) <= 0) {
    return { ok: false, mensaje: 'Este producto no tiene stock disponible.' };
  }

  try {
    const datosActuales = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
    const carrito = datosActuales ? JSON.parse(datosActuales) : [];
    const idProd = String(producto.id);
    const indice = carrito.findIndex((item) => String(item.id) === idProd);

    const fotoResuelta =
      producto.foto || fuenteImagen(producto.imagen) || imagenPorDefecto;

    if (indice >= 0) {
      const nuevaCantidad = (carrito[indice].cantidad || 1) + 1;
      if (nuevaCantidad > Number(producto.stock)) {
        return {
          ok: false,
          mensaje: `Solo hay ${producto.stock} unidades disponibles en stock.`,
        };
      }
      carrito[indice] = {
        ...carrito[indice],
        cantidad: nuevaCantidad,
      };
    } else {
      carrito.push({
        ...producto,
        id: idProd,
        unidad: producto.unidad || producto.presentacion || producto.categoria || 'Unidad',
        foto: fotoResuelta,
        cantidad: 1,
      });
    }

    await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(carrito));
    return { ok: true, mensaje: `${producto.nombre} se agregó al carrito.` };
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    return { ok: false, mensaje: 'No se pudo agregar el producto. Inténtalo nuevamente.' };
  }
}

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Todos']);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const cargarCatalogo = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) {
      setCargando(true);
    }
    try {
      setError('');
      const [respProductos, respCategorias] = await Promise.all([
        listarProductos(),
        listarCategorias().catch(() => []),
      ]);

      const listaProd = Array.isArray(respProductos)
        ? respProductos
        : respProductos?.productos || [];
      setProductos(listaProd);

      const listaCatRaw = Array.isArray(respCategorias)
        ? respCategorias
        : respCategorias?.categorias || [];
      const nombresCat = listaCatRaw
        .map((c) => (typeof c === 'string' ? c : c?.nombre || c?.categoria))
        .filter(Boolean);

      if (nombresCat.length > 0) {
        setCategorias(['Todos', ...new Set(nombresCat)]);
      } else {
        const extraidas = listaProd.map((p) => p.categoria).filter(Boolean);
        setCategorias(['Todos', ...new Set(extraidas)]);
      }
    } catch (e) {
      setError(e.message || 'No se pudo conectar con el servidor para cargar el catálogo.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCatalogo(true);
    }, [cargarCatalogo])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargarCatalogo(false);
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const nombre = (producto.nombre || '').toLowerCase();
      const coincideNombre = nombre.includes(texto);
      const coincideCategoria =
        categoriaSeleccionada === 'Todos' ||
        producto.categoria === categoriaSeleccionada;

      return coincideNombre && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const manejarAgregar = async (producto) => {
    const resultado = await agregarAlCarrito(producto);
    Alert.alert(resultado.ok ? 'Producto agregado' : 'No se pudo agregar', resultado.mensaje);
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Catálogo</Text>
      <Text style={styles.subtitulo}>Encuentra los hilos que necesitas</Text>

      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={20} color="#8A93A6" />
        <TextInput
          style={styles.campoBusqueda}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#8A93A6"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={20} color="#8A93A6" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        style={styles.scrollCategorias}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listaCategorias}
      >
        {categorias.map((categoria) => {
          const seleccionada = categoriaSeleccionada === categoria;

          return (
            <TouchableOpacity
              key={categoria}
              style={[styles.chipCategoria, seleccionada && styles.chipSeleccionado]}
              onPress={() => setCategoriaSeleccionada(categoria)}
            >
              <Text
                style={[
                  styles.textoCategoria,
                  seleccionada && styles.textoCategoriaSeleccionada,
                ]}
              >
                {categoria}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.contador}>
        {productosFiltrados.length}{' '}
        {productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
      </Text>

      {cargando ? (
        <View style={styles.vacio}>
          <ActivityIndicator size="large" color="#1E65C0" />
          <Text style={styles.mensajeEstado}>Cargando catálogo desde el servidor...</Text>
        </View>
      ) : error !== '' ? (
        <View style={styles.vacio}>
          <Ionicons name="cloud-offline-outline" size={38} color="#D32F2F" />
          <Text style={styles.textoVacio}>Error de conexión</Text>
          <Text style={styles.subtextoVacio}>{error}</Text>
          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={() => cargarCatalogo(true)}
          >
            <Text style={styles.textoReintentar}>Volver a intentar</Text>
          </TouchableOpacity>
        </View>
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="search-outline" size={36} color="#8A93A6" />
          <Text style={styles.textoVacio}>No encontramos productos</Text>
          <Text style={styles.subtextoVacio}>Prueba con otro nombre o categoría.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grilla}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refrescar}
              colors={['#1E65C0']}
            />
          }
        >
          {productosFiltrados.map((producto) => {
            const stockActual = Number(producto.stock ?? 0);
            const sinStock = stockActual <= 0;
            const imgSource =
              fuenteImagen(producto.imagen || producto.foto) || imagenPorDefecto;

            return (
              <View key={String(producto.id)} style={styles.tarjetaHilo}>
                <Image source={imgSource} style={styles.fotoHilo} resizeMode="cover" />
                <Text style={styles.nombreHilo} numberOfLines={2}>
                  {producto.nombre}
                </Text>
                <Text style={styles.unidadHilo}>
                  {producto.unidad || producto.presentacion || producto.categoria || 'Cono industrial'}
                </Text>
                <Text style={[styles.stock, sinStock && styles.sinStock]}>
                  {sinStock ? 'Sin stock' : `Stock: ${stockActual}`}
                </Text>

                <View style={styles.filaPrecio}>
                  <Text style={styles.precio}>
                    S/ {Number(producto.precio || 0).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.botonMas, sinStock && styles.botonDeshabilitado]}
                    onPress={() => manejarAgregar(producto)}
                    disabled={sinStock}
                  >
                    <Ionicons
                      name={sinStock ? 'close' : 'add'}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 48,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginHorizontal: 18,
  },
  subtitulo: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
    marginHorizontal: 18,
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 18,
    marginTop: 18,
    paddingHorizontal: 12,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  campoBusqueda: {
    flex: 1,
    color: '#0D1B3E',
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 10,
  },
  scrollCategorias: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 10,
    marginBottom: 4,
  },
  listaCategorias: {
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  chipCategoria: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipSeleccionado: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  textoCategoria: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  textoCategoriaSeleccionada: {
    color: '#fff',
  },
  contador: {
    fontSize: 12,
    color: '#68758B',
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 10,
  },
  tarjetaHilo: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 2,
  },
  fotoHilo: {
    width: '100%',
    height: 100,
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
  stock: {
    fontSize: 11,
    color: '#2E9E5B',
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 8,
  },
  sinStock: {
    color: '#E53935',
  },
  filaPrecio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  precio: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E65C0',
    flexShrink: 1,
  },
  botonMas: {
    width: 30,
    height: 30,
    backgroundColor: '#1E65C0',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#AAB3C2',
  },
  mensajeEstado: {
    textAlign: 'center',
    color: '#68758B',
    marginTop: 12,
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 10,
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
    textAlign: 'center',
  },
  botonReintentar: {
    marginTop: 14,
    backgroundColor: '#1E65C0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  textoReintentar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});