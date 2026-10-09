import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTOS_CARRITO = '@productos_carrito';


export default function Carrito() {
  const [items, setItems] = useState([]);

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

  const confirmarEliminar = (productoId, nombreProducto) => {
    Alert.alert(
      "Eliminar producto",
      `¿Estás seguro de que quieres quitar "${nombreProducto}" del carrito?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarProducto(productoId) }
      ]
    );
  };

  const eliminarProducto = async (productoId) => {
    try {
      const datos = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
      const carrito = datos ? JSON.parse(datos) : [];

      const carritoActualizado = carrito.filter(item => item.id !== productoId);

      await AsyncStorage.setItem(PRODUCTOS_CARRITO, JSON.stringify(carritoActualizado));

      setItems(carritoActualizado);
      
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Alert.alert("Error", "No se pudo eliminar el producto del carrito.");
    }
  };

    return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Carrito de Compras</Text>

      {items.length === 0 ? (
        <View style={styles.vacioContainer}>
          <Text style={styles.textoVacio}>Tu carrito está vacío.</Text>
          <Text style={styles.subtextoVacio}>Agrega productos desde el catálogo.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.itemTarjeta}>
              <Image source={item.foto} style={styles.fotoItem} resizeMode="cover" />
              <View style={styles.infoItem}>
                <Text style={styles.nombreItem}>{item.nombre}</Text>
                <Text style={styles.unidadItem}>{item.unidad}</Text>
                <Text style={styles.precioItem}>S/ {item.precio.toFixed(2)}</Text>
              </View>
                         
              <View style={styles.derechaItem}>
                <View style={styles.badgeCantidad}>
                  <Text style={styles.textoCantidad}>x{item.cantidad}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.botonEliminar} 
                  onPress={() => confirmarEliminar(item.id, item.nombre)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>

            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 50,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1B3E',
    textAlign: 'center',
    marginBottom: 15,
  },
  vacioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
  },
  lista: {
    paddingHorizontal: 18,
    paddingBottom: 20,
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
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoItem: {
    flex: 1,
    marginLeft: 12,
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
  badgeCantidad: {
    backgroundColor: '#F0F3F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  textoCantidad: {
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
});

/* 
   NOTA CARRITO:
  (sino preguntale a gpt xd es facil igual)
   Para que la compra se guarde y aparezca automáticamente en la pestaña 
   "Mis compras", pega esto dentro de tu función de "Pagar" o "Finalizar compra":

   1. Asegúrate de tener importado AsyncStorage arriba:
      import AsyncStorage from '@react-native-async-storage/async-storage';

   2. Guarda la orden así al presionar el botón:
      const nuevoPedido = {
        id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
        fecha: new Date().toLocaleDateString('es-PE'),
        estado: 'En camino',
        colorEstado: '#F39C12',
        metodoPago: 'Yape / Transferencia',
        articulos: [
          // Pasa aquí la lista de productos que tenía en el carrito:
          { nombre: 'Hilo Poliéster 150D', cantidad: 2, precioUnit: 12.5, subtotal: 25.0 }
        ],
        total: 25.0, // El total a pagar
      };

      const historialActual = JSON.parse(await AsyncStorage.getItem('@historial_pedidos')) || [];
      await AsyncStorage.setItem('@historial_pedidos', JSON.stringify([nuevoPedido, ...historialActual]));
   */