import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';

const hilos = [
  { id: '1', nombre: 'Hilo Poliéster 150D', unidad: 'Cono x 5 kg', precio: 12.5, foto: require('../../../assets/hilo-polieter150.jpg') },
  { id: '2', nombre: 'Hilo Nylon Industrial', unidad: 'Cono x 5 kg', precio: 15.0, foto: require('../../../assets/hilo-nylon.jpg') },
  { id: '3', nombre: 'Hilo Poliéster 300D', unidad: 'Cono x 8 kg', precio: 18.5, foto: require('../../../assets/hilo-poliester300.jpg') },
  { id: '4', nombre: 'Hilo Texturizado 75D', unidad: 'Bobina x 3 kg', precio: 9.8, foto: require('../../../assets/hilo-texturizado75.jpg') },
];

const categorias = ['Todos', 'Poliéster', 'Nylon', 'Texturizados', 'Otros'];

export default function Inicio({ navigation }) {
  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <View style={styles.filaCabecera}>
          <Image source={require('../../../assets/logo-sautex.png')} style={styles.logo} />
          <View>
            <Text style={styles.textoSautex}>SAUTEX E.I.R.L.</Text>
            <Text style={styles.textoHilos}>Hilos industriales</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.campana}>
          <Ionicons name="notifications-outline" size={20} color="#8A93A6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerHola}>Bienvenido a SAUTEX</Text>
          <Text style={styles.bannerTitulo}>Encuentra los hilos para tu producción</Text>
          <TouchableOpacity
            style={styles.botonBanner}
            onPress={() => navigation.navigate('Catalogo')}
          >
            <Text style={styles.textoBotonBanner}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.seccion}>Categorías</Text>
        <View style={styles.filaCategorias}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.categoria}
              onPress={() => navigation.navigate('Catalogo')}
            >
              <Text style={styles.textoCategoria}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.seccion}>Destacados</Text>
        <View style={styles.grilla}>
          {hilos.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={styles.tarjetaHilo}
              onPress={() => navigation.navigate('Catalogo')}
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
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  filaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 10,
  },
  textoSautex: {
    fontSize: 11,
    color: '#8A93A6',
  },
  textoHilos: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  campana: {
    width: 38,
    height: 38,
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: '#0A1440',
    borderRadius: 20,
    margin: 18,
    padding: 20,
  },
  bannerHola: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 15,
  },
  botonBanner: {
    backgroundColor: '#4FC3F7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  textoBotonBanner: {
    color: '#0A1440',
    fontWeight: 'bold',
    fontSize: 13,
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginHorizontal: 18,
    marginTop: 15,
    marginBottom: 10,
  },
  filaCategorias: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 18,
  },
  categoria: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  textoCategoria: {
    fontSize: 12,
    color: '#1E65C0',
    fontWeight: 'bold',
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 20,
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
