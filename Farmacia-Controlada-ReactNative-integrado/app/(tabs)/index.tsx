import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from "react-native";

import { authApi } from "../../services/api";

export default function HomeScreen() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (!login.trim() || !senha) {
      Alert.alert("Atenção", "Informe login e senha.");
      return;
    }

    try {
      setCarregando(true);
      await authApi.loginUsuario(login, senha);
      router.replace("/(tabs)/user/menuUsuario");
    } catch (error) {
      Alert.alert("Erro ao entrar", error instanceof Error ? error.message : "Não foi possível realizar login.");
    } finally {
      setCarregando(false);
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/LogoFarm.fw.png')}
        style={{ width: 320, height: 135, marginBottom: 20 }}
      />
      <View style={styles.card}>
        <Text style={styles.titulo}>Login</Text>
        <Text style={styles.subtitulo}>Acesse sua conta para continuar.</Text>

        <View style={styles.cardForm}>
          <Text style={styles.label}>CPF ou e-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu CPF ou e-mail"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={login}
            onChangeText={setLogin}
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
          <TouchableOpacity onPress={() => router.push('/empresaLogin')} style={styles.linkEmpresa}>
            <Text style={styles.linkEmpresaText}>Acesso Empresarial</Text>
          </TouchableOpacity>
          
        </View>

        <TouchableOpacity onPress={entrar} style={styles.button} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/cadastroUser')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cadastrar</Text>
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

  linkEmpresa: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },

  linkEmpresaText: {
    fontSize: 12,
    color: '#369262',
    fontWeight: '700',
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

  secondaryButtonText: {
    color: '#369262',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  }
});
