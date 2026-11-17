import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerSesion } from '../../guardado/guardadoAcceso';
import { obtenerPerfil, solicitar } from '../../servicios/api';

const PRODUCTOS_CARRITO = '@productos_carrito';
const TASA_IGV = 0.18;

// Métodos de pago disponibles en el checkout.
const metodosPago = [
  { valor: 'yape', texto: 'Yape', icono: 'phone-portrait-outline' },
  { valor: 'tarjeta_credito', texto: 'Tarjeta crédito', icono: 'card-outline' },
  { valor: 'tarjeta_debito', texto: 'Tarjeta débito', icono: 'card-outline' },
];

export default function Checkout({ navigation }) {
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comprobante, setComprobante] = useState('boleta');
  const [documento, setDocumento] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [metodoPago, setMetodoPago] = useState('yape');
  const [notas, setNotas] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Carga el carrito y precarga los datos del perfil.
  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = await AsyncStorage.getItem(PRODUCTOS_CARRITO);
        setItems(guardado ? JSON.parse(guardado) : []);

        const sesion = await obtenerSesion();
        if (sesion) {
          setNombre(`${sesion.nombre || ''} ${sesion.apellido || ''}`.trim());
          setCorreo(sesion.correo || '');
          setTelefono(sesion.telefono || '');
          setDireccion(sesion.direccion || '');
        }

        try {
          const perfil = await obtenerPerfil();
          setNombre(`${perfil.nombre || ''} ${perfil.apellido || ''}`.trim());
          setCorreo(perfil.correo || '');
          setTelefono(perfil.telefono || '');
          setDireccion(perfil.direccion || '');
        } catch (errorPerfil) {
          // Si no se puede leer el perfil se mantienen los datos de la sesión.
        }
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 1),
    0
  );
  const igv = subtotal * TASA_IGV;
  const total = subtotal + igv;

  const esFactura = comprobante === 'factura';
  const largoDocumento = esFactura ? 11 : 8;

  // Al cambiar de comprobante se limpia el documento porque cambia de tipo.
  const cambiarComprobante = (valor) => {
    setComprobante(valor);
    setDocumento('');
  };

  const cambiarDocumento = (texto) => {
    const soloNumeros = texto.replace(/[^0-9]/g, '');
    setDocumento(soloNumeros.slice(0, largoDocumento));
  };

  const pagar = async () => {
    setMensaje('');

    if (items.length === 0) {
      setMensaje('Tu carrito está vacío');
      return;
    }
    if (nombre.trim().length < 2) {
      setMensaje('Ingresa el nombre completo');
      return;
    }
    if (correo.trim() === '') {
      setMensaje('Ingresa el correo electrónico');
      return;
    }
    if (telefono.trim() === '') {
      setMensaje('Ingresa el teléfono');
      return;
    }
    if (direccion.trim() === '') {
      setMensaje('Ingresa la dirección de entrega');
      return;
    }
    if (documento.length !== largoDocumento) {
      setMensaje(esFactura ? 'El RUC debe tener 11 dígitos' : 'El DNI debe tener 8 dígitos');
      return;
    }
    if (esFactura && razonSocial.trim().length < 2) {
      setMensaje('Ingresa la razón social de la empresa');
      return;
    }

    try {
      setEnviando(true);

      // Registra el pedido en el backend con los productos del carrito.
      await solicitar('/api/pedidos', {
        metodo: 'POST',
        cuerpo: {
          productos: items.map((item) => ({
            productoId: Number(item.id),
            cantidad: Number(item.cantidad) || 1,
          })),
        },
      });

      await AsyncStorage.removeItem(PRODUCTOS_CARRITO);
      setItems([]);
      Alert.alert('Compra registrada', 'Tu pedido se registró correctamente.', [
        {
          text: 'Ver mis compras',
          onPress: () => navigation.navigate('Principal', { screen: 'Compras' }),
        },
      ]);
    } catch (error) {
      setMensaje(error.message || 'No se pudo registrar la compra');
    } finally {
      setEnviando(false);
    }
  };

  const moneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  const cabecera = (
    <View style={styles.cabecera}>
      <TouchableOpacity style={styles.botonAtras} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#0D1B3E" />
      </TouchableOpacity>
      <Text style={styles.titulo}>Finalizar Compra</Text>
      <View style={styles.espacioAtras} />
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.fondo}>
        {cabecera}
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#1E65C0" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.fondo}>
        {cabecera}
        <View style={styles.vacio}>
          <Ionicons name="cart-outline" size={70} color="#B0B9C7" />
          <Text style={styles.textoVacio}>Tu carrito está vacío</Text>
          <Text style={styles.subtextoVacio}>Agrega productos desde el catálogo</Text>
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
            <Text style={styles.textoBotonPagar}>Volver al carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fondo}>
      {cabecera}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.aviso}>
          <Ionicons name="person-circle-outline" size={18} color="#1E65C0" />
          <Text style={styles.textoAviso}>
            Estos datos se cargaron desde tu perfil. Puedes editarlos solo para este pedido.
          </Text>
        </View>

        <Text style={styles.seccion}>Datos personales</Text>
        <Text style={styles.etiqueta}>Nombre completo *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Juan Pérez" />
        <Text style={styles.etiqueta}>Correo electrónico *</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="juan@correo.com"
        />
        <Text style={styles.etiqueta}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="numeric"
          maxLength={9}
          placeholder="999 999 999"
        />
        <Text style={styles.etiqueta}>Dirección de entrega *</Text>
        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Av. Los Olivos 123, Lima"
        />

        <Text style={styles.seccion}>Comprobante de pago</Text>
        <View style={styles.filaOpciones}>
          <TouchableOpacity
            style={[styles.opcionComprobante, !esFactura && styles.opcionActiva]}
            onPress={() => cambiarComprobante('boleta')}
            activeOpacity={0.85}
          >
            <Ionicons name="receipt-outline" size={20} color={!esFactura ? '#1E65C0' : '#8A93A6'} />
            <Text style={[styles.tituloOpcion, !esFactura && styles.textoActivo]}>Boleta de venta</Text>
            <Text style={styles.detalleOpcion}>Persona natural - DNI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.opcionComprobante, esFactura && styles.opcionActiva]}
            onPress={() => cambiarComprobante('factura')}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text-outline" size={20} color={esFactura ? '#1E65C0' : '#8A93A6'} />
            <Text style={[styles.tituloOpcion, esFactura && styles.textoActivo]}>Factura</Text>
            <Text style={styles.detalleOpcion}>Empresa - RUC</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.etiqueta}>{esFactura ? 'Número de RUC *' : 'Número de DNI *'}</Text>
        <TextInput
          style={styles.input}
          value={documento}
          onChangeText={cambiarDocumento}
          keyboardType="numeric"
          maxLength={largoDocumento}
          placeholder={esFactura ? '20123456789' : '12345678'}
        />
        <Text style={styles.ayuda}>
          {esFactura ? 'Ingresa el RUC de 11 dígitos' : 'Ingresa tu DNI de 8 dígitos'}
        </Text>

        {esFactura && (
          <>
            <Text style={styles.etiqueta}>Razón social *</Text>
            <TextInput
              style={styles.input}
              value={razonSocial}
              onChangeText={setRazonSocial}
              placeholder="Empresa S.A.C."
            />
          </>
        )}

        <Text style={styles.seccion}>Método de pago</Text>
        <View style={styles.filaPagos}>
          {metodosPago.map((metodo) => {
            const activo = metodoPago === metodo.valor;
            return (
              <TouchableOpacity
                key={metodo.valor}
                style={[styles.opcionPago, activo && styles.opcionActiva]}
                onPress={() => setMetodoPago(metodo.valor)}
                activeOpacity={0.85}
              >
                <Ionicons name={metodo.icono} size={22} color={activo ? '#1E65C0' : '#8A93A6'} />
                <Text style={[styles.textoPago, activo && styles.textoActivo]}>{metodo.texto}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.seccion}>Notas de entrega (opcional)</Text>
        <TextInput
          style={[styles.input, styles.area]}
          value={notas}
          onChangeText={setNotas}
          placeholder="Ej: Llamar al interfono, dejar en portería..."
          multiline={true}
        />

        <Text style={styles.seccion}>Tu pedido</Text>
        <View style={styles.tarjetaResumen}>
          {items.map((item) => (
            <View key={item.id} style={styles.filaItem}>
              <Text style={styles.itemNombre} numberOfLines={1}>
                <Text style={styles.itemCantidad}>{item.cantidad}x </Text>
                {item.nombre}
              </Text>
              <Text style={styles.itemImporte}>
                {moneda((Number(item.precio) || 0) * (Number(item.cantidad) || 1))}
              </Text>
            </View>
          ))}

          <View style={styles.divisor} />

          <View style={styles.filaResumen}>
            <Text style={styles.labelResumen}>Subtotal</Text>
            <Text style={styles.valorResumen}>{moneda(subtotal)}</Text>
          </View>
          <View style={styles.filaResumen}>
            <Text style={styles.labelResumen}>IGV (18%)</Text>
            <Text style={styles.valorResumen}>{moneda(igv)}</Text>
          </View>
          <View style={[styles.filaResumen, styles.filaTotal]}>
            <Text style={styles.labelTotal}>Total</Text>
            <Text style={styles.montoTotal}>{moneda(total)}</Text>
          </View>
        </View>

        {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

        <TouchableOpacity
          style={styles.botonPagar}
          onPress={pagar}
          disabled={enviando}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonPagar}>
            {enviando ? 'Procesando...' : `Pagar ${moneda(total)}`}
          </Text>
        </TouchableOpacity>

        <View style={styles.notaSeguridad}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#8A93A6" />
          <Text style={styles.textoSeguridad}>Pago 100% seguro</Text>
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
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  botonAtras: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  espacioAtras: {
    width: 36,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  textoVacio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 12,
  },
  subtextoVacio: {
    fontSize: 13,
    color: '#8A93A6',
    marginTop: 4,
    marginBottom: 18,
  },
  botonVolver: {
    backgroundColor: '#1E65C0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 6,
  },
  textoAviso: {
    flex: 1,
    fontSize: 12,
    color: '#2C4A7C',
  },
  seccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginTop: 18,
    marginBottom: 6,
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
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0D1B3E',
  },
  area: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ayuda: {
    fontSize: 11,
    color: '#8A93A6',
    marginTop: 4,
  },
  filaOpciones: {
    flexDirection: 'row',
    gap: 10,
  },
  opcionComprobante: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  opcionActiva: {
    borderColor: '#1E65C0',
    backgroundColor: '#F0F5FD',
  },
  tituloOpcion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#556987',
  },
  detalleOpcion: {
    fontSize: 11,
    color: '#8A93A6',
  },
  textoActivo: {
    color: '#1E65C0',
  },
  filaPagos: {
    flexDirection: 'row',
    gap: 8,
  },
  opcionPago: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8ECF4',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  textoPago: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#556987',
    textAlign: 'center',
  },
  tarjetaResumen: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  filaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  itemNombre: {
    flex: 1,
    fontSize: 12,
    color: '#2C3E50',
  },
  itemCantidad: {
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  itemImporte: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D1B3E',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F4F9',
    marginVertical: 10,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  labelResumen: {
    fontSize: 12,
    color: '#8A93A6',
  },
  valorResumen: {
    fontSize: 12,
    color: '#556987',
    fontWeight: '600',
  },
  filaTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
  },
  labelTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  montoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E65C0',
  },
  mensaje: {
    textAlign: 'center',
    color: '#E53935',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
  },
  botonPagar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E65C0',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 18,
  },
  textoBotonPagar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notaSeguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  textoSeguridad: {
    fontSize: 11,
    color: '#8A93A6',
  },
});
