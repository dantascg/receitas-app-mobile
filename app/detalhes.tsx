import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';

export default function Detalhes() {
  const router = useRouter();
  const { removerReceita } = useReceitas();
  const { receita } = useLocalSearchParams();
  
  // estado q controla se o modal ta visivel ou não

  const [modalVisible, setModalVisible] = useState(false);
  
  const item = receita ? JSON.parse(receita as string) : null;

  if (!item) return <View><Text>Erro ao carregar</Text></View>;

  const confirmarExclusao = async () => {
    await removerReceita(item.id); // apagar do banco
    setModalVisible(false); // fecha o modal
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Image source={{ uri: item.imagem }} style={{ width: '100%', height: 300 }} />
        
        <View style={styles.content}>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>{item.categoria}</Text>
            <Text style={styles.tag}>{item.tempo}</Text>
            <Text style={styles.tag}>Dificuldade: {item.dificuldade}/5</Text>
          </View>

          <Text style={styles.title}>{item.nome}</Text>
          
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {item.ingredientes.map((ing: string, index: number) => (
            <Text key={index} style={styles.bodyText}>• {ing}</Text>
          ))}

          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.bodyText}>{item.modoPreparo || 'Sem modo de preparo definido.'}</Text>

          {/* botão pra abrir o modal */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.deleteText}>Excluir Receita</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* componente modal de exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Excluir Receita?</Text>
            <Text style={styles.modalText}>Essa ação não pode ser desfeita.</Text>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={[styles.btn, styles.btnDelete]}
                onPress={confirmarExclusao}
              >
                <Text style={[styles.textStyle, { color: '#FFF' }]}>Sim, Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  content: { 
    padding: 24, backgroundColor: '#fff', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30,
    minHeight: 500
  },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  tagRow: { flexDirection: 'row', gap: 10, marginBottom: 15, flexWrap: 'wrap' },
  tag: { 
    color: COLORS.primary, fontWeight: 'bold', 
    backgroundColor: '#FFF0E6', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
    overflow: 'hidden'
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 5, color: COLORS.text },
  bodyText: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 2 },
  
  deleteButton: { 
    marginTop: 40, alignSelf: 'center', padding: 15, 
    borderWidth: 1, borderColor: COLORS.danger, borderRadius: 12, width: '100%', alignItems: 'center'
  },
  deleteText: { color: COLORS.danger, fontSize: 16, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
    width: '80%'
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { marginBottom: 20, textAlign: 'center', color: '#666' },
  modalButtons: { flexDirection: 'row', gap: 15 },
  btn: { borderRadius: 10, padding: 10, elevation: 2, minWidth: 100, alignItems: 'center' },
  btnCancel: { backgroundColor: '#E5E7EB' },
  btnDelete: { backgroundColor: COLORS.danger },
  textStyle: { fontWeight: 'bold', textAlign: 'center' }
});