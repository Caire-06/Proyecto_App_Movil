import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { cerrarSesion } from '../../guardado/guardadoAcceso';

export default function DashboardAlmacen({ navigation }) {
  const salir = async () => {
    await cerrarSesion();
    navigation.getParent()?.replace('InicioSesion');
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Almacén</Text>
        <TouchableOpacity style={styles.botonSalir} onPress={salir}>
          <Ionicons name="exit-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.fila}>
          <View style={styles.caja}>
            <Text style={styles.numero}>4</Text>
            <Text style={styles.texto}>Productos</Text>
          </View>
          <View style={styles.caja}>
            <Text style={styles.numero}>540</Text>
            <Text style={styles.texto}>Stock total</Text>
          </View>
        </View>
        <View style={styles.cajaAncha}>
          <Text style={styles.numero}>S/ 7,840</Text>
          <Text style={styles.texto}>Valor del inventario</Text>
        </View>

        <Text style={styles.seccion}>Productos por categoría</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>Poliéster</Text>
          <Text style={styles.dato}>2 productos</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>Nylon</Text>
          <Text style={styles.dato}>1 producto</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>Texturizados</Text>
          <Text style={styles.dato}>1 producto</Text>
        </View>

        <Text style={styles.seccion}>Alertas de stock</Text>
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
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonSalir: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 10,
    padding: 8,
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
  cajaAncha: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
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
