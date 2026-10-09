import { StyleSheet, Text, View } from 'react-native';

export default function Carrito() {
  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Carrito</Text>
      <Text style={styles.texto}>Aquí se verán los productos agregados.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  texto: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 8,
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