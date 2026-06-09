import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from 'expo-camera';


import { obterAuth, limparAuth, API_BASE_URL } from "../../../services/api"; 


const formatarCNPJ = (cnpj: string) => {
  if (!cnpj) return "";
  const puro = cnpj.replace(/\D/g, "");
  return puro.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const formatarTelefone = (tel: string) => {
  if (!tel) return "";
  const puro = tel.replace(/\D/g, "");
  if (puro.length === 11) {
    return puro.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return puro.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
};

const formatarData = (dataRaw: string) => {
  if (!dataRaw) return "";
  try {
    const data = new Date(dataRaw);
    if (isNaN(data.getTime())) return dataRaw; 
    return data.toLocaleDateString("pt-BR");
  } catch {
    return dataRaw;
  }
};

export default function Perfil() {
  const [dadosEmpresa, setDadosEmpresa] = useState<any>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [perfilFoto, setPerfilFoto] = useState<string | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState<boolean>(false);
  const [ladoCamera, setLadoCamera] = useState<'back' | 'front'>('front'); 

  const [permissao, pedirPermissao] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const auth = await obterAuth();
        if (auth && auth.empresa) {
          setDadosEmpresa(auth.empresa);
          
         
          if (auth.empresa.foto) {
            setPerfilFoto(`${API_BASE_URL}/uploads/${auth.empresa.foto}`);
          }
        } else {
          Alert.alert("Sessão Expirada", "Não foi possível carregar os dados da empresa.");
          router.replace('/(tabs)/empresaLogin');
        }
      } catch (error) {
        console.log("Erro ao obter dados locais:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  const handleAbrirCamera = async () => {
    if (!permissao?.granted) {
      const resultado = await pedirPermissao();
      if (!resultado.granted) return; 
    }
    setCameraAtiva(true);
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      try {
        const foto = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        if (foto && foto.uri) {
          setPerfilFoto(foto.uri); 
          setCameraAtiva(false);   
        
        }
      } catch (error) {
        console.log("Erro ao tirar foto:", error);
      }
    }
  };

  const handleSair = async () => {
    Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: "destructive",
        onPress: async () => {
          await limparAuth(); 
          router.replace('/(tabs)/empresaLogin');
        }
      }
    ]);
  };

  if (carregando) {
    return (
      <View style={[styles.container, styles.containerCentro]}>
        <ActivityIndicator size="large" color="#72CAA5" />
        <Text style={styles.textoCarregando}>Carregando dados do perfil...</Text>
      </View>
    );
  }

  if (cameraAtiva) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          facing={ladoCamera} 
          ref={cameraRef}
        />
          
        <TouchableOpacity style={styles.botaoFecharCamera} onPress={() => setCameraAtiva(false)}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.containerBotoesCamera}>
          <TouchableOpacity 
            style={styles.botaoCirculoSecundario} 
            onPress={() => setLadoCamera(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoDisparador} onPress={tirarFoto}>
            <View style={styles.circuloInternoDisparador} />
          </TouchableOpacity>

          <View style={{ width: 50 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.profileGroup}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={perfilFoto ? { uri: perfilFoto } : require('../../../assets/LogoFarm.fw.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity style={styles.photoButton} onPress={handleAbrirCamera}>
              <Ionicons name="camera-outline" size={16} color="#2A7B63" />
              <Text style={styles.photoButtonText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.companyName} numberOfLines={2}>
              {dadosEmpresa?.razaoSocial || dadosEmpresa?.nome || "Empresa Logada"}
            </Text>
            <Text style={styles.companyRole}>Conta corporativa</Text>
            <Text style={styles.companyStatus}>Perfil verificado e ativo</Text>
          </View>

          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informações da empresa</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CNPJ</Text>
            <Text style={styles.infoValue}>{formatarCNPJ(dadosEmpresa?.cnpj)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <Text style={styles.infoValue}>
              {dadosEmpresa?.endereco || "Não informado"}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>
              {formatarTelefone(dadosEmpresa?.telefone) || "Não informado"}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{dadosEmpresa?.email || "Não informado"}</Text>
          </View>
          
          {dadosEmpresa?.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conta criada em</Text>
              <Text style={styles.infoValue}>{formatarData(dadosEmpresa.createdAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleSair}>
            <Ionicons name="log-out-outline" size={18} color="#2A7B63" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => Alert.alert("Aviso", "A exclusão de conta corporativa deve ser solicitada ao suporte.")}
          >
            <Ionicons name="trash-outline" size={18} color="#D92F2F" />
            <Text style={styles.deleteButtonText}>Excluir conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F5',
  },
  containerCentro: {
    justifyContent: "center",
    alignItems: "center",
  },
  textoCarregando: {
    marginTop: 12,
    color: "#7D8D86",
    fontSize: 15,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 40, 
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#72CAA5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImageWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#CDE8E1',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileGroup: {
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 18,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  companyRole: {
    marginTop: 4,
    fontSize: 13,
    color: '#E2F1EE',
  },
  photoButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F4EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoButtonText: {
    marginLeft: 8,
    color: '#2A7B63',
    fontSize: 12,
    fontWeight: '700',
  },
  companyStatus: {
    marginTop: 4,
    fontSize: 12,
    color: '#E2F1EE',
    fontWeight: '700',
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutButton: {
    borderColor: '#C7E3D7',
    backgroundColor: '#E9F3EF',
  },
  logoutButtonText: {
    color: '#2A7B63',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F3832',
    marginBottom: 18,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D8D86',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#273631',
    lineHeight: 22,
  },
  deleteButton: {
    borderColor: '#D92F2F',
    backgroundColor: '#FFF4F4',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#D92F2F',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  botaoFecharCamera: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  containerBotoesCamera: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
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