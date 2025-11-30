import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Configuracoes() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajustes do App</Text>
      
      {/* configs */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Modo Escuro</Text>
          <Switch 
            value={isDark} 
            onValueChange={setIsDark} 
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={isDark ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* equipe */}
      <View style={styles.creditsContainer}>
        <Text style={styles.creditsTitle}>Desenvolvido por:</Text>
        <View style={styles.namesContainer}>
          <Text style={styles.nameText}>Leonardo Dantas</Text>
          <Text style={styles.nameText}>João Victor Amorim</Text>
          <Text style={styles.nameText}>Alex Vinicius</Text>
        </View>
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30,
    color: '#1A1A1A'
  },
  section: {
    marginBottom: 40,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    fontSize: 16,
    color: '#333'
  },
  
  creditsContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  creditsTitle: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600'
  },
  namesContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15
  },
  nameText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  versionText: {
    fontSize: 10,
    color: '#CCC'
  }
});