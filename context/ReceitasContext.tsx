import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// definindo a estrutura de dados da receita e a interface dos metodos do contexto
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

  // carrega as receitas do asyncStorage ao iniciar o componente (apenas uma vez)
  useEffect(() => {
    async function loadData() {
      try {
        const dados = await AsyncStorage.getItem('@minhas_receitas');
        if (dados) setReceitas(JSON.parse(dados));
      } catch (error) { console.error(error); }
    }
    loadData();
  }, []);

  // monitora alteracoes no estado receitas e sincroniza com o banco local
  useEffect(() => {
    async function saveData() {
      try {
        if (receitas.length > 0) await AsyncStorage.setItem('@minhas_receitas', JSON.stringify(receitas));
      } catch (error) { console.error(error); }
    }
    saveData();
  }, [receitas]);

  // cria uma nova receita e gera um ID unico baseado no timestamp atual
  async function adicionarReceita(novaReceita: Omit<Receita, 'id'>) {
    const receitaComId = { id: Date.now().toString(), ...novaReceita };
    setReceitas(old => [receitaComId, ...old]);
  }

  // remove o item da lista e limpa o armazenamento se for o ultimo elemento
  async function removerReceita(id: string) {
    setReceitas(old => old.filter(item => item.id !== id));
    if (receitas.length === 1) await AsyncStorage.removeItem('@minhas_receitas');
  }

  // atualiza apenas os campos enviados, mantendo o restante dos dados da receita
  async function atualizarReceita(id: string, dadosAtualizados: Partial<Omit<Receita, 'id'>>) {
    setReceitas(old => old.map(receita => 
      receita.id === id ? { ...receita, ...dadosAtualizados } : receita
    ));
  }

  // disponibiliza o estado e funçoes CRUD para todos os componentes filhos
  return (
    <ReceitasContext.Provider value={{ receitas, adicionarReceita, removerReceita, atualizarReceita }}>
      {children}
    </ReceitasContext.Provider>
  );
}

// hook que facilita o acesso ao contexto e garantir que esta dentro do provider
export function useReceitas() {
  const context = useContext(ReceitasContext);
  if (!context) throw new Error('useReceitas deve ser usado dentro de um ReceitasProvider');
  return context;
}