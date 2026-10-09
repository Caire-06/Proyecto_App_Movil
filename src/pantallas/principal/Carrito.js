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
