import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

import { api } from "../../services/api";

export default function CadastroUsuarioScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf,setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const criarConta = async () => {
    if (!email.trim() || !senha || !cpf) {
      Alert.alert("Atenção", "Informe CPF, e-mail e senha.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não conferem.");
      return;
    }

    const EmailTratado = email.trim();
    const CpfTratado = cpf.trim();

    try {
      setCarregando(true);
      await api.post(
        "/usuarios",
        {
          nome: nome.trim() || null,
          email: EmailTratado || null,
          cpf: CpfTratado || null,
          senha,
        },
        { auth: false },
      );

      Alert.alert("Sucesso", "Conta criada com sucesso.", [
        { text: "Entrar", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert("Erro ao cadastrar", error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/LogoFarm.fw.png')}
        style={{ width: 200, height: 80, marginBottom: 10 }}
      />
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.push('/')} style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#369262', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>X</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Cadastro</Text>
        <Text style={styles.subtitulo}>Crie sua conta para continuar.</Text>

        <View style={styles.listaRequisitos}>
          <Text style={styles.listaItem}>• Senha deve conter pelo menos 8 caracteres</Text>
          <Text style={styles.listaItem}>• Senha deve conter pelo menos uma letra maiúscula</Text>
          <Text style={styles.listaItem}>• Senha deve conter pelo menos uma letra minúscula</Text>
          <Text style={styles.listaItem}>• Senha deve conter pelo menos um número</Text>
        </View>

        <View style={styles.cardForm}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.cardForm}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu CPF ou e-mail"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.cardForm}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu CPF ou e-mail"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={cpf}
            onChangeText={setCpf}
          />
        </View>

        <View style={styles.cardForm}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>
        
        <View style={styles.cardForm}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha novamente"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={criarConta} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#72CAA5',
    paddingHorizontal: 20,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#173826',
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 14,
    color: '#5A6C63',
    marginBottom: 24,
    lineHeight: 20,
  },

  cardForm: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: '#3F524A',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    backgroundColor: '#F5F7F6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E7E5',
    color: '#1F3832',
  },

  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#369262',
    marginTop: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#369262',
    marginTop: 14,
  },

  listaRequisitos: {
    marginBottom: 18,
  },

  listaItem: {
    fontSize: 13,
    color: '#3F524A',
    lineHeight: 20,
    marginBottom: 3,
  },

  secondaryButtonText: {
    color: '#369262',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  }
});
