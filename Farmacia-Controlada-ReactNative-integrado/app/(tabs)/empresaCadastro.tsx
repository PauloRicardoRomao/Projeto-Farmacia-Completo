
import { ActivityIndicator, Alert, StyleSheet, TextInput, View, Text, TouchableOpacity, Image, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from '../../services/api';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [logo, setLogo] = useState<string | null>(null)
  const [permissao, setPermissao] = useCameraPermissions()
  const [cameraAtiva, setCameraAtiva] = useState<boolean>(false)
  const [ladoCamera, setLadoCamera] = useState<'back' | 'front'>('back');
  const [cnpj, setCnpj] = useState<string>('')
  const [razaoSocial, setRazaoSocial] = useState<string>('')
  const [senha, setSenha] = useState<string>('')
  const [confirmarSenha, setConfirmarSenha] = useState<string>('')
  const [rua, setRua] = useState<string>('')
  const [bairro, setBairro] = useState<string>('')
  const [cidade, setCidade] = useState<string>('')
  const [uf, setUf] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const cameraRef = useRef<any>(null);


  const handleAbrirCamera = async () => {
    if (!permissao?.granted) {
        const resposta = await setPermissao();

        if (resposta.granted) {
            setCameraAtiva(true);
        }
    } else {
        setCameraAtiva(true);
    }
    };

  const salvarDados = async () => {
    if (!cnpj.trim() || !razaoSocial.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha CNPJ, razão social e senha.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não conferem.');
      return;
    }

    if (!rua.trim() || !cidade.trim() || !uf.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha endereço, cidade e UF.');
      return;
    }
    
    try {
      setCarregando(true);
      await api.post(
        '/empresas',
        {
          cnpj,
          razaoSocial,
          senha,
          endereco: {
            endereco: rua,
            bairro: bairro || 'Não informado',
            numero: 0,
            cidade,
            estado: uf,
          },
        },
        { auth: false },
      );

      Alert.alert('Sucesso', 'Empresa cadastrada com sucesso.', [
        { text: 'Entrar', onPress: () => router.replace('/(tabs)/empresaLogin') },
      ]);
    } catch (erro) {
      Alert.alert('Erro ao cadastrar', erro instanceof Error ? erro.message : 'Não foi possível cadastrar a empresa.');
    } finally {
      setCarregando(false);
    }
  }

    const tirarFoto = async () => {
        if(cameraRef.current) {
            try{
                const foto = await cameraRef.current.takePictureAsync()
                if(foto && foto.uri){
                    setCameraAtiva(false)
                    setLogo(foto.uri)
                }
            } catch (error) {
            alert(error)
        }
    }}

    if(cameraAtiva) {
              return (
              <View style={styles.cameraContainer}>
                      <CameraView 
                        style={styles.camera} 
                        facing={ladoCamera} 
                        ref={cameraRef}
                      >
                        <TouchableOpacity style={styles.botaoFecharCamera} onPress={() => setCameraAtiva(false)}>
                          <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
              
                        <View style={styles.containerBotoesCamera}>
                          <TouchableOpacity 
                            style={styles.botaoCirculoSecundario} 
                            onPress={() => setLadoCamera(lado => (lado === 'back' ? 'front' : 'back'))}
                          >
                            <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.botaoDisparador} onPress={tirarFoto}>
                            <View style={styles.circuloInternoDisparador} />
                          </TouchableOpacity>
              
                          <View style={{ width: 50 }} />
                        </View>
                      </CameraView>
              </View>
              )
          }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
        source={require('../../assets/LogoFarm.fw.png')}
        style={{ width: 200, height: 80, marginBottom: 10 }}
      />
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/empresaLogin')} style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#369262', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>X</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Cadastrar Empresa</Text>
        <Text style={styles.subtitulo}>Cadastre sua empresa para continuar.</Text>

        <View style={styles.logoSection}>
          <Text style={styles.sectionLabel}>Logo da empresa</Text>
          <Text style={styles.sectionDescription}>Adicione a imagem da empresa para personalizar seu perfil.</Text>
          
          {logo ? (
            <View style={styles.logoPreview}>
              <Image
              source={logo ? {uri: logo}: require('../../assets/LogoFarm.fw.png')}
              style={{width: 210,  height: 210, borderRadius: 45}}
              />
          </View>
          ): (
            <View style={styles.logoPreview}>
            <Ionicons name="image-outline" size={36} color="#AFB8B3" />
            <Text style={styles.logoPreviewText}>Logomarca</Text>
          </View>
          )}
          
          <TouchableOpacity style={styles.logoButton} onPress={handleAbrirCamera}>
            <Ionicons name="camera-outline" size={18} color="#369262" />
            <Text style={styles.logoButtonText}>Adicionar logo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>CNPJ</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000/0000-00"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              keyboardType="numeric"
              autoCapitalize="none"
              value={cnpj}
              onChangeText={setCnpj}
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="contato@empresa.com"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 99999-9999"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Razão Social</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome jurídico da empresa"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={razaoSocial}
              onChangeText={setRazaoSocial}
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Nome Fantasia</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome de exibição"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número"
              value={rua}
              onChangeText={setRua}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              value={bairro}
              onChangeText={setBairro}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Estado</Text>
            <TextInput
              style={styles.input}
              placeholder="UF"
              value={uf}
              onChangeText={setUf}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              maxLength={2}
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
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

          <View style={[styles.cardForm, isWide && styles.cardFormHalf]}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={salvarDados} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Cadastrar Empresa</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#72CAA5',
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 760,
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

  formRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardForm: {
    width: '100%',
    minWidth: 0,
    marginBottom: 18,
  },
  cardFormHalf: {
    width: '48%',
    minWidth: '48%',
  },
  label: {
    fontSize: 13,
    color: '#3F524A',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    backgroundColor: '#F5F7F6',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E7E5',
    color: '#1F3832',
  },
  logoSection: {
    backgroundColor: '#F9FBFA',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3E8E5',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26493A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#5D7268',
    marginBottom: 16,
    lineHeight: 20,
  },
  logoPreview: {
    width: '100%',
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: '#EFF5F2',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  logoPreviewText: {
    marginTop: 8,
    color: '#7B8C85',
    fontSize: 13,
    fontWeight: '600',
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#369262',
    backgroundColor: 'rgba(54, 146, 98, 0.08)',
  },
  logoButtonText: {
    marginLeft: 10,
    color: '#369262',
    fontSize: 14,
    fontWeight: '700',
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
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  botaoFecharCamera: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 30,
  },
  containerBotoesCamera: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  botaoCirculoSecundario: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDisparador: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloInternoDisparador: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF',
  },
  
});
