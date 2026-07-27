import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Placeholder de arranque (FASE 0). ThemeProvider, QueryProvider y NavigationContainer
// se montan aquí en la FASE 1 (ver docs/04-roadmap-y-fases.md).
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Índigo</Text>
      <Text style={styles.subtitle}>Scaffold listo — navegación en la FASE 1</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0810',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    color: '#A855F7',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#A79FB3',
    fontSize: 14,
  },
});
