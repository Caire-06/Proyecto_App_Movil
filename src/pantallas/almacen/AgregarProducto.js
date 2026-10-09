import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';

// Formulario solo visual, sin guardar todavía
export default function AgregarProducto() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [stock, setStock] = useState('');

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Agregar producto</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
        <Text style={styles.etiqueta}>Descripción</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />
        <View style={styles.filaDoble}>
          <View style={styles.mitad}>
            <Text style={styles.etiqueta}>Precio (S/)</Text>
            <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.etiqueta}>Categoría</Text>
            <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} />
          </View>
        </View>
        <Text style={styles.etiqueta}>Presentación</Text>
        <TextInput style={styles.input} placeholder="Cono x 5 kg" value={presentacion} onChangeText={setPresentacion} />
        <Text style={styles.etiqueta}>Stock disponible</Text>
        <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />
        <TouchableOpacity style={styles.boton} onPress={() => {}}>
          <Text style={styles.textoBoton}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F3F8',
    paddingTop: 45,
    paddingHorizontal: 18,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 10,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A93A6',
    marginTop: 8,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
  },
  filaDoble: {
    flexDirection: 'row',
    gap: 10,
  },
  mitad: {
    flex: 1,
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
