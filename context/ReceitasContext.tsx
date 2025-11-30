import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// formato da receita
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
};

const ReceitasContext = createContext<ReceitasContextData>({} as ReceitasContextData);

export function ReceitasProvider({ children }: { children: ReactNode }) {
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    async function loadData() {
      const dados = await AsyncStorage.getItem('@minhas_receitas');
      if (dados) {
        setReceitas(JSON.parse(dados));
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function saveData() {
      await AsyncStorage.setItem('@minhas_receitas', JSON.stringify(receitas));
    }
    saveData();
  }, [receitas]);

  async function adicionarReceita(novaReceita: Omit<Receita, 'id'>) {
    const receitaComId = {
      id: Date.now().toString(),
      ...novaReceita
    };
    
    setReceitas(oldReceitas => [receitaComId, ...oldReceitas]);
  }

  async function removerReceita(id: string) {
    setReceitas(oldReceitas => oldReceitas.filter(item => item.id !== id));
  }

  return (
    <ReceitasContext.Provider value={{ receitas, adicionarReceita, removerReceita }}>
      {children}
    </ReceitasContext.Provider>
  );
}

export function useReceitas() {
  const context = useContext(ReceitasContext);
  if (!context) throw new Error('useReceitas deve ser usado dentro d um ReceitasProvider');
  return context;
}