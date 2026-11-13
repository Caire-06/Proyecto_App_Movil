import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { crearProducto, listarCategorias } from '../../servicios/api';
import { elegirImagen } from '../../utilidades/imagenesProducto';

export default function AgregarProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const lista = await listarCategorias();
      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (error) {
      setMensaje(error.message || 'No se pudieron cargar las categorías');
    }
  };

  const seleccionarImagen = async () => {
    setMensaje('');
    const resultado = await elegirImagen();
    if (resultado.error) {
      setMensaje(resultado.error);
      return;
    }
    if (resultado.cancelado) {
      return;
    }
    setImagen(resultado.imagen);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('');
    setPresentacion('');
    setStock('');
    setImagen(null);
  };

  const guardar = async () => {
    if (guardando) {
      return;
    }
    setMensaje('');

    if (nombre.trim().length < 3) {
      setMensaje('Ingrese un nombre de al menos 3 caracteres');
      return;
    }
    if (categoria.trim() === '') {
      setMensaje('Seleccione una categoría');
      return;
    }

    const precioNumero = Number(precio.replace(',', '.'));
    if (!precio || Number.isNaN(precioNumero) || precioNumero <= 0) {
      setMensaje('Ingrese un precio mayor a cero');
      return;
    }

    const stockNumero = Number(stock);
    if (stock === '' || Number.isNaN(stockNumero) || stockNumero < 0 || !Number.isInteger(stockNumero)) {
      setMensaje('Ingrese un stock válido');
      return;
    }

    setGuardando(true);
    try {
      await crearProducto({
        nombre: nombre.trim(),
        unidad: presentacion.trim(),
        precio: precioNumero,
        stock: stockNumero,
        categoria: categoria.trim(),
        imagen: imagen || null,
        descripcion: descripcion.trim(),
      });

      Alert.alert('Producto agregado', 'El producto se guardó correctamente.', [
        {
          text: 'Aceptar',
          onPress: () => {
            limpiarFormulario();
            navigation.navigate('Inventario');
          },
        },
      ]);
    } catch (error) {
      setMensaje(error.message || 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Agregar producto</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenido}>
        <Text style={styles.etiqueta}>Imagen del producto</Text>
        <TouchableOpacity style={styles.selectorImagen} onPress={seleccionarImagen}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.vistaPrevia} resizeMode="cover" />
          ) : (
            <View style={styles.sinImagen}>
              <Ionicons name="image-outline" size={32} color="#8A93A6" />
              <Text style={styles.textoSinImagen}>Seleccionar imagen</Text>
            </View>
          )}
        </TouchableOpacity>
        {imagen !== null && (
          <TouchableOpacity onPress={() => setImagen(null)}>
            <Text style={styles.quitarImagen}>Quitar imagen</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Hilo Poliéster 150D"
          placeholderTextColor="#A3ACBC"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.etiqueta}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputDescripcion]}
          placeholder="Descripción del producto"
          placeholderTextColor="#A3ACBC"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <View style={styles.filaDoble}>
          <View style={styles.mitad}>
            <Text style={styles.etiqueta}>Precio (S/)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#A3ACBC"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.mitad}>
            <Text style={styles.etiqueta}>Categoría</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setModalCategoria(true)}>
              <Text style={categoria ? styles.textoSelector : styles.textoPlaceholder}>
                {categoria || 'Seleccionar'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#8A93A6" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.etiqueta}>Presentación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Cono x 5 kg"
          placeholderTextColor="#A3ACBC"
          value={presentacion}
          onChangeText={setPresentacion}
        />

        <Text style={styles.etiqueta}>Stock disponible</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#A3ACBC"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBoton}>Guardar producto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalCategoria}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCategoria(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Categorías</Text>
            <ScrollView style={styles.modalLista} showsVerticalScrollIndicator={false}>
              {categorias.length === 0 ? (
                <Text style={styles.modalVacio}>No hay categorías registradas.</Text>
              ) : (
                categorias.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.modalItem}
                    onPress={() => {
                      setCategoria(item);
                      setModalCategoria(false);
                    }}
                  >
                    <Text style={styles.modalItemTexto}>{item}</Text>
                    {categoria === item && <Ionicons name="checkmark" size={18} color="#1E65C0" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.modalCerrar} onPress={() => setModalCategoria(false)}>
              <Text style={styles.textoBoton}>Cerrar</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 18,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 6,
  },
  contenido: {
    paddingBottom: 35,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A93A6',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
    color: '#0D1B3E',
  },
  inputDescripcion: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  selectorImagen: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D7DEEA',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
  },
  vistaPrevia: {
    width: '100%',
    height: 180,
  },
  sinImagen: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSinImagen: {
    fontSize: 12,
    color: '#8A93A6',
    marginTop: 6,
  },
  quitarImagen: {
    textAlign: 'center',
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 7,
  },
  filaDoble: {
    flexDirection: 'row',
    gap: 10,
  },
  mitad: {
    flex: 1,
  },
  selector: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 11,
  },
  textoSelector: {
    fontSize: 13,
    color: '#0D1B3E',
    flexShrink: 1,
  },
  textoPlaceholder: {
    fontSize: 13,
    color: '#A3ACBC',
    flexShrink: 1,
  },
  boton: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mensaje: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 64, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCaja: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '70%',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: 10,
  },
  modalLista: {
    maxHeight: 280,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
  },
  modalItemTexto: {
    fontSize: 14,
    color: '#0D1B3E',
  },
  modalVacio: {
    textAlign: 'center',
    color: '#8A93A6',
    fontSize: 13,
    paddingVertical: 20,
  },
  modalCerrar: {
    backgroundColor: '#1E65C0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
});
