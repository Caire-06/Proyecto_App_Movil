import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';

const categorias = ['Poliéster', 'Nylon', 'Texturizados', 'Otros'];

// El almacén agrega productos y edita sus datos y stock (RF06)
export default function InventarioAlmacen() {
  const [productos, setProductos] = useState([
    { id: '1', nombre: 'Hilo Poliéster 150D', descripcion: 'Alta tenacidad para costura industrial', precio: 12.5, categoria: 'Poliéster', presentacion: 'Cono x 5 kg', stock: 240 },
    { id: '2', nombre: 'Hilo Nylon Industrial', descripcion: 'Máxima resistencia al desgaste', precio: 15.0, categoria: 'Nylon', presentacion: 'Cono x 5 kg', stock: 160 },
    { id: '3', nombre: 'Hilo Poliéster 300D', descripcion: 'Para tapicería y bordados', precio: 18.5, categoria: 'Poliéster', presentacion: 'Cono x 8 kg', stock: 98 },
    { id: '4', nombre: 'Hilo Texturizado 75D', descripcion: 'Hilo de alta calidad para uso industrial', precio: 9.8, categoria: 'Texturizados', presentacion: 'Bobina x 3 kg', stock: 42 },
  ]);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('Poliéster');
  const [presentacion, setPresentacion] = useState('');
  const [stock, setStock] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editCategoria, setEditCategoria] = useState('Poliéster');
  const [editStock, setEditStock] = useState(0);

  const agregar = () => {
    if (nombre.trim().length < 3) {
      setMensaje('Ingrese el nombre');
      return;
    }
    if (precio === '' || stock === '') {
      setMensaje('Ingrese precio y stock');
      return;
    }
    setProductos([...productos, {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      categoria,
      presentacion: presentacion.trim() === '' ? 'Unidad' : presentacion.trim(),
      stock: parseInt(stock),
    }]);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setPresentacion('');
    setStock('');
    setMensaje('');
    setModalAgregar(false);
  };

  const abrirEditar = (producto) => {
    setEditNombre(producto.nombre);
    setEditDescripcion(producto.descripcion);
    setEditPrecio(String(producto.precio));
    setEditCategoria(producto.categoria);
    setEditStock(producto.stock);
    setProductoEditado(producto);
    setModalEditar(true);
  };

  const guardarEdicion = () => {
    if (productoEditado) {
      setProductos(productos.map((p) =>
        p.id === productoEditado.id ? {
          ...p,
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim(),
          precio: parseFloat(editPrecio) || 0,
          categoria: editCategoria,
          stock: editStock,
        } : p
      ));
      setModalEditar(false);
      setProductoEditado(null);
    }
  };

  const eliminar = (id) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  const estado = (stockNum) => {
    if (stockNum === 0) return 'Sin stock';
    if (stockNum < 100) return 'Stock bajo';
    return 'Disponible';
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Lista de productos</Text>
        <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalAgregar(true)}>
          <Text style={styles.textoBoton}>+ Agregar</Text>
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.botonEditar} onPress={() => abrirEditar(item)}>
                <Ionicons name="pencil" size={14} color="#1E65C0" />
                <Text style={styles.textoEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminar(item.id)}>
                <Ionicons name="trash" size={14} color="#E53935" />
                <Text style={styles.textoEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalAgregar} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>Nuevo producto</Text>
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
              <Text style={styles.etiqueta}>Stock disponible</Text>
              <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />
              <Text style={styles.etiqueta}>Presentación</Text>
              <TextInput style={styles.input} placeholder="Cono x 5 kg" value={presentacion} onChangeText={setPresentacion} />
              {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}
              <TouchableOpacity style={styles.botonGuardar} onPress={agregar}>
                <Text style={styles.textoBoton}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalAgregar(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEditar} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.etiqueta}>Nombre</Text>
              <TextInput style={styles.input} value={editNombre} onChangeText={setEditNombre} />
              <Text style={styles.etiqueta}>Descripción</Text>
              <TextInput style={styles.input} value={editDescripcion} onChangeText={setEditDescripcion} />
              <View style={styles.filaDoble}>
                <View style={styles.mitad}>
                  <Text style={styles.etiqueta}>Precio (S/)</Text>
                  <TextInput style={styles.input} value={editPrecio} onChangeText={setEditPrecio} keyboardType="numeric" />
                </View>
                <View style={styles.mitad}>
                  <Text style={styles.etiqueta}>Categoría</Text>
                  <View style={styles.filaCategorias}>
                    {categorias.map((c) => (
                      <TouchableOpacity key={c} style={[styles.cat, editCategoria === c && styles.catActivo]} onPress={() => setEditCategoria(c)}>
                        <Text style={editCategoria === c ? styles.catTextoActivo : styles.catTexto}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.etiqueta}>Stock disponible</Text>
              <View style={styles.cajaStock}>
                <TouchableOpacity style={styles.botonMenos} onPress={() => setEditStock(Math.max(0, editStock - 1))}>
                  <Text style={styles.textoMenos}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numeroStock}>{editStock}</Text>
                <TouchableOpacity style={styles.botonMas} onPress={() => setEditStock(editStock + 1)}>
                  <Text style={styles.textoMas}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarEdicion}>
                <Text style={styles.textoBoton}>Guardar cambios</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalEditar(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  botonAgregar: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
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
    backgroundColor: '#F8FAFD',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
  },
  mensaje: {
    textAlign: 'center',
    color: '#E53935',
    fontSize: 12,
    marginTop: 6,
  },
  filaDoble: {
    flexDirection: 'row',
    gap: 10,
  },
  mitad: {
    flex: 1,
  },
  filaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  cat: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F8FAFD',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  catActivo: {
    backgroundColor: '#1E65C0',
    borderColor: '#1E65C0',
  },
  catTexto: {
    fontSize: 11,
    color: '#8A93A6',
  },
  catTextoActivo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  cajaStock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 10,
    padding: 10,
  },
  botonMenos: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#1E65C0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoMenos: {
    color: '#1E65C0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numeroStock: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  botonMas: {
    width: 32,
    height: 32,
    backgroundColor: '#1E65C0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoMas: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonGuardar: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelar: {
    textAlign: 'center',
    color: '#8A93A6',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 5,
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalCaja: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    maxHeight: '90%',
  },
});
