

import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView, Modal, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

interface Doacao {
  id: string;
  nomeMedicamento: string;
  descricao: string;
  quantidade: string;
  dataValidade: string;
  data: string;
  fotoDoacacao: string | null;
  status: string;
}

export default function HomeScreen() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [doacaoSelecionada, setDoacaoSelecionada] = useState<Doacao | null>(null);

  const doacoes: Doacao[] = [
    {
      id: '001',
      nomeMedicamento: 'Dipirona',
      descricao: 'Medicamento para febre e dor',
      quantidade: '50',
      dataValidade: '12/2027',
      data: '27/05/2026',
      fotoDoacacao: null,
      status: 'Pendente'
    },
    {
      id: '002',
      nomeMedicamento: 'Dipirona',
      descricao: 'Medicamento para febre e dor',
      quantidade: '30',
      dataValidade: '06/2027',
      data: '27/05/2026',
      fotoDoacacao: null,
      status: 'Aprovado'
    },
    {
      id: '003',
      nomeMedicamento: 'Dipirona',
      descricao: 'Medicamento para febre e dor',
      quantidade: '40',
      dataValidade: '08/2027',
      data: '27/05/2026',
      fotoDoacacao: null,
      status: 'Aprovado'
    },
    {
      id: '004',
      nomeMedicamento: 'Dipirona',
      descricao: 'Medicamento para febre e dor',
      quantidade: '25',
      dataValidade: '10/2027',
      data: '27/05/2026',
      fotoDoacacao: null,
      status: 'Aprovado'
    },
    {
      id: '005',
      nomeMedicamento: 'Dipirona',
      descricao: 'Medicamento para febre e dor',
      quantidade: '35',
      dataValidade: '09/2027',
      data: '27/05/2026',
      fotoDoacacao: null,
      status: 'Aprovado'
    },
  ];

  const abrirModalDetalhes = (doacao: Doacao) => {
    setDoacaoSelecionada(doacao);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setDoacaoSelecionada(null);
  };


    return (
        <View style={styles.container}>
            <ScrollView>
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
                <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Central de Doações</Text>
                <Text style={{ fontSize: 18, fontWeight: '400', color: 'rgb(133, 133, 133)' }}>Status de doações</Text>
            </View>

            <View style={styles.layoutDoacao}>
                <View style={[styles.layoutItemDoacao, styles.statusRejeitado]}>
                    <Image
                     source={require('../../../assets/box.png')}
                     style={{width:50, height:50}}
                    />
                    <Text style={styles.itemTitle}>Doações Rejeitadas</Text>
                    <Text style={styles.itemCount}>0</Text>
                </View>

                <View style={[styles.layoutItemDoacao, styles.statusAnalise]}>
                    <Image
                     source={require('../../../assets/box.png')}
                     style={{width:50, height:50}}
                    />
                    <Text style={styles.itemTitle}>Em Análise</Text>
                    <Text style={styles.itemCount}>0</Text>
                </View>

                <View style={[styles.layoutItemDoacao, styles.statusLiberado]}>
                    <Image
                     source={require('../../../assets/box.png')}
                     style={{width:50, height:50}}
                    />
                    <Text style={styles.itemTitle}>Doações Liberadas</Text>
                    <Text style={styles.itemCount}>0</Text>
                </View>
            </View>

            <View style={styles.titulo}>
                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Lista de Doações</Text>
                    <Text style={{ fontSize: 18, fontWeight: '400', color: 'rgb(133, 133, 133)' }}>Doações disponíveis para feedback</Text>
                </View>

            <View style={styles.listaDoaLayout}>
                

                <View style={styles.donationCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.donationTitle}>Doação #001</Text>
                            <Text style={styles.cardInfo}>Data: 27/05/2026</Text>
                            <Text style={styles.cardInfo}>Medicamento: Dipirona</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, styles.statusPendente]}>
                                <Text style={styles.badgeText}>Pendente</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.buttonApprove}>
                            <Ionicons name="checkmark-outline" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Aprovar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonReject}>
                            <Ionicons name="close-outline" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Rejeitar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.buttonInfo}
                            onPress={() => abrirModalDetalhes(doacoes[0])}>
                            <Ionicons name="information-circle-outline" size={18} color="#fff" />
                            <Text style={styles.buttonText}>Detalhes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.donationCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.donationTitle}>Doação #002</Text>
                            <Text style={styles.cardInfo}>Data: 27/05/2026</Text>
                            <Text style={styles.cardInfo}>Medicamento: Dipirona</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, styles.statusAprovado]}>
                                <Text style={styles.badgeText}>Aprovado</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.donationCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.donationTitle}>Doação #003</Text>
                            <Text style={styles.cardInfo}>Data: 27/05/2026</Text>
                            <Text style={styles.cardInfo}>Medicamento: Dipirona</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, styles.statusAprovado]}>
                                <Text style={styles.badgeText}>Aprovado</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.donationCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.donationTitle}>Doação #004</Text>
                            <Text style={styles.cardInfo}>Data: 27/05/2026</Text>
                            <Text style={styles.cardInfo}>Medicamento: Dipirona</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, styles.statusAprovado]}>
                                <Text style={styles.badgeText}>Aprovado</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.donationCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.donationTitle}>Doação #005</Text>
                            <Text style={styles.cardInfo}>Data: 27/05/2026</Text>
                            <Text style={styles.cardInfo}>Medicamento: Dipirona</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, styles.statusAprovado]}>
                                <Text style={styles.badgeText}>Aprovado</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </View>
            </ScrollView>

            {/* Modal de Detalhes da Doação */}
            <Modal
              visible={modalVisivel}
              transparent={true}
              animationType="fade"
              onRequestClose={fecharModal}
            >
              <View style={styles.fundoModal}>
                <View style={styles.containerModalDoacao}>
                  <View style={styles.headerModalDoacao}>
                    <Text style={styles.tituloModalDoacao}>Detalhes da Doação</Text>
                    <TouchableOpacity onPress={fecharModal}>
                      <MaterialCommunityIcons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.conteudoModalDoacao}>
                    {doacaoSelecionada?.fotoDoacacao ? (
                      <Image
                        style={styles.fotoDoacao}
                        source={{ uri: doacaoSelecionada.fotoDoacacao }}
                      />
                    ) : (
                      <View style={styles.placeholderFotoModal}>
                        <MaterialCommunityIcons name="image-off" size={48} color="#ccc" />
                        <Text style={styles.textoPlaceholder}>Nenhuma foto anexada</Text>
                      </View>
                    )}

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Doação</Text>
                      <Text style={styles.valorInfoModal}>Doação #{doacaoSelecionada?.id}</Text>
                    </View>

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Medicamento</Text>
                      <Text style={styles.valorInfoModal}>{doacaoSelecionada?.nomeMedicamento}</Text>
                    </View>

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Descricao</Text>
                      <Text style={styles.valorInfoModal}>{doacaoSelecionada?.descricao}</Text>
                    </View>

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Quantidade</Text>
                      <Text style={styles.valorInfoModal}>{doacaoSelecionada?.quantidade} unidades</Text>
                    </View>

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Data de Validade</Text>
                      <Text style={styles.valorInfoModal}>{doacaoSelecionada?.dataValidade}</Text>
                    </View>

                    <View style={styles.secaoInfoModal}>
                      <Text style={styles.labelInfoModal}>Data da Doacao</Text>
                      <Text style={styles.valorInfoModal}>{doacaoSelecionada?.data}</Text>
                    </View>

                    <View style={styles.espacoRodapeModal} />
                  </ScrollView>

                  <View style={styles.rodapeModalDoacao}>
                    <TouchableOpacity 
                      style={styles.botaoRejeitar}
                      onPress={() => {
                        Alert.alert('Doacao Rejeitada', 'A doacao foi rejeitada com sucesso.');
                        fecharModal();
                      }}
                    >
                      <Text style={styles.textoBotaoRejeitar}>Rejeitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.botaoAprovar}
                      onPress={() => {
                        Alert.alert('Doacao Aprovada', 'A doacao foi aprovada com sucesso.');
                        fecharModal();
                      }}
                    >
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

    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },

    cardHeaderText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },

    statusPendente: {
        backgroundColor: 'rgb(250, 204, 21)',
    },

    statusAprovado: {
        backgroundColor: 'rgb(16, 185, 129)',
    },

    badgeText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },

    layoutDoacao: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginTop: 16,
        marginBottom: 20,
        paddingHorizontal: 16,
    },

    layoutItemDoacao: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        minHeight: 140,
    },

    statusRejeitado: {
        backgroundColor: '#ff0000',
        borderWidth: 1,
        shadowRadius: 8,
        borderColor: '#fca5a5',
    },

    statusAnalise: {
        backgroundColor: '#ffcc00',
        borderWidth: 1,
        shadowRadius: 8,
        borderColor: '#fde68a',
    },

    statusLiberado: {
        backgroundColor: '#04ff7d',
        borderWidth: 1,
        shadowRadius: 8,
        borderColor: '#a7f3d0',
    },

    itemTitle: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },

    itemCount: {
        marginTop: 8,
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },

    donationCard: {
        width: '90%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    donationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },

    cardInfo: {
        fontSize: 12,
        color: '#6b7280',
    },

    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },

    buttonApprove: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 11,
        borderRadius: 10,
        gap: 6,
    },

    buttonReject: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d92f2f',
        paddingVertical: 11,
        borderRadius: 10,
        gap: 6,
    },

    buttonInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0ea5e9',
        paddingVertical: 11,
        borderRadius: 10,
        gap: 6,
    },

    buttonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },

    listaDoaLayout: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 24,
        marginBottom: 20,
    },

    fundoModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    containerModalDoacao: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 0,
      maxHeight: '90%',
      width: '100%',
    },
    headerModalDoacao: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    tituloModalDoacao: {
      fontSize: 20,
      fontWeight: '700',
      color: '#333',
    },
    conteudoModalDoacao: {
      maxHeight: '70%',
      padding: 20,
    },
    fotoDoacao: {
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
    textoPlaceholder: {
      fontSize: 14,
      color: '#999',
      marginTop: 8,
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
    rodapeModalDoacao: {
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
