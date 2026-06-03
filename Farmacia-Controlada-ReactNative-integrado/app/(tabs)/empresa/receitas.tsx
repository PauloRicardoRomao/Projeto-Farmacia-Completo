
import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView, TextInput, Modal, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

interface Receita {
  id: string;
  nomePaciente: string;
  data: string;
  status: string;
  fotoReceita: string | null;
  crmMedico: string;
  nomeMedico: string;
  dataReceita: string;
  observacoes: string;
}

export default function HomeScreen() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(null);

  const receitas: Receita[] = [
    {
      id: '001',
      nomePaciente: 'Joao Silva',
      data: '25/05/2026',
      status: 'Pendente',
      fotoReceita: null,
      crmMedico: '123456/SP',
      nomeMedico: 'Dr. Carlos Santos',
      dataReceita: '25/05/2026',
      observacoes: 'Receita para tratamento de hipertensao'
    },
  ];

  const abrirModalDetalhes = (receita: Receita) => {
    setReceitaSelecionada(receita);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setReceitaSelecionada(null);
  };

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
            <TouchableOpacity style={styles.buttonIcone} accessibilityLabel="Notificações">
              <Ionicons name="notifications-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonPerfil} accessibilityLabel="Perfil do usuário">
              <Ionicons name="person-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titulo}>
          <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Prontuário - Receitas</Text>
          <Text style={{ fontSize: 18, fontWeight: '400', color: 'rgb(133, 133, 133)' }}>Receituários a serem análisados pela equipe</Text>
        </View>

        <View style={styles.cardInputReceitas}>
          <TextInput placeholder="Procure o nome do Paciente" style={{ padding: 10, width: 300, borderRadius: 8, color: 'rgb(71, 71, 73)', backgroundColor: 'rgb(235, 232, 232)' }} />
          <TouchableOpacity style={{ padding: 10, backgroundColor: '#369262', borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>


          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>



          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>



          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>



          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                  <Text style={styles.triageEstadoText}>Pendente</Text>
                </View>
                <View style={[styles.triageEstado, { backgroundColor: '#5dae42' }]}>
                  <TouchableOpacity onPress={() => abrirModalDetalhes(receitas[0])}>
                    <Text style={styles.triageEstadoText}>Mais Info</Text>
                  </TouchableOpacity>
                  
                </View>

              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
            </View>
          </View>



        </View>

      </ScrollView>

      {/* Modal de Detalhes da Receita */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={styles.fundoModal}>
          <View style={styles.containerModalReceita}>
            <View style={styles.headerModalReceita}>
              <Text style={styles.tituloModalReceita}>Detalhes da Receita</Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.conteudoModalReceita}>
              {/* Foto da Receita */}
              {receitaSelecionada?.fotoReceita ? (
                <Image
                  source={{ uri: receitaSelecionada.fotoReceita }}
                  style={styles.fotoReceitaModal}
                />
              ) : (
                <View style={styles.placeholderFotoModal}>
                  <MaterialCommunityIcons name="file-document-outline" size={64} color="#72CAA5" />
                  <Text style={styles.textoPlaceholder}>Nenhuma foto anexada</Text>
                </View>
              )}

              {/* Informacoes da Receita */}
              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>Numero da Receita</Text>
                <Text style={styles.valorInfoModal}>Receita #{receitaSelecionada?.id}</Text>
              </View>

              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>Nome do Paciente</Text>
                <Text style={styles.valorInfoModal}>{receitaSelecionada?.nomePaciente}</Text>
              </View>

              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>CRM do Medico</Text>
                <Text style={styles.valorInfoModal}>{receitaSelecionada?.crmMedico}</Text>
              </View>

              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>Nome do Medico</Text>
                <Text style={styles.valorInfoModal}>{receitaSelecionada?.nomeMedico}</Text>
              </View>

              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>Data da Receita</Text>
                <Text style={styles.valorInfoModal}>{receitaSelecionada?.dataReceita}</Text>
              </View>

              <View style={styles.secaoInfoModal}>
                <Text style={styles.labelInfoModal}>Observacoes</Text>
                <Text style={styles.valorInfoModal}>{receitaSelecionada?.observacoes}</Text>
              </View>

              <View style={styles.espacoRodapeModal} />
            </ScrollView>

            {/* Botoes de Acao */}
            <View style={styles.rodapeModalReceita}>
              <TouchableOpacity style={styles.botaoRejeitar} onPress={fecharModal}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                <Text style={styles.textoBotaoRejeitar}>Rejeitar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoAprovar} onPress={() => {
                Alert.alert('Sucesso', 'Receita aprovada com sucesso!');
                fecharModal();
              }}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.textoBotaoAprovar}>Aprovar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  titulo: {
    marginLeft: 20,
    marginTop: 20
  },

  cardInputReceitas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 40
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
    paddingVertical: 4,
    borderRadius: 20
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
    fontSize: 14,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },





  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerModalReceita: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    maxHeight: '90%',
    width: '100%',
  },
  headerModalReceita: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conteudoModalReceita: {
    maxHeight: '70%',
    padding: 20,
  },
  fotoReceitaModal: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderFotoModal: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secaoInfoModal: {
    marginVertical: 12,
  },
  labelInfoModal: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valorInfoModal: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  espacoRodapeModal: {
    height: 16,
  },
  rodapeModalReceita: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  botaoRejeitar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E60A0A',
    alignItems: 'center',
  },
  botaoAprovar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#72CAA5',
    alignItems: 'center',
  },
  tituloModalReceita: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  textoPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  textoBotaoRejeitar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  textoBotaoAprovar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

});
