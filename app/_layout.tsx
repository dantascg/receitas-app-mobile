import { Stack } from 'expo-router';
import { COLORS } from '../constants/theme';
import { ReceitasProvider } from '../context/ReceitasContext';

export default function Layout() {
  return (
    <ReceitasProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.primary,
          headerBackTitle: 'Voltar',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {/* tela inicial */}
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        
        {/* detalhes */}
        <Stack.Screen 
          name="detalhes" 
          options={{ title: 'Detalhes da Receita' }} 
        />
        
        {/* adicionarReceita */}
        <Stack.Screen 
          name="adicionarReceitas" 
          options={{ title: 'Nova Receita' }} 
        />
        
        {/* configs */}
        <Stack.Screen 
          name="configuracoes" 
          options={{ title: 'Configurações' }} 
        />
      </Stack>
    </ReceitasProvider>
  );
}