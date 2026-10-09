import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Carga from '../pantallas/acceso/Carga';
import InicioSesion from '../pantallas/acceso/InicioSesion';
import Registro from '../pantallas/acceso/Registro';
import Usuarios from '../pantallas/admin/Usuarios';
import VentasAdmin from '../pantallas/admin/VentasAdmin';
import DashboardAdmin from '../pantallas/admin/DashboardAdmin';
import ReportesAdmin from '../pantallas/admin/ReportesAdmin';
import DashboardAlmacen from '../pantallas/almacen/DashboardAlmacen';
import InventarioAlmacen from '../pantallas/almacen/InventarioAlmacen';
import AgregarProducto from '../pantallas/almacen/AgregarProducto';
import Inicio from '../pantallas/principal/Inicio';
import Catalogo from '../pantallas/principal/Catalogo';
import Carrito from '../pantallas/principal/Carrito';
import Compras from '../pantallas/principal/Compras';
import Perfil from '../pantallas/principal/Perfil';

const Pila = createStackNavigator();
const Pestanas = createBottomTabNavigator();

function Principal() {
  return (
    <Pestanas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E65C0',
        tabBarInactiveTintColor: '#8A93A6',
      }}
    >
      <Pestanas.Screen
        name="Inicio"
        component={Inicio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Catalogo"
        component={Catalogo}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Carrito"
        component={Carrito}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Compras"
        component={Compras}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Pestanas.Navigator>
  );
}

function Admin() {
  return (
    <Pestanas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E65C0',
        tabBarInactiveTintColor: '#8A93A6',
      }}
    >
      <Pestanas.Screen
        name="Panel"
        component={DashboardAdmin}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Ventas"
        component={VentasAdmin}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Reportes"
        component={ReportesAdmin}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Usuarios"
        component={Usuarios}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Pestanas.Navigator>
  );
}

function Almacen() {
  return (
    <Pestanas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E65C0',
        tabBarInactiveTintColor: '#8A93A6',
      }}
    >
      <Pestanas.Screen
        name="Panel"
        component={DashboardAlmacen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Inventario"
        component={InventarioAlmacen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Pestanas.Screen
        name="Agregar"
        component={AgregarProducto}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
    </Pestanas.Navigator>
  );
}

export default function Navegador() {
  return (
    <Pila.Navigator screenOptions={{ headerShown: false }}>
      <Pila.Screen name="Carga" component={Carga} />
      <Pila.Screen name="InicioSesion" component={InicioSesion} />
      <Pila.Screen name="Registro" component={Registro} />
      <Pila.Screen name="Admin" component={Admin} />
      <Pila.Screen name="Almacen" component={Almacen} />
      <Pila.Screen name="Principal" component={Principal} />
    </Pila.Navigator>
  );
}
