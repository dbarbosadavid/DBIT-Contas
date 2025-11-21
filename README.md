# 📊 Sistema de Lançamentos e Contas Contábeis  

![React](https://img.shields.io/badge/React-18-blue?logo=react)  
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)  
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)  
![Firebase](https://img.shields.io/badge/Firebase-orange?logo=firebase)  
![License](https://img.shields.io/badge/license-MIT-green)

Um sistema web que permite o gerenciamento de **lançamentos financeiros** vinculados a **contas contábeis**, oferecendo um balanço patrimonial dinâmico e visual.  

---

## 🚀 Funcionalidades  

### 📌 Lançamentos  
- Cadastro de lançamentos com **valor, descrição, data e data de vencimento**.  
- Vinculação de cada lançamento a uma conta contábil.  
- Edição de lançamentos existentes.  

### 📌 Contas Contábeis  
- Cadastro de novas contas contábeis.  
- Edição de contas já existentes.  
- **Validações importantes**:  
  - Não permite criar contas com o mesmo **nome**.  
  - Não permite criar contas com a mesma combinação **grupo > subgrupo > elemento**.  
  - Não permite excluir contas vinculadas a lançamentos.  

### 📌 Balanço  
- Agrupamento automático das contas em:  
  - ✅ Ativos circulantes e não circulantes (com totais)  
  - ✅ Passivos circulantes e não circulantes (com totais)  
  - ✅ Receitas e despesas  
  - ✅ Patrimônio líquido  
  - ✅ Lucro acumulado  
  - ✅ Prejuízo acumulado  
- Visualização **dinâmica, clara e organizada** do balanço patrimonial.  

### 🔐 Autenticação e Banco de Dados  
- **Login e registro de usuários via Firebase Authentication**.  
- **Persistência de dados com Firebase Realtime Database**.  
- Cada usuário acessa apenas seus próprios lançamentos e contas.  

---

## 🛠️ Tecnologias Utilizadas  

- ⚛️ [React](https://react.dev/)  
- ⚡ [Vite](https://vitejs.dev/)  
- 🟦 [TypeScript](https://www.typescriptlang.org/)  
- 🔥 [Firebase Authentication](https://firebase.google.com/docs/auth)  
- 🔥 [Firebase Realtime Database](https://firebase.google.com/docs/database)  
- 🌐 HTML5  
- 🎨 CSS3  

---

## 📦 Instalação e Execução  

```bash
# Clone o repositório
git clone https://github.com/dbarbosadavid/DBIT-Contas.git

# Acesse a pasta do projeto
cd DBIT-Contas

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

No naveagor acesse:
http://localhost:5173/
```
## ⚠️ Configuração do Firebase
## Antes de rodar, crie um projeto no Firebase Console, ative:

* Authentication (modo Email/Senha)

* Realtime Database

* E configure o arquivo .env com as credenciais fornecidas pelo Firebase.

## 📌 Futuras Melhorias

* 🔍 Implementar busca e filtros para lançamentos.

* 📅 Dashboard com gráficos de receitas e despesas por período.

* ☁️ Integração com banco de dados.

## 📜 Licença

Este projeto está sob a licença [MIT](./LICENSE).
