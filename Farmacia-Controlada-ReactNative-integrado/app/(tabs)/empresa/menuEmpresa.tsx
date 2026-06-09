import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';


import { api, obterAuth } from "../../../services/api";

type StatusReceita = "pendente" | "aprovada" | "rejeitada" | "dispensada";
type StatusTriagem = "pendente" | "aprovada" | "reprovada";

type ReceitaApi = {
  id: number;
  status?: StatusReceita;
  crmMedico?: string | null;
  dataEmissao: string;
  usuario?: { nome?: string | null; cpf?: string | null } | null;
  receitasMedicamentos?: Array<{
    quantidade: number;
    medicamentoFormaFarmaco?: {
      medicamento?: { nome?: string };
    } | null;
  }>;
};


type ItemDoacaoApi = {
  id: number;
  triagemDoacao?: {
    id: number;
    status?: StatusTriagem;
    aprovado: boolean;
    ativo: boolean;
  } | null;
};

type DoacaoApi = {
  id: number;
  medicamentoDoacoes?: ItemDoacaoApi[];
};


function normalizarStatusDoacao(item: ItemDoacaoApi): StatusTriagem {
  if (item.triagemDoacao?.status) return item.triagemDoacao.status;
  if (item.triagemDoacao?.aprovado) return "aprovada";
  if (item.triagemDoacao?.ativo === false) return "reprovada";
  return "pendente";
}

