import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function DashboardAdmin() {
  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Panel</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>S/ 1587</Text>
            <Text style={styles.texto}>Total vendido</Text>
          </View>
          <View style={styles.caja}>
            <Text style={styles.numero}>12</Text>
            <Text style={styles.texto}>Pedidos</Text>
          </View>
        </View>
        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>4</Text>
            <Text style={styles.texto}>Productos</Text>
          </View>
          <View style={styles.caja}>
            <Text style={styles.numero}>8</Text>
            <Text style={styles.texto}>Usuarios</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Ventas recientes</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>VTA-034 - Carmen Ríos</Text>
          <Text style={styles.dato}>S/ 890</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>VTA-033 - Pedro Huamán</Text>
          <Text style={styles.dato}>S/ 265</Text>
        </View>

        <Text style={styles.seccion}>Más vendidos</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>Hilo Poliéster 150D</Text>
          <Text style={styles.dato}>120 vendidos</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>Hilo Nylon Industrial</Text>
          <Text style={styles.dato}>85 vendidos</Text>
        </View>

        <Text style={styles.seccion}>Alertas de inventario</Text>
        <View style={styles.alerta}>
          <Text style={styles.nombre}>Hilo Texturizado 75D</Text>
          <Text style={styles.alertaTexto}>Stock bajo: 42 unidades</Text>
        </View>
        <View style={styles.alerta}>
          <Text style={styles.nombre}>Hilo Poliéster 300D</Text>
          <Text style={styles.alertaTexto}>Stock bajo: 98 unidades</Text>
        </View>
      </ScrollView>
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
  fila: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  caja: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  numero: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  texto: {
    fontSize: 12,
    color: '#8A93A6',
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 12,
    color: '#8A93A6',
  },
  alerta: {
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertaTexto: {
    fontSize: 12,
    color: '#B7791F',
    fontWeight: 'bold',
  },
});
