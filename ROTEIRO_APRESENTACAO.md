# Roteiro de apresentação e testes - Farmácia Controlada

Este roteiro demonstra dois fluxos integrados ponta a ponta:

1. usuário solicita medicamento por receita; empresa aprova, autoriza retirada e o estoque baixa automaticamente;
2. usuário doa medicamento; empresa aprova a triagem e o medicamento entra automaticamente no estoque.

## 1. Preparação do ambiente

### API

Entre na pasta da API:

```bash
cd FarmaciaControlada_api-integrada
```

Instale as dependências:

```bash
npm install
```

Configure o `.env` da API. Exemplo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=farmacia_controlada
JWT_SECRET=segredo_farmacia
JWT_EXPIRES_IN=8h
PORT=3333
```

Crie as tabelas e carregue os dados de apresentação:

```bash
npm run db:reset
```

O comando acima recria o banco com os seeds. Para não apagar dados, use:

```bash
npm run db:seed
```

Inicie a API:

```bash
npm run dev
```

Teste rápido:

```bash
curl http://localhost:3333/api/health
```

Resposta esperada:

```json
{"status":"ok"}
```

### Interface React Native / Expo

Em outro terminal:

```bash
cd Farmacia-Controlada-ReactNative-integrado
npm install
npm start
```

A interface usa por padrão:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333/api
```

Se testar em emulador Android, altere para:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api
```

Se testar em celular físico, use o IP da máquina na rede:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_DA_REDE:3333/api
```

## 2. Contas para apresentação

### Usuário/paciente

- Login: `usuario@farmacia.com`
- Senha: `123456`
- CPF: `11122233344`

### Empresa/farmácia

- CNPJ: `12345678000195`
- Senha: `123456`
- Empresa: `Drogaria Sao Lucas LTDA`

## 3. Dados carregados pelos seeds

Os seeds incluem:

- `empresa`
- `usuario_empresa`
- `endereco_empresa`
- `forma_farmaco_medicamento`
- `medicamento`
- `uso_terapeutico_medicamento`
- `medicamento_uso_terapeutico`
- `tarja_medicamento`

Também foram incluídos dados necessários para a demonstração:

- usuários de teste;
- classes farmacológicas;
- vínculos `medicamento_forma_farmaco`;
- estoque inicial da empresa;
- uma receita pendente de exemplo;
- uma doação pendente de exemplo.

Estoque inicial da empresa principal:

- Dipirona: 12 unidades;
- Paracetamol: 8 unidades;
- Ibuprofeno: 4 unidades.

## 4. Fluxo do usuário: pedir remédio por receita

### Objetivo

Demonstrar que o usuário envia uma receita e a empresa consegue aprovar e, depois, retirar o medicamento com baixa automática no estoque.

### Passo a passo do usuário

1. Abra o app.
2. Faça login como usuário:
   - `usuario@farmacia.com`
   - `123456`
3. Entre em **Medicamentos**.
4. Selecione **Dipirona**.
5. Toque para solicitar/agendar retirada.
6. Anexe/tire foto da receita.
7. Preencha os dados:
   - CRM: `123456/SP`
   - Médico: `Dr. Carlos Santos`
   - Paciente: `Joao Silva`
   - Observação: `Receita para dor e febre`
8. Confirme o envio.

### Resultado esperado

A API cria uma receita com status:

```txt
pendente
```

A receita aparece na tela empresarial de receitas.

## 5. Fluxo da empresa: aprovar receita, autorizar e retirar medicamento

### Objetivo

Demonstrar que a empresa aprova a receita e que a retirada baixa o estoque automaticamente.

### Passo a passo da empresa

1. Saia da conta de usuário, se necessário.
2. Entre no login empresarial.
3. Faça login com:
   - CNPJ: `12345678000195`
   - Senha: `123456`
4. Acesse **Receitas**.
5. Localize a receita enviada pelo usuário ou a receita demo já criada pelo seed.
6. Toque em **Aprovar receita**.

Resultado esperado após aprovação:

```txt
status = aprovada
```

7. Ainda em **Receitas**, toque em **Confirmar retirada e baixar estoque**.

Resultado esperado após retirada:

```txt
status = dispensada
```

E no estoque da empresa:

```txt
quantidade_atual = quantidade_anterior - quantidade_da_receita
```

Exemplo com o seed:

