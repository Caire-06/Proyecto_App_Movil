import { NavigationContainer } from '@react-navigation/native';
import Navegador from './src/navegacion/Navegador';

// App solo muestra el navegador (Stack + Pestañas)
export default function App() {
  return (
    <NavigationContainer>
      <Navegador />
    </NavigationContainer>
  );
}
