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
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useReceitas } from '../context/ReceitasContext';
import * as ImagePicker from 'expo-image-picker';

// use require para assets locais
const blankImage = require('../assets/images/imagemBranca.png');

export default function AdicionarReceitas() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { adicionarReceita, atualizarReceita } = useReceitas();

  const receitaParaEditar = params.receita ? JSON.parse(params.receita as string) : null;
  const isEditing = !!receitaParaEditar;

  const [nome, setNome] = useState(receitaParaEditar?.nome || '');
  const [categoria, setCategoria] = useState(receitaParaEditar?.categoria || 'Salgado');
  const [dificuldade, setDificuldade] = useState(receitaParaEditar?.dificuldade || 3);
  const [tempo, setTempo] = useState(receitaParaEditar?.tempo?.replace(' min', '') || '');
  const [ingredientes, setIngredientes] = useState(receitaParaEditar?.ingredientes?.join('\n') || '');
  const [modoPreparo, setModoPreparo] = useState(receitaParaEditar?.modoPreparo || '');
  const [imagem, setImagem] = useState<string>('');

  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (receitaParaEditar?.imagem) {
      setImagem(receitaParaEditar.imagem);
    }
  }, [receitaParaEditar]);

  const escolherImagem = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão necessária", "Você precisa permitir acesso às fotos.");
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

  const handleSalvar = async () => {
    if (!nome.trim() || !ingredientes.trim()) {
      Alert.alert('Atenção', 'Preencha nome e ingredientes!');
      return;
    }

    const blankUri = Image.resolveAssetSource(blankImage).uri;

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
      if (isEditing && receitaParaEditar?.id) {
        await atualizarReceita(receitaParaEditar.id, dadosFormulario);
        Alert.alert('Sucesso', 'Receita atualizada!');
      } else {
        await adicionarReceita(dadosFormulario);
        Alert.alert('Sucesso', 'Receita criada!');
      }
      
      router.replace('/'); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#fff' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Editar Receita' : 'Nova Receita',
          headerBackTitle: 'Voltar' 
        }} 
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria</Text>
          {Platform.OS === 'ios' ? (
            <View>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subLabel: { fontSize: 12, color: '#666' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 16, color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  textArea: { minHeight: 100 },

  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },

  pickerWrapper: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', overflow: 'hidden', marginTop: 5 },
  picker: { width: '100%', height: Platform.OS === 'android' ? 50 : undefined },
  button: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 5 },
  buttonDisabled: { backgroundColor: '#ccc', elevation: 0 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
