import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
  Image
} from 'react-native';

// Slider pra escolher a dificuldade
// Picker pra escolher categoria
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

// Expo Router pra navegar entre telas e pegar parametros da rota
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

// Cores do tema e contexto de receitas (adicionar e atualizar)
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';

// Biblioteca pra abrir a galeria
import * as ImagePicker from 'expo-image-picker';

// Imagem padrao caso nao adicione imagem na receita
const blankImage = require('../assets/images/imagemBranca.png');

// Componente principal da tela de adicionar/editar receita
export default function AdicionarReceitas() {
  // Router pra navegação e parametros vindos da rota de quando editamos uma receita
  const router = useRouter();
  const params = useLocalSearchParams();

  // Funções de salvar e atualizar receitas
  const { adicionarReceita, atualizarReceita } = useReceitas();

  // Converte o parametro "receita" enviado pela rota para objeto (modo edição)
  const receitaParaEditar = params.receita ? JSON.parse(params.receita as string) : null;
  const isEditing = !!receitaParaEditar; // booleano pra saber se estamos editando

  // Estados dos campos do formulário (iniciados com valores da receita se estiver sendo editado)
  const [nome, setNome] = useState(receitaParaEditar?.nome || '');
  const [categoria, setCategoria] = useState(receitaParaEditar?.categoria || 'Salgado');
  const [dificuldade, setDificuldade] = useState(receitaParaEditar?.dificuldade || 3);
  const [tempo, setTempo] = useState(receitaParaEditar?.tempo?.replace(' min', '') || '');
  const [ingredientes, setIngredientes] = useState(receitaParaEditar?.ingredientes?.join('\n') || '');
  const [modoPreparo, setModoPreparo] = useState(receitaParaEditar?.modoPreparo || '');
  const [imagem, setImagem] = useState<string>(''); // URI da imagem selecionada (ou vazia)

  // Controle pra mostrar ou ocultar o picker no iOS
  const [showPicker, setShowPicker] = useState(false);

  // Se está editando uma receita que já possua imagem, coloca ela no estado ao montar
  useEffect(() => {
    if (receitaParaEditar?.imagem) {
      setImagem(receitaParaEditar.imagem);
    }
  }, [receitaParaEditar]);

  // Função que abre a galeria e atualiza com a imagem nova
  const escolherImagem = async () => {
    // Pede permissão pra acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Você precisa permitir acesso às fotos.");
      return;
    }

    // Abre a galeria com opções (apenas imagens e permite edicao com mairo qualidade de imagem)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Se o usuário escolheu uma imagem salva ela no estado
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0].uri);
    }
  };

  // Função chamada ao apertar "Salvar"
  const handleSalvar = async () => {
    // Validação simples: nome e ingredientes são parametros obrigatorios
    if (!nome.trim() || !ingredientes.trim()) {
      Alert.alert('Atenção', 'Preencha nome e ingredientes!');
      return;
    }

    // Resolve a URI da imagem local de fallback (imagem branca)
    const blankUri = Image.resolveAssetSource(blankImage).uri;

    // Monta o objeto que será salvo
    const dadosFormulario = {
      nome,
      categoria,
      dificuldade,
      tempo: `${tempo} min`,
      ingredientes: ingredientes.split('\n').filter((i: string) => i.trim()),
      modoPreparo,
      imagem: imagem || blankUri
    };

    try {
      // Se estamos editando, chama atualizar, se nao estiver, adiciona nova receita
      if (isEditing && receitaParaEditar?.id) {
        await atualizarReceita(receitaParaEditar.id, dadosFormulario);
        Alert.alert('Sucesso', 'Receita atualizada!');
      } else {
        await adicionarReceita(dadosFormulario);
        Alert.alert('Sucesso', 'Receita criada!');
      }
      
      // Volta pra tela inicial 
      router.replace('/'); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  // Render da tela: KeyboardAvoidingView pra o teclado não cobrir inputs
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#fff' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Configura título da tela dinamicamente (Editar ou Nova Receita) */}
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Editar Receita' : 'Nova Receita',
          headerBackTitle: 'Voltar' 
        }} 
      />

      {/* ScrollView com os campos do formulário */}
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        
        {/* Nome da receita */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome da Receita</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Bolo de Chocolate"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#999"
          />
        </View>

        {/* Imagem da receita */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Imagem da Receita</Text>
          <Image 
            source={imagem ? { uri: imagem } : blankImage} 
            style={styles.previewImage} 
          />
          <TouchableOpacity style={styles.button} onPress={escolherImagem}>
            <Text style={styles.buttonText}>Escolher Imagem</Text>
          </TouchableOpacity>
        </View>

        {/* Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria</Text>
          {Platform.OS === 'ios' ? (
            <View>
              {/* Mostra o valor atual e abrir o picker ao clicar */}
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowPicker(!showPicker)}
              >
                <Text style={{ fontSize: 16, color: '#1A1A1A' }}>{categoria}</Text>
              </TouchableOpacity>
              {showPicker && (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={categoria}
                    onValueChange={(itemValue) => { setCategoria(itemValue); setShowPicker(false); }}
                    style={styles.picker}
                    itemStyle={{fontSize: 16, height: 120, color: '#000'}}
                  >
                    <Picker.Item label="Salgado" value="Salgado" />
                    <Picker.Item label="Doce" value="Doce" />
                    <Picker.Item label="Bebida" value="Bebida" />
                    <Picker.Item label="Salada" value="Salada" />
                    <Picker.Item label="Sobremesa" value="Sobremesa" />
                  </Picker>
                </View>
              )}
            </View>
          ) : (
            // Android: mostra o picker diretamente dentro de um wrapper
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={categoria}
                onValueChange={(itemValue) => setCategoria(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Salgado" value="Salgado" />
                <Picker.Item label="Doce" value="Doce" />
                <Picker.Item label="Bebida" value="Bebida" />
                <Picker.Item label="Salada" value="Salada" />
                <Picker.Item label="Sobremesa" value="Sobremesa" />
              </Picker>
            </View>
          )}
        </View>

        {/* Dificuldade*/}
        <View style={styles.inputContainer}>
          <View style={styles.rowLabel}>
            <Text style={styles.label}>Dificuldade: {dificuldade}</Text>
            <Text style={styles.subLabel}>(1 = Fácil, 5 = Difícil)</Text>
          </View>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={dificuldade}
            onValueChange={setDificuldade}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor={COLORS.primary}
          />
        </View>

        {/* Tempo em minutos */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tempo (minutos)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 45"
            value={tempo}
            onChangeText={setTempo}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Ingredientes*/}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ingredientes (um por linha)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={'2 xícaras de farinha\n3 ovos'}
            value={ingredientes}
            onChangeText={setIngredientes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Modo de preparo*/}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Modo de Preparo</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Passo a passo..."
            value={modoPreparo}
            onChangeText={setModoPreparo}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Botão salvar */}
        <TouchableOpacity 
          style={[styles.button, !nome.trim() && styles.buttonDisabled]} 
          onPress={handleSalvar}
          disabled={!nome.trim()}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Salvar Receita'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// Estilos da tela — separados por blocos com comentários acima (explicando cada grupo)
const styles = StyleSheet.create({
  // Container principal da tela
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  // Cada bloco de input tem margem inferior
  inputContainer: { marginBottom: 20 },

  // Label dos inputs (nome do campo)
  label: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },

  // Linha que mostra label e sublabel
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subLabel: { fontSize: 12, color: '#666' },

  // Estilo base dos inputs
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 16, color: '#1A1A1A', backgroundColor: '#FAFAFA' },

  // Ajuste específico para textareas (altura mínima)
  textArea: { minHeight: 100 },

  // Preview da imagem selecionada da galeria
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },

  // Wrapper do picker
  pickerWrapper: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', overflow: 'hidden', marginTop: 5 },

  // Estilo do componente Picker
  picker: { width: '100%', height: Platform.OS === 'android' ? 50 : undefined },

  // Botão principal (salvar / escolher imagem)
  button: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 5 },

  // Estado visual do botão quando desabilitado
  buttonDisabled: { backgroundColor: '#ccc', elevation: 0 },

  // Texto dentro dos botões
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
