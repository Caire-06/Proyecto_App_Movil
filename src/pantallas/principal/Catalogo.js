import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const hilos = [
  { id: '1', nombre: 'Hilo Poliéster 150D', unidad: 'Cono x 5 kg', precio: 12.5, stock: 120, foto: require('../../../assets/hilo-polieter150.jpg') },
  { id: '2', nombre: 'Hilo Nylon Industrial', unidad: 'Cono x 5 kg', precio: 15.0, stock: 80, foto: require('../../../assets/hilo-nylon.jpg') },
  { id: '3', nombre: 'Hilo Poliéster 300D', unidad: 'Cono x 8 kg', precio: 18.5, stock: 0, foto: require('../../../assets/hilo-poliester300.jpg') },
  { id: '4', nombre: 'Hilo Texturizado 75D', unidad: 'Bobina x 3 kg', precio: 9.8, stock: 100, foto: require('../../../assets/hilo-texturizado75.jpg') },
];

const PRODUCTOS_CARRITO = '@productos_carrito'; 

export async function agregarAlCarrito(producto) {
if (!producto || producto.stock <= 0) {
    console.warn('El producto no tiene stock disponible');
    return false;
}
try{
  const carritoActual = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
    const carrito = carritoActual ? JSON.parse(carritoActual) : [];
    const indiceExistente = carrito.findIndex((item) => item.id === producto.id);

    if (indiceExistente !== -1) {
      
      carrito[indiceExistente].cantidad = (carrito[indiceExistente].cantidad || 1) + 1;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1,
      });
}
  await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(carrito));
  console.log('Producto agregado al carrito con éxito:', producto.nombre);
    return true;
} catch (error) {
  console.error('Error al agregar el producto al carrito:', error);
    return false;
  }

}
export default function Catalogo() {
  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Catálogo</Text>
      <View style={styles.grilla}>
                {hilos.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.tarjetaHilo}
                    onPress={() => agregarAlCarrito(h)}
                  >
                    <Image source={h.foto} style={styles.fotoHilo} resizeMode="cover" />
                    <Text style={styles.nombreHilo}>{h.nombre}</Text>
                    <Text style={styles.unidadHilo}>{h.unidad}</Text>
                    <View style={styles.filaPrecio}>
                      <Text style={styles.precio}>S/ {h.precio.toFixed(2)}</Text>
                      <View style={styles.botonMas}>
                        <Text style={styles.textoMas}>+</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 50,
  },
  texto: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 8,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 20,
    marginTop: 20,
  },
  tarjetaHilo: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
  },
  fotoHilo: {
    width: '100%',
    height: 85,
    borderRadius: 10,
    marginBottom: 8,
  },
  nombreHilo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  unidadHilo: {
    fontSize: 11,
    color: '#8A93A6',
    marginBottom: 8,
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
  textoMas: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
