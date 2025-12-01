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

// Pegar imagem da galeria
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';

// imagem padrao caso imagem nao adicionada na receita
const blankImage = require('../assets/images/imagemBranca.png');

export default function Detalhes() {
  const router = useRouter();
  const { removerReceita } = useReceitas();
  const params = useLocalSearchParams();

  // Extrai  o parametro da receita
  const receitaParam = useMemo(() => {
    const r = params?.receita;
    if (Array.isArray(r)) return r[0];
    return r ?? null;
  }, [params]);

  // Converte string da receita em obj
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

  // Imagem da receita ou imagem padrao (em branco)
  useEffect(() => {
    if (item?.imagem && typeof item.imagem === 'string' && item.imagem.trim()) {
      setImagem(item.imagem);
    } else {
      setImagem(null);
    }
  }, [item]);

  // Erro caso receita nao cumpra os requisitos obrigatorios
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

  // alerta afirmando exclusao da receita
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

  // tela de adicionar e editar passando o item atual
  const editarReceita = () => {
    router.push({
      pathname: '/adicionarReceitas',
      params: { receita: JSON.stringify(item) }
    });
  };

  // abrir galeria para escolher imagem
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

    // Atualizar a imagem com a escolhida na galeria
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0].uri);
    }
  };

  // Normaliza os campos da receita para renderização
  const ingredientes = Array.isArray(item.ingredientes) ? item.ingredientes : [];
  const modoPreparo = item.modoPreparo || 'Sem modo de preparo definido.';

  return (
    <View style={{ flex: 1 }}>
      
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>

        {/* Imagem selecionada pra receita ou padrao (branca) */}
        <Image
          source={imagem ? { uri: imagem } : blankImage}
          style={{ width: '100%', height: 300 }}
          resizeMode="cover"
        />

        {/* Mudar imagem (abre galeria) */}
        <TouchableOpacity style={styles.imageButton} onPress={escolherImagem}>
          <Text style={styles.imageButtonText}>📷 Alterar Imagem</Text>
        </TouchableOpacity>

        {/* receita */}
        <View style={styles.content}>
          {/* categoria, tempo, dificuldade */}
          <View style={styles.tagRow}>
            {!!item.categoria && <Text style={styles.tag}>{item.categoria}</Text>}
            {!!item.tempo && <Text style={styles.tag}>⏱ {item.tempo}</Text>}
            <Text style={styles.tag}>Dificuldade: {item.dificuldade}/5</Text>
          </View>

          {/* Nome da receita */}
          <Text style={styles.title}>{item.nome}</Text>

          {/* Ingredientes adicionados */}
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

          {/* Modo de preparo */}
          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.bodyText}>{modoPreparo}</Text>

          {/* Edição e exclusão */}
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

      {/* Confirmação de exclusão */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {/* Título e mensagem do modal */}
            <Text style={styles.modalTitle}>Tem certeza?</Text>
            <Text style={styles.modalText}>Você vai apagar "{item.nome}" permanentemente.</Text>

            {/* Cancelar e confirmar) */}
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
  // Exibicao de erro ao carregar a receita
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, fontSize: 16, marginBottom: 20 },
  btnBack: { padding: 10, backgroundColor: COLORS.primary, borderRadius: 8 },
  btnBackText: { color: '#fff', fontWeight: 'bold' },

  // Detalhes da receita
  content: { 
    padding: 24, backgroundColor: '#fff', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30,
    minHeight: 500, paddingBottom: 50
  },
  // Título da receita
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  
  // Linha que agrupa as tags (categoria, tempo, dificuldade)
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  // Estilo visual de cada tag
  tag: { 
    color: COLORS.primary, fontWeight: 'bold', fontSize: 12,
    backgroundColor: '#FFF0E6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    overflow: 'hidden'
  },
  
  // Ingredientes e Modo de Preparo
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 10, color: COLORS.text },
  // Caixa que envolve a lista de ingredientes
  ingredientsBox: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 12 },
  // Estilo de cada ingrediente listado
  ingredientItem: { fontSize: 16, color: '#444', marginBottom: 5 },
  // Texto usado no modo de preparo e mensagens gerais
  bodyText: { fontSize: 16, color: '#444', lineHeight: 24 },
  
  // botao Editar e Excluir agrupados
  actionsContainer: { marginTop: 40, gap: 15 },
  
  // Botão de editar receita
  editButton: { 
    padding: 15, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, alignItems: 'center', backgroundColor: '#F0F9FF'
  },
  editText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },

  // Botão de excluir receita
  deleteButton: { 
    padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#FEE2E2'
  },
  deleteText: { color: COLORS.danger, fontSize: 16, fontWeight: 'bold' },

  // Botão para alterar imagem da receita
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

  // Fundo escuro do modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  // Caixa branca central do modal
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, elevation: 5, width: '80%' },
  // Título do modal
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  // Texto explicativo dentro do modal
  modalText: { marginBottom: 20, textAlign: 'center', color: '#666' },
  // Container que organiza os botões do modal lado a lado
  modalButtons: { flexDirection: 'row', gap: 15 },
  // Estilo base para botões do modal
  btn: { borderRadius: 10, padding: 12, elevation: 2, minWidth: 100, alignItems: 'center' },
  // Botão de cancelar exclusão
  btnCancel: { backgroundColor: '#E5E7EB' },
  // Botão de confirmar exclusão
  btnDelete: { backgroundColor: COLORS.danger },
  // Texto dentro dos botões do modal
  textStyle: { fontWeight: 'bold', textAlign: 'center' }
});
