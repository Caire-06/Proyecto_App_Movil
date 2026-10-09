import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { inicializar } from '../../guardado/guardadoAcceso';

export default function Carga({ navigation }) {
  useEffect(() => {
    inicializar();
    const tiempo = setTimeout(() => {
      navigation.replace('InicioSesion');
    }, 2500);
    return () => clearTimeout(tiempo);
  }, []);
  return (
    <View style={styles.carga}>
      <Image source={require('../../../assets/logo-sautex.png')} style={styles.logo} />
      <Text style={styles.tituloSautex}>SAUTEX</Text>
      <Text style={styles.subSautex}>E.I.R.L.</Text>
      <Text style={styles.frase}>Hilos industriales para tu producción</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  carga: {
    flex: 1,
    backgroundColor: '#0A1440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 12,
  },
  tituloSautex: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subSautex: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  frase: {
    color: '#fff',
    fontSize: 13,
    marginTop: 10,
  },
});
