import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';

// Ventas solo visual, datos fijos de ejemplo
const ventas = [
  { id: 'VTA-034', cliente: 'Carmen Ríos', fecha: '14/10/2026', total: 890 },
  { id: 'VTA-033', cliente: 'Pedro Huamán', fecha: '11/10/2026', total: 265 },
  { id: 'VTA-032', cliente: 'Lucía Fernández', fecha: '09/10/2026', total: 432 },
];

export default function VentasAdmin() {
  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Ventas</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.numero}>{item.id}</Text>
            <Text style={styles.dato}>{item.cliente}</Text>
            <Text style={styles.dato}>{item.fecha}</Text>
            <Text style={styles.total}>S/ {item.total}</Text>
            <TouchableOpacity style={styles.boton} onPress={() => {}}>
              <Text style={styles.textoBoton}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  numero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 2,
  },
  total: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
    marginTop: 6,
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
