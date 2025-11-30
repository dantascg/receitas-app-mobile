import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Receita = {
  id: string;
  nome: string;
  categoria: string;
  dificuldade: number;
  tempo: string;
  ingredientes: string[];
  modoPreparo: string;
  imagem: string;
};

type ReceitasContextData = {
  receitas: Receita[];
  adicionarReceita: (receita: Omit<Receita, 'id'>) => Promise<void>;
  removerReceita: (id: string) => Promise<void>;
  atualizarReceita: (id: string, dadosAtualizados: Partial<Omit<Receita, 'id'>>) => Promise<void>;
};

const ReceitasContext = createContext<ReceitasContextData>({} as ReceitasContextData);

export function ReceitasProvider({ children }: { children: ReactNode }) {
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const dados = await AsyncStorage.getItem('@minhas_receitas');
        if (dados) setReceitas(JSON.parse(dados));
      } catch (error) { console.error(error); }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function saveData() {
      try {
        if (receitas.length > 0) await AsyncStorage.setItem('@minhas_receitas', JSON.stringify(receitas));
      } catch (error) { console.error(error); }
    }
    saveData();
  }, [receitas]);

  async function adicionarReceita(novaReceita: Omit<Receita, 'id'>) {
    const receitaComId = { id: Date.now().toString(), ...novaReceita };
    setReceitas(old => [receitaComId, ...old]);
  }

  async function removerReceita(id: string) {
    setReceitas(old => old.filter(item => item.id !== id));
    // Força salvar vazio se for o último item (correção de bug comum)
    if (receitas.length === 1) await AsyncStorage.removeItem('@minhas_receitas');
  }

  // A FUNÇÃO NOVA DO DEV 2
  async function atualizarReceita(id: string, dadosAtualizados: Partial<Omit<Receita, 'id'>>) {
    setReceitas(old => old.map(receita => 
      receita.id === id ? { ...receita, ...dadosAtualizados } : receita
    ));
  }

  return (
    <ReceitasContext.Provider value={{ receitas, adicionarReceita, removerReceita, atualizarReceita }}>
      {children}
    </ReceitasContext.Provider>
  );
}

export function useReceitas() {
  const context = useContext(ReceitasContext);
  if (!context) throw new Error('useReceitas deve ser usado dentro de um ReceitasProvider');
  return context;
}