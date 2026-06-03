# Integração API + React Native

Este pacote contém os dois projetos integrados com mudanças mínimas:

- `FarmaciaControlada_api-integrada`: API Express/Sequelize.
- `Farmacia-Controlada-ReactNative-integrado`: interface Expo React Native.

## API

```bash
cd FarmaciaControlada_api-integrada
npm install
cp .env.example .env
npm run dev
```

A API sobe por padrão em `http://localhost:3333/api`.

## Interface

```bash
cd Farmacia-Controlada-ReactNative-integrado
npm install
cp .env.example .env
npm start
```

A interface usa `EXPO_PUBLIC_API_URL` para acessar a API.

Exemplos:

```env
# Web/iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:3333/api

# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api

# Celular físico na mesma rede
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333/api
```

## O que foi integrado

- Login de usuário com `/api/auth/usuario/login`.
- Login de empresa com `/api/auth/empresa/login`.
- Cadastro de usuário com `/api/usuarios`.
- Cadastro de empresa com `/api/empresas`.
- Listagem de medicamentos com `/api/medicamentos`.
- Envio de receita a partir da tela de detalhes do medicamento com `/api/receitas` e upload da imagem em `/api/imagens/receitas/:id`.
- Registro de doação do usuário com `/api/doacoes`.
- Listagem/movimentação básica de estoque da empresa com `/api/estoque-medicamentos`.

## Observações

- O banco MySQL precisa estar criado e configurado no `.env` da API.
- O catálogo de medicamentos precisa ter dados cadastrados para que telas de medicamentos, doações e receitas funcionem completamente.
- `node_modules` e `.env` reais foram removidos do pacote final.
