# 🍳 Minhas Receitas — Aplicativo Mobile

## 📖 Visão Geral

**Minhas Receitas** é um aplicativo mobile desenvolvido em React Native que permite organizar, cadastrar e visualizar suas receitas favoritas de forma simples e prática.

## 🌟 Funcionalidades

- **Cadastro Completo:** Crie receitas com título, categoria, tempo de preparo, dificuldade, ingredientes e modo de preparo.
- **Lista de Receitas:** Visualize todas as receitas cadastradas com filtro por categorias (doces, salgados, bebidas etc.).
- **Edição e Exclusão:** Atualize informações ou remova receitas com confirmação de segurança.
- **Persistência Local:** Todos os dados ficam salvos no dispositivo usando `AsyncStorage`.
- **Interface Intuitiva:** UI simples e amigável, construída com componentes nativos do React Native.

## 🎥 Demonstração em Vídeo

Veja o aplicativo em funcionamento e confira as principais funcionalidades na prática:

👉 [**Assistir Demonstração no YouTube**](https://youtube.com/shorts/23wnI2ETTHo?si=4UvRIf8ryocIDHMt "null")

## 📱 Download / Acesso

### 🔽 Instalação Rápida (APK / Build Expo)

Você pode instalar ou testar o app através do link abaixo:

👉 [**Acessar Build no Expo**](https://expo.dev/accounts/dantascg/projects/minhas-receitas/builds/2652e2a7-93bb-4d7f-9a81-adfed2023ce8 "null")

_Esse link permite abrir o app diretamente no Expo Go ou instalar a build disponibilizada._

## 🛠️ (Opcional) Modo Desenvolvedor

Caso você queira executar o projeto em sua máquina local para desenvolvimento:

### Pré-requisitos

- Node.js
- Git
- App Expo Go (Android/iOS)

### Passo a passo

1.  **Clone o repositório**

    ```
    git clone https://github.com/dantascg/receitas-app-mobile.git
    cd receitas-app-mobile

    ```

2.  **Instale as dependências**

    ```
    npm install

    ```

3.  **Inicie o ambiente Expo**

    ```
    npx expo start --tunnel -c

    ```

4.  **Abra no celular**

    - Escaneie o QR Code exibido no terminal usando o app **Expo Go**.

## 👥 Equipe

**Leonardo Dantas:** Arquitetura do projeto, UI/UX, Integração de telas

**Alex Vinicius:** Implementação do Context API, lógica de CRUD (Create/Read/Update/Delete) e persistência com AsyncStorage.

**João Victor Amorim:** Desenvolvimento dos formulários, implementação de componentes nativos (Slider/Picker) e tela de Configurações
