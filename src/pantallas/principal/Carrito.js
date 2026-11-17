import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTOS_CARRITO = '@productos_carrito';

export default function Carrito({ navigation }) {
  const [items, setItems] = useState([]);

  // Carga productos del carrito
  const cargarCarrito = useCallback(async () => {
    try {
      const datos = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
      const productos = datos ? JSON.parse(datos) : [];
      setItems(productos);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCarrito();
    }, [cargarCarrito])
  );

  // Aumentar en 1 unidad (+)
  const aumentarCantidad = async (productoId) => {
    const actualizados = items.map(item => {
      if (item.id === productoId) {
        return { ...item, cantidad: (Number(item.cantidad) || 1) + 1 };
      }
      return item;
    });
    setItems(actualizados);
    await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(actualizados));
  };

  // Disminuir en 1 unidad (-). Si llega a 1 y presiona menos, se retira del carrito
  const disminuirCantidad = async (productoId) => {
    let actualizados = [];
    for (const item of items) {
      if (item.id === productoId) {
        const nuevaCantidad = (Number(item.cantidad) || 1) - 1;
        if (nuevaCantidad > 0) {
          actualizados.push({ ...item, cantidad: nuevaCantidad });
        }
      } else {
        actualizados.push(item);
      }
    }
    setItems(actualizados);
    await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(actualizados));
  };

  // Eliminar el producto directamente sin confirmaciones
  const eliminarProducto = async (productoId) => {
    const actualizados = items.filter(item => item.id !== productoId);
    setItems(actualizados);
    await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(actualizados));
  };

  // Vaciar todo el carrito en un solo toque
  const vaciarCarrito = async () => {
    setItems([]);
    await AsyncStorage.removeItem(PRODUCTOS_CARRITO);
  };

  // Resumen del carrito: subtotal, IGV (18%) y total, igual que el backend
  const subtotal = items.reduce((acc, curr) => {
    const precio = Number(curr.precio) || 0;
    const cantidad = Number(curr.cantidad) || 1;
    return acc + (precio * cantidad);
  }, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  return (
    <View style={styles.fondo}>
      {/* Encabezado con título y opción de vaciar */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Carrito de Compras</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={vaciarCarrito} style={styles.botonVaciar}>
            <Text style={styles.textoVaciar}>Vaciar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Ionicons name="cart-outline" size={70} color="#B0B9C7" />
          <Text style={styles.textoVacio}>Tu carrito está vacío</Text>
          <Text style={styles.subtextoVacio}>Añade conos de hilo desde el Catálogo</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.itemTarjeta}>
                <Image source={item.foto} style={styles.fotoItem} resizeMode="cover" />
                
                <View style={styles.infoItem}>
                  <Text style={styles.nombreItem} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={styles.unidadItem}>{item.unidad}</Text>
                  <Text style={styles.precioItem}>S/ {Number(item.precio).toFixed(2)}</Text>
                </View>

                {/* Controles de cantidad (- [cant] +) y botón eliminar */}
                <View style={styles.derechaItem}>
                  <TouchableOpacity 
                    onPress={() => eliminarProducto(item.id)}
                    style={styles.botonTacho}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                  </TouchableOpacity>

                  <View style={styles.controlContador}>
                    <TouchableOpacity 
                      style={styles.botonPaso} 
                      onPress={() => disminuirCantidad(item.id)}
                    >
                      <Ionicons name="remove" size={14} color="#0D1B3E" />
                    </TouchableOpacity>

                    <Text style={styles.textoContador}>{item.cantidad}</Text>

                    <TouchableOpacity 
                      style={styles.botonPaso} 
                      onPress={() => aumentarCantidad(item.id)}
                    >
                      <Ionicons name="add" size={14} color="#0D1B3E" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Barra inferior fija con el resumen y el botón para ir a pagar */}
          <View style={styles.barraInferior}>
            <View style={styles.filaResumen}>
              <Text style={styles.labelResumen}>Subtotal</Text>
              <Text style={styles.valorResumen}>S/ {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.filaResumen}>
              <Text style={styles.labelResumen}>IGV (18%)</Text>
              <Text style={styles.valorResumen}>S/ {igv.toFixed(2)}</Text>
            </View>
            <View style={styles.filaTotal}>
              <Text style={styles.labelTotal}>Total a pagar</Text>
              <Text style={styles.montoTotal}>S/ {total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.botonPagar} 
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.textoBotonPagar}>Ir a Pagar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    position: 'relative',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  botonVaciar: {
    position: 'absolute',
    right: 20,
    paddingVertical: 4,
  },
  textoVaciar: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  vacioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemTarjeta: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  fotoItem: {
    width: 58,
    height: 58,
    borderRadius: 8,
  },
  infoItem: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nombreItem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  unidadItem: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  precioItem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E65C0',
    marginTop: 4,
  },
  derechaItem: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 58,
  },
  botonTacho: {
    padding: 2,
  },
  controlContador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F8',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  botonPaso: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoContador: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D1B3E',
    paddingHorizontal: 8,
  },
  barraInferior: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelResumen: {
    fontSize: 13,
    color: '#8A93A6',
  },
  valorResumen: {
    fontSize: 13,
    color: '#556987',
    fontWeight: '600',
  },
  filaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
  },
  labelTotal: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  montoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  botonPagar: {
    backgroundColor: '#1E65C0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  textoBotonPagar: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
