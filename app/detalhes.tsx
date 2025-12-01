import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';

const blankImage = require('../assets/images/imagemBranca.png');

export default function Detalhes() {
  const router = useRouter();
  const { removerReceita } = useReceitas();
  const params = useLocalSearchParams();

  const receitaParam = useMemo(() => {
    const r = params?.receita;
    if (Array.isArray(r)) return r[0];
    return r ?? null;
  }, [params]);

  const item = useMemo(() => {
    try {
      return receitaParam ? JSON.parse(receitaParam as string) : null;
    } catch (e) {
      console.error('Erro ao ler receita:', e);
      return null;
    }
  }, [receitaParam]);

  const [modalVisible, setModalVisible] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);

  // Define imagem inicial baseada no item
  useEffect(() => {
    if (item?.imagem && typeof item.imagem === 'string' && item.imagem.trim()) {
      setImagem(item.imagem);
    } else {
      setImagem(null); // usa o asset local no render
    }
  }, [item]);

  if (!item || typeof item !== 'object') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar a receita.</Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
          <Text style={styles.btnBackText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confirmarExclusao = async () => {
    try {
      await removerReceita(item.id);
      setModalVisible(false);
      Alert.alert('Sucesso', 'Receita removida!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover.');
      setModalVisible(false);
    }
  };

  const editarReceita = () => {
    router.push({
      pathname: '/adicionarReceitas',
      params: { receita: JSON.stringify(item) }
    });
  };

  const escolherImagem = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Você precisa permitir acesso às fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0].uri);
    }
  };

  const ingredientes = Array.isArray(item.ingredientes) ? item.ingredientes : [];
  const modoPreparo = item.modoPreparo || 'Sem modo de preparo definido.';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Image
          source={imagem ? { uri: imagem } : blankImage}
          style={{ width: '100%', height: 300 }}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.imageButton} onPress={escolherImagem}>
          <Text style={styles.imageButtonText}>📷 Alterar Imagem</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.tagRow}>
            {!!item.categoria && <Text style={styles.tag}>{item.categoria}</Text>}
            {!!item.tempo && <Text style={styles.tag}>⏱ {item.tempo}</Text>}
            <Text style={styles.tag}>Dificuldade: {item.dificuldade}/5</Text>
          </View>

          <Text style={styles.title}>{item.nome}</Text>

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <View style={styles.ingredientsBox}>
            {ingredientes.length === 0 ? (
              <Text style={styles.bodyText}>Nenhum ingrediente informado.</Text>
            ) : (
              ingredientes.map((ing: string, index: number) => (
                <Text key={index} style={styles.ingredientItem}>• {ing}</Text>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.bodyText}>{modoPreparo}</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={editarReceita}>
              <Text style={styles.editText}>✏️ Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.deleteText}>🗑️ Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Tem certeza?</Text>
            <Text style={styles.modalText}>Você vai apagar "{item.nome}" permanentemente.</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.btn, styles.btnDelete]} onPress={confirmarExclusao}>
                <Text style={[styles.textStyle, { color: '#FFF' }]}>Sim, Apagar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, fontSize: 16, marginBottom: 20 },
  btnBack: { padding: 10, backgroundColor: COLORS.primary, borderRadius: 8 },
  btnBackText: { color: '#fff', fontWeight: 'bold' },

  content: { 
    padding: 24, backgroundColor: '#fff', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30,
    minHeight: 500, paddingBottom: 50
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  tag: { 
    color: COLORS.primary, fontWeight: 'bold', fontSize: 12,
    backgroundColor: '#FFF0E6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    overflow: 'hidden'
  },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 10, color: COLORS.text },
  ingredientsBox: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 12 },
  ingredientItem: { fontSize: 16, color: '#444', marginBottom: 5 },
  bodyText: { fontSize: 16, color: '#444', lineHeight: 24 },
  
  actionsContainer: { marginTop: 40, gap: 15 },
  
  editButton: { 
    padding: 15, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, alignItems: 'center', backgroundColor: '#F0F9FF'
  },
  editText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },

  deleteButton: { 
    padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#FEE2E2'
  },
  deleteText: { color: COLORS.danger, fontSize: 16, fontWeight: 'bold' },

  imageButton: {
    position: 'absolute',
    right: 16,
    top: 260,
    backgroundColor: '#00000080',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageButtonText: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, elevation: 5, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { marginBottom: 20, textAlign: 'center', color: '#666' },
  modalButtons: { flexDirection: 'row', gap: 15 },
  btn: { borderRadius: 10, padding: 12, elevation: 2, minWidth: 100, alignItems: 'center' },
  btnCancel: { backgroundColor: '#E5E7EB' },
  btnDelete: { backgroundColor: COLORS.danger },
  textStyle: { fontWeight: 'bold', textAlign: 'center' }
});
