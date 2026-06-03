import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LayoutEmpresa() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2A9D7E', 
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="menuUsuario"
        options={{
          title: 'Inicio', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="medicamentos"
        options={{
          title: 'Medicamentos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'medical' : 'medical-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="estoque"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={24} color={color} />
          ),
        }}
      />

      

      <Tabs.Screen
        name="doacao"
        options={{
          title: 'Doação',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="historico"
        options={{
          title: 'Historico',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="detalhesMedicamento"
        options={{ href: null}}
      />
    </Tabs>
  );
}
