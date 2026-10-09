import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';

// Lista solo visual, sin funciones todavía
export default function InventarioAlmacen() {
  const [productos] = useState([
    { id: '1', nombre: 'Hilo Poliéster 150D', precio: 12.5, categoria: 'Poliéster', presentacion: 'Cono x 5 kg', stock: 240 },
    { id: '2', nombre: 'Hilo Nylon Industrial', precio: 15.0, categoria: 'Nylon', presentacion: 'Cono x 5 kg', stock: 160 },
    { id: '3', nombre: 'Hilo Poliéster 300D', precio: 18.5, categoria: 'Poliéster', presentacion: 'Cono x 8 kg', stock: 98 },
    { id: '4', nombre: 'Hilo Texturizado 75D', precio: 9.8, categoria: 'Texturizados', presentacion: 'Bobina x 3 kg', stock: 42 },
  ]);

  const estado = (stockNum) => {
    if (stockNum === 0) return 'Sin stock';
    if (stockNum < 100) return 'Stock bajo';
    return 'Disponible';
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Lista de productos</Text>
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.dato}>{item.categoria} - {item.presentacion}</Text>
            <View style={styles.filaPrecio}>
              <Text style={styles.precio}>S/ {item.precio}</Text>
              <Text style={estado(item.stock) === 'Disponible' ? styles.verde : estado(item.stock) === 'Stock bajo' ? styles.amarillo : styles.rojo}>
                {estado(item.stock)}
              </Text>
            </View>
            <Text style={styles.stockTitulo}>Stock actual</Text>
            <Text style={styles.stockNumero}>{item.stock} unid.</Text>
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonEditar} onPress={() => {}}>
                <Ionicons name="pencil" size={14} color="#1E65C0" />
                <Text style={styles.textoEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => {}}>
                <Ionicons name="trash" size={14} color="#E53935" />
                <Text style={styles.textoEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
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
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  dato: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 2,
  },
  filaPrecio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  precio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  verde: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E9E5B',
    backgroundColor: '#DFF5E6',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  amarillo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B7791F',
    backgroundColor: '#FFF3D6',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  rojo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E53935',
    backgroundColor: '#FDE8E8',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  stockTitulo: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 10,
  },
  stockNumero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  botonEditar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 8,
    padding: 8,
  },
  textoEditar: {
    color: '#1E65C0',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botonEliminar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
    padding: 8,
  },
  textoEliminar: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