export default function HomeScreen() {
  const [receitas, setReceitas] = useState<ReceitaApi[]>([]);
  const [doacoesRaw, setDoacoesRaw] = useState<DoacaoApi[]>([]); 
  const [carregando, setCarregando] = useState<boolean>(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

 
  async function carregarDadosDashboard() {
    try {
      setCarregando(true);
      
      
      const [responseReceitas, responseDoacoes] = await Promise.all([
        api.get<ReceitaApi[]>("/receitas"),
        api.get<DoacaoApi[]>("/doacoes")
      ]);

      setReceitas(responseReceitas);
      setDoacoesRaw(responseDoacoes);
    } catch (error) {
      console.log("Erro ao carregar dados do Dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

 
  const indicadores = useMemo(() => {
    
    const totalDoacoesPendentes = doacoesRaw.flatMap((doacao) => 
      (doacao.medicamentoDoacoes ?? [])
        .filter((item) => item.triagemDoacao?.id)
        .map((item) => normalizarStatusDoacao(item))
    ).filter((status) => status === "pendente").length;

    return {
      pendentes: receitas.filter((item) => (item.status ?? "pendente") === "pendente").length,
      doacoesPendentes: totalDoacoesPendentes, 
      validadeCurta: receitas.filter((item) => item.status === "dispensada").length, 
    };
  }, [receitas, doacoesRaw]);

  const receitasParaTriagem = useMemo(() => {
    return receitas
      .filter((item) => (item.status ?? "pendente") === "pendente" || item.status === "aprovada")
      .slice(0, 3);
  }, [receitas]);

 
  async function obterEmpresaId() {
    const auth = await obterAuth();
    const empresaId = auth?.empresa?.id;
    if (!empresaId) {
      Alert.alert("Atenção", "Sessão inválida. Faça login novamente.");
      return null;
    }
    return empresaId;
  }

  
  async function handleAprovar(id: number) {
    try {
      setProcessandoId(id);
      const empresaId = await obterEmpresaId();
      if (!empresaId) return;

      await api.patch(`/receitas/${id}/aprovar`, {
        empresaId,
        observacao: "Receita aprovada pela triagem rápida do Dashboard.",
      });

      Alert.alert("Sucesso", "Receita aprovada com sucesso!");
      await carregarDadosDashboard();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível aprovar.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleRejeitar(id: number) {
    try {
      setProcessandoId(id);
      const empresaId = await obterEmpresaId();
      if (!empresaId) return;

      await api.patch(`/receitas/${id}/reprovar`, {
        empresaId,
        observacao: "Receita reprovada na triagem do Dashboard.",
      });

      Alert.alert("Sucesso", "Receita rejeitada.");
      await carregarDadosDashboard();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível rejeitar.");
    } finally {
      setProcessandoId(null);
    }
  }

  function formatarData(valor: string) {
    if (!valor) return "Não informado";
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
      
        <View style={styles.header}>
          <Image
            source={require('../../../assets/LogoFarm.fw.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.acaoHeader}>
            <TouchableOpacity style={styles.buttonIcone} onPress={carregarDadosDashboard}>
              <Ionicons name="refresh-outline" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonPerfil} onPress={() => router.push('/(tabs)/empresa/perfil')}>
              <Ionicons name="person-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tituloSessao}>
          <Text style={styles.tituloPrincipal}>Dashboard - Operacional</Text>
          <Text style={styles.subTitulo}>Instituição - Farmacêutico</Text>
        </View>

        
        {carregando ? (
          <ActivityIndicator size="small" color="#72CAA5" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.cardInfo}>
            <View style={styles.cardItem1}>
              <Image source={require('../../../assets/prancheta.png')} style={styles.cardImage} />
              <Text style={styles.cardText}>Receitas Aguardando</Text>
              <Text style={styles.cardNumber}>{indicadores.pendentes}</Text>
            </View>

            
            <TouchableOpacity 
              style={styles.cardItem2} 
              onPress={() => router.push('/(tabs)/empresa/Doacao')} 
            >
              <Image source={require('../../../assets/box.png')} style={styles.cardImage} />
              <Text style={styles.cardText}>Doações Pendentes</Text>
              <Text style={styles.cardNumber}>{indicadores.doacoesPendentes}</Text>
            </TouchableOpacity>

            <View style={styles.cardItem3}>
              <Image source={require('../../../assets/remedio.png')} style={styles.cardImage} />
              <Text style={styles.cardText}>Validade Curta</Text>
              <Text style={styles.cardNumber}>{indicadores.validadeCurta}</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          
          <View style={styles.cardAtividades}>
            <View style={styles.iconAtividades}>
              <Ionicons name="checkmark-circle" size={24} color="#72CAA5" />
            </View>
            <View style={styles.atividadeInfos}>
              <Text style={styles.atividadeTexto}>Última atualização do painel concluída</Text>
              <Text style={styles.atividadeHora}>Sincronizado agora mesmo</Text>
            </View>
          </View>
        </View>

       
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Triagem de Receitas Rápidas</Text>
          
          {carregando ? (
            <ActivityIndicator color="#72CAA5" size="large" />
          ) : receitasParaTriagem.length === 0 ? (
            <Text style={styles.vazioText}>Nenhuma receita pendente no momento.</Text>
          ) : (
            receitasParaTriagem.map((receita) => {
              const status = receita.status ?? "pendente";
              const isPendente = status === "pendente";

              return (
                <View key={receita.id} style={styles.triageCard}>
                  <View style={styles.triageHeader}>
                    <Text style={styles.triageTitulo}>Receita #{receita.id}</Text>
                    <View style={[
                      styles.triageEstado, 
                      { backgroundColor: isPendente ? '#E6AF0A' : '#72CAA5' }
                    ]}>
                      <Text style={styles.triageEstadoText}>
                        {isPendente ? 'Pendente' : 'Aprovada'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.triageInfo}>Paciente: {receita.usuario?.nome ?? "Não informado"}</Text>
                  <Text style={styles.triageInfo}>Data: {formatarData(receita.dataEmissao)}</Text>
                  
                  {isPendente && (
                    <View style={styles.triageAcao}>
                      <TouchableOpacity 
                        style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}
                        onPress={() => handleAprovar(receita.id)}
                        disabled={processandoId === receita.id}
                      >
                        <Text style={styles.triageButtonText}>Aprovar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}
                        onPress={() => handleRejeitar(receita.id)}
                        disabled={processandoId === receita.id}
                      >
                        <Text style={styles.triageButtonText}>Rejeitar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.triageButton, { backgroundColor: '#0a6de6' }]}
                        onPress={() => router.push('/(tabs)/empresa/receitas')} 
                      >
                        <Text style={styles.triageButtonText}>Ver tudo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 100,
        backgroundColor: '#72CAA5',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    logo: {
        width: 200,
        height: 80,
    },
    acaoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcone: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPerfil: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    tituloSessao: {
        marginLeft: 25,
        marginTop: 20,
        marginBottom: 20,
    },
    tituloPrincipal: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
    subTitulo: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
    cardInfo: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        gap: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    cardItem1: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(68, 179, 105)',
        padding: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardItem2: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(230, 175, 10)',
        padding: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardItem3: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(230, 10, 10)',
        padding: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardNumber: {
        fontSize: 25,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    cardAtividades: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconAtividades: {
        marginRight: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    atividadeInfos: {
        flex: 1,
    },
    atividadeTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    atividadeHora: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    triageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    triageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    triageTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    triageEstado: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    triageEstadoText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    triageInfo: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    triageAcao: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    triageButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    triageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    vazioText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 15,
        fontSize: 14,
    }
});