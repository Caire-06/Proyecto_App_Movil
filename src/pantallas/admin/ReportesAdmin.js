import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const datos = {
  Semana: { total: 'S/ 890', pedidos: 6, ticket: 'S/ 148', top: 'Hilo Poliéster 150D' },
  Mes: { total: 'S/ 3420', pedidos: 21, ticket: 'S/ 163', top: 'Hilo Nylon Industrial' },
  Año: { total: 'S/ 38500', pedidos: 240, ticket: 'S/ 160', top: 'Hilo Poliéster 150D' },
};

const porCategoria = [
  { nombre: 'Poliéster', valor: 65 },
  { nombre: 'Nylon', valor: 25 },
  { nombre: 'Texturizados', valor: 10 },
];

export default function ReportesAdmin() {
  const [filtro, setFiltro] = useState('Mes');
  const info = datos[filtro];

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Reportes</Text>
      <View style={styles.fila}>
        {['Semana', 'Mes', 'Año'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtro, filtro === f && styles.filtroActivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.textoFiltro, filtro === f && styles.textoFiltroActivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.filaCajas}>
          <View style={styles.caja}>
            <Text style={styles.numero}>{info.total}</Text>
            <Text style={styles.texto}>Ventas {filtro.toLowerCase()}</Text>
          </View>
          <View style={styles.caja}>
            <Text style={styles.numero}>{info.pedidos}</Text>
            <Text style={styles.texto}>Pedidos</Text>
          </View>
        </View>
        <View style={styles.filaCajas}>
          <View style={styles.caja}>
            <Text style={styles.numero}>{info.ticket}</Text>
            <Text style={styles.texto}>Ticket promedio</Text>
          </View>
          <View style={styles.caja}>
            <Text style={styles.numeroTop}>{info.top}</Text>
            <Text style={styles.texto}>Más vendido</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Ventas por categoría</Text>
        {porCategoria.map((c) => (
          <View key={c.nombre} style={styles.barraFila}>
            <Text style={styles.barraNombre}>{c.nombre}</Text>
            <View style={styles.barraFondo}>
              <View style={[styles.barraLlena, { width: c.valor + '%' }]} />
            </View>
            <Text style={styles.barraValor}>{c.valor}%</Text>
          </View>
        ))}
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
    gap: 8,
    marginBottom: 12,
  },
  filtro: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: '#1E65C0',
  },
  textoFiltro: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8A93A6',
  },
  textoFiltroActivo: {
    color: '#fff',
  },
  filaCajas: {
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
  numeroTop: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
    textAlign: 'center',
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
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  barraNombre: {
    width: 95,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  barraFondo: {
    flex: 1,
    height: 10,
    backgroundColor: '#E8ECF4',
    borderRadius: 5,
  },
  barraLlena: {
    height: 10,
    backgroundColor: '#1E65C0',
    borderRadius: 5,
  },
  barraValor: {
    width: 38,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E65C0',
    textAlign: 'right',
  },
});