```txt
Dipirona começa com 12 unidades.
Receita demo pede 1 unidade.
Depois da retirada, Dipirona fica com 11 unidades.
```

8. Acesse **Estoque** e confirme a redução da quantidade.

## 6. Fluxo do usuário: doar medicamento

### Objetivo

Demonstrar que o usuário cadastra uma doação e a empresa faz a triagem.

### Passo a passo do usuário

1. Entre como usuário.
2. Acesse **Doações**.
3. Toque em **Realizar Doação**.
4. Preencha:
   - Medicamento: `Paracetamol`
   - Descrição: `Caixa lacrada para doação`
   - Quantidade: `3`
   - Validade: `12/2027`
5. Confirme a doação.

### Resultado esperado

A API cria uma doação e uma triagem com status:

```txt
pendente
```

## 7. Fluxo da empresa: aprovar triagem da doação e entrar no estoque

### Objetivo

Demonstrar que a aprovação da triagem gera entrada automática no estoque.

### Passo a passo da empresa

1. Entre como empresa.
2. Acesse **Doação** no menu empresarial.
3. Localize a doação pendente.
4. Toque em **Aprovar**.

Resultado esperado:

```txt
triagem.status = aprovada
triagem.aprovado = true
```

A API cria uma movimentação em `item_estoque_medicamento`:

```txt
tipo = entrada
quantidade = quantidade_doada
triagem_doacao_id = id_da_triagem
```

E atualiza o estoque:

```txt
quantidade_atual = quantidade_anterior + quantidade_doada
```

Exemplo com o seed:

```txt
Paracetamol começa com 8 unidades.
Doação demo possui 3 unidades.
Depois de aprovar a triagem, Paracetamol fica com 11 unidades.
```

5. Acesse **Estoque** e confirme o aumento da quantidade.

## 8. Fluxo de reprovação

### Receita

Na tela empresarial de **Receitas**, uma receita pendente pode ser reprovada. Resultado esperado:

```txt
status = rejeitada
```

Receitas rejeitadas não podem ser retiradas nem baixar estoque.

### Doação

Na tela empresarial de **Doação**, uma triagem pendente pode ser reprovada. Resultado esperado:

```txt
triagem.status = reprovada
triagem.aprovado = false
```

Doações reprovadas não entram no estoque.

## 9. Pontos técnicos implementados

### Receita

- `receita_usuario.status` agora controla o ciclo:
  - `pendente`
  - `aprovada`
  - `rejeitada`
  - `dispensada`
- `PATCH /api/receitas/:id/aprovar` aprova e autoriza a retirada.
- `PATCH /api/receitas/:id/reprovar` rejeita a receita.
- `POST /api/receitas/:id/dispensar` baixa o estoque e muda a receita para `dispensada`.
- A baixa só ocorre se a receita estiver aprovada e houver estoque suficiente.

### Doação

- `triagem_doacao.status` agora controla o ciclo:
  - `pendente`
  - `aprovada`
  - `reprovada`
- `PATCH /api/doacoes/triagens/:triagemId/aprovar` aprova a triagem e lança entrada no estoque.
- `PATCH /api/doacoes/triagens/:triagemId/reprovar` rejeita a triagem.
- Se a doação vier apenas com nome do medicamento, a API tenta vincular automaticamente ao catálogo pelo nome.

### Estoque

- Entradas de doação geram `item_estoque_medicamento` com `tipo = entrada`.
- Retiradas por receita geram `item_estoque_medicamento` com `tipo = saida`.
- `estoque_medicamento.quantidade_atual` é atualizado dentro de transação.

## 10. Sequência curta para apresentação ao vivo

1. Rodar `npm run db:reset` na API.
2. Rodar `npm run dev` na API.
3. Abrir app com `npm start`.
4. Login empresa: `12345678000195 / 123456`.
5. Abrir **Estoque** e mostrar Dipirona = 12 e Paracetamol = 8.
6. Abrir **Receitas**, aprovar receita demo e confirmar retirada.
7. Voltar ao **Estoque** e mostrar Dipirona = 11.
8. Abrir **Doação**, aprovar doação demo.
9. Voltar ao **Estoque** e mostrar Paracetamol = 11.
10. Explicar que os dois movimentos são transacionais na API: receita baixa estoque; doação aprovada entra no estoque.
