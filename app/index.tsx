import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';

export default function Home() {
  const router = useRouter();
  
 
  const { receitas } = useReceitas();

  const renderReceita = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/detalhes', params: { receita: JSON.stringify(item) } })}
    >
    
      <Image 
        source={{ uri: item.imagem || 'https://via.placeholder.com/400' }} 
        style={styles.cardImage} 
      />
      
      <View style={styles.cardContent}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.categoria}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Text style={styles.cardTime}>⏱ {item.tempo}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Receitas</Text>
        <TouchableOpacity onPress={() => router.push('/configuracoes')}>
          <Text style={{fontSize: 24}}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {receitas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhuma receita ainda 😔</Text>
          <Text style={styles.emptyText}>Clique no botão + para adicionar a primeira!</Text>
        </View>
      ) : (
        <FlatList
          data={receitas}
          keyExtractor={(item) => item.id}
          renderItem={renderReceita}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/adicionarReceitas')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  card: { 
    backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 20,
    shadowColor: "#000", shadowOffset: {width: 0, height: 4}, 
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 
  },
  cardImage: { width: '100%', height: 150, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 8 },
  cardTime: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  badge: { 
    backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 4, 
    borderRadius: 6, alignSelf: 'flex-start' 
  },
  badgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  fab: {
    position: 'absolute', bottom: 30, right: 30,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: COLORS.primary
  },
  fabText: { fontSize: 32, color: '#FFF', marginTop: -4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#666' }
});