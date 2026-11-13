# Proyecto Móvil SAUTEX

App de ventas de hilos industriales para SAUTEX E.I.R.L. hecha con React Native y Expo.

## Instalación

```
npm install
```

## Librerías usadas

```
npm install @expo/vector-icons
npx expo install @react-navigation/native
npx expo install @react-navigation/stack
npx expo install @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
npx expo install @react-native-async-storage/async-storage
npx expo install expo-image-picker
```

## Correr en Android

Primero debe estar encendido el backend en el puerto `8080`. Luego:

```
npm start
```

Presionar `a` para abrir en el emulador o escanear el QR con Expo Go.

## Usuarios y roles

Los usuarios ya no se guardan en el teléfono: el registro y el inicio de sesión usan el backend. El teléfono solo conserva la sesión iniciada.

La recuperación de contraseña es solo local y visual: guarda un registro en AsyncStorage, pero no cambia la contraseña real del backend.

Roles disponibles: `admin`, `almacen` y `cliente`.

- El registro público siempre crea una cuenta `cliente`.
- Las cuentas `admin` y `almacen` se crean desde la pantalla **Gestión de usuarios** del administrador.
- El correo no se puede editar en ningún rol.

## Cuentas de prueba

```
admin@sautex.com / admin123
almacen@sautex.com / almacen123
cliente@sautex.com / cliente123
```

## Módulo de almacén

- Panel con totales, valor del inventario, categorías, alertas y últimos movimientos.
- Inventario con productos reales y opciones para editar o eliminar.
- Agregar producto con imagen y categoría elegida desde las categorías existentes.
- Entradas de stock con referencia y observación.
- Kardex con filtros por entradas y salidas.
- Las salidas se generan al crear pedidos y los ajustes al editar el stock.
