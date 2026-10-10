import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const hilosIniciales = [
  {
    id: '1',
    nombre: 'Hilo Poliéster 150D',
    unidad: 'Cono x 5 kg',
    precio: 12.5,
    stock: 120,
    categoria: 'Poliéster',
    foto: require('../../../assets/hilo-polieter150.jpg'),
  },
  {
    id: '2',
    nombre: 'Hilo Nylon Industrial',
    unidad: 'Cono x 5 kg',
    precio: 15.0,
    stock: 80,
    categoria: 'Nylon',
    foto: require('../../../assets/hilo-nylon.jpg'),
  },
  {
    id: '3',
    nombre: 'Hilo Poliéster 300D',
    unidad: 'Cono x 8 kg',
    precio: 18.5,
    stock: 0,
    categoria: 'Poliéster',
    foto: require('../../../assets/hilo-poliester300.jpg'),
  },
  {
    id: '4',
    nombre: 'Hilo Texturizado 75D',
    unidad: 'Bobina x 3 kg',
    precio: 9.8,
    stock: 100,
    categoria: 'Texturizados',
    foto: require('../../../assets/hilo-texturizado75.jpg'),
  },
];

const categorias = ['Todos', 'Poliéster', 'Nylon', 'Texturizado'];
const PRODUCTOS_CARRITO = '@productos_carrito';

export async function agregarAlCarrito(producto) {
  if (!producto || producto.stock <= 0) {
    return { ok: false, mensaje: 'Este producto no tiene stock disponible.' };
  }

  try {
    const datosActuales = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
    const carrito = datosActuales ? JSON.parse(datosActuales) : [];
    const indice = carrito.findIndex((item) => item.id === producto.id);

    if (indice >= 0) {
      carrito[indice] = {
        ...carrito[indice],
        cantidad: (carrito[indice].cantidad || 1) + 1,
      };
    } else {
      carrito.push({ ...producto, cantidad: 1 });
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
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  // Carga el catálogo inicial al abrir la pantalla.
  // Más adelante, esta carga se puede reemplazar por una petición fetch a una API REST.
  useEffect(() => {
    setProductos(hilosIniciales);
    setCargando(false);
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideNombre = producto.nombre.toLowerCase().includes(texto);
      
    const coincideCategoria =
      categoriaSeleccionada === 'Todos' ||
      producto.categoria ===
        (categoriaSeleccionada === 'Texturizado'
          ? 'Texturizados'
          : categoriaSeleccionada);


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
          accessibilityLabel="Buscar productos por nombre"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity
            onPress={() => setBusqueda('')}
            accessibilityLabel="Limpiar búsqueda"
          >
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
              accessibilityRole="button"
              accessibilityState={{ selected: seleccionada }}
            >
            <Text
              style={[
                styles.textoCategoria,
                seleccionada && styles.textoCategoriaSeleccionada,
                categoria === 'Texturizado' &&
                  styles.textoCategoriaTexturizado,
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
        <Text style={styles.mensajeEstado}>Cargando catálogo...</Text>
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
        >
          {productosFiltrados.map((producto) => {
            const sinStock = producto.stock <= 0;

            return (
              <View key={producto.id} style={styles.tarjetaHilo}>
                <Image
                  source={producto.foto}
                  style={styles.fotoHilo}
                  resizeMode="cover"
                />
                <Text style={styles.nombreHilo}>{producto.nombre}</Text>
                <Text style={styles.unidadHilo}>{producto.unidad}</Text>
                <Text style={styles.stock}>
                  {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
                </Text>

                <View style={styles.filaPrecio}>
                  <Text style={styles.precio}>S/ {producto.precio.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={[styles.botonMas, sinStock && styles.botonDeshabilitado]}
                    onPress={() => manejarAgregar(producto)}
                    disabled={sinStock}
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${producto.nombre} al carrito`}
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
    height: 104,
    marginTop: 10,
  },
  listaCategorias: {
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  /*chipCategoria: {
    height: 88,
    width: 92,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3ED',
  },*/

  chipCategoria: {
  height: 68,
  width: 76,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 22,
  paddingHorizontal: 5,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#DCE3ED',
},

  chipSeleccionado: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  textoCategoria: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  textoCategoriaTexturizado: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
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
    color: '#68758B',
    marginTop: 5,
    marginBottom: 8,
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
    marginTop: 30,
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
});

