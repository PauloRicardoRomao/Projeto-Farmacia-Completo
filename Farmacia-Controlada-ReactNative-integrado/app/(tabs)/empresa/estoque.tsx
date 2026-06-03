
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api, obterAuth } from "../../../services/api";

type Remedio = {
    id: string;
    name: string;
    quantity: number;
    image: any;
    medicamentoFormaFarmacoId?: number;
};

export default function HomeScreen() {
    const [remedios, setRemedios] = useState<Remedio[]>([]);

    useEffect(() => {
        carregarEstoque();
    }, []);

    const carregarEstoque = async () => {
        try {
            const auth = await obterAuth();
            const empresaId = auth?.empresa?.id;
            const rota = empresaId ? `/estoque-medicamentos/empresa/${empresaId}` : '/estoque-medicamentos';
            const estoques = await api.get<any[]>(rota);

            setRemedios(
                estoques.map((item) => ({
                    id: String(item.id),
                    name: item.medicamentoFormaFarmaco?.medicamento?.nome ?? 'Medicamento',
                    quantity: Number(item.quantidadeAtual ?? 0),
                    image: require('../../../assets/Dipirona.fw.png'),
                    medicamentoFormaFarmacoId: item.medicamentoFormaFarmacoId,
                })),
            );
        } catch (error) {
            console.log(error);
        }
    };
    const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
    const [modalRetiradaVisivel, setModalRetiradaVisivel] = useState(false);
    const [remedioSelecionado, setRemedioSelecionado] = useState<Remedio | null>(null);
    const [motivoRetirada, setMotivoRetirada] = useState('');
    const [dataRetirada, setDataRetirada] = useState(new Date().toLocaleDateString('pt-BR'));

    const abrirDetalhes = (item: Remedio) => {
        setRemedioSelecionado(item);
        setModalDetalhesVisivel(true);
    };

    const fecharDetalhes = () => {
        setModalDetalhesVisivel(false);
        setRemedioSelecionado(null);
    };

    const abrirRetirada = () => {
        setModalRetiradaVisivel(true);
    };

    const confirmarRetirada = async () => {
        if (!remedioSelecionado) return;

        const auth = await obterAuth();
        const empresaId = auth?.empresa?.id;

        if (empresaId && remedioSelecionado.medicamentoFormaFarmacoId) {
            await api.post('/estoque-medicamentos/movimentar', {
                empresaId,
                medicamentoFormaFarmacoId: remedioSelecionado.medicamentoFormaFarmacoId,
                tipo: 'saida',
                quantidade: 1,
                observacao: motivoRetirada || 'Retirada manual pelo aplicativo.',
            });
        }

        setRemedios((listaAtual) =>
            listaAtual.map((item) =>
                item.id === remedioSelecionado.id
                    ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                    : item
            )
        );

        setModalRetiradaVisivel(false);
        setModalDetalhesVisivel(false);
        setRemedioSelecionado(null);
        setMotivoRetirada('');
        setDataRetirada(new Date().toLocaleDateString('pt-BR'));
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={remedios}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 0 }}
                contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 24 }}
                ListHeaderComponent={() => (
                    <>
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
                            <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Controle De Estoque</Text>
                            <Text style={{ fontSize: 18, fontWeight: '400', color: 'rgb(133, 133, 133)' }}>Remédios disponíveis para doação</Text>
                        </View>
                    </>
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.imagemDentroCard}>
                            <Image source={item.image} style={styles.imagemCard} />
                            <View style={styles.etiquetaCard}>
                                <Text style={styles.textoEtiqueta}>Tarja Vermelha</Text>
                            </View>
                        </View>

                        <View style={styles.conteudoCard}>
                            <Text style={styles.tituloCard}>{item.name}</Text>
                            <Text style={styles.subtituloCard}>Controle de estoque e doações</Text>

                            <View style={styles.linhaInfo}>
                                <View>
                                    <Text style={styles.rotuloInfo}>Quantidade</Text>
                                    <Text style={styles.valorInfo}>{item.quantity}</Text>
                                </View>
                                <View>
                                    <Text style={styles.rotuloInfo}>Status</Text>
                                    <Text style={styles.valorInfo}>Em estoque</Text>
                                </View>
                            </View>

                            <View style={styles.containerTags}>
                                <Text style={styles.etiqueta}>Dor de cabeça</Text>
                                <Text style={styles.etiqueta}>Dor no corpo</Text>
                                <Text style={styles.etiqueta}>Vômitos</Text>
                            </View>

                            <TouchableOpacity style={styles.botaoInfo} onPress={() => abrirDetalhes(item)}>
                                <Text style={styles.textoBotaoInfo}>Ver detalhes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Modal visible={modalDetalhesVisivel} transparent animationType="slide">
                <View style={styles.modalFundo}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitulo}>{remedioSelecionado?.name}</Text>
                        <Text style={styles.modalSubtitulo}>Detalhes completos do produto</Text>

                        <View style={styles.gradeInfoModal}>
                            <View style={styles.itemInfoModal}>
                                <Text style={styles.rotuloInfo}>Quantidade</Text>
                                <Text style={styles.valorInfo}>{remedioSelecionado?.quantity ?? '-'}</Text>
                            </View>
                            <View style={styles.itemInfoModal}>
                                <Text style={styles.rotuloInfo}>Status</Text>
                                <Text style={styles.valorInfo}>{(remedioSelecionado?.quantity ?? 0) > 0 ? 'Disponível' : 'Esgotado'}</Text>
                            </View>
                            <View style={styles.itemInfoModal}>
                                <Text style={styles.rotuloInfo}>Lote</Text>
                                <Text style={styles.valorInfo}>A1B2C3</Text>
                            </View>
                            <View style={styles.itemInfoModal}>
                                <Text style={styles.rotuloInfo}>Validade</Text>
                                <Text style={styles.valorInfo}>12/2026</Text>
                            </View>
                        </View>

                        <Text style={styles.rotuloModal}>Fabricante</Text>
                        <Text style={styles.textoModal}>Farmacorp Brasil</Text>

                        <Text style={styles.rotuloModal}>Indicações principais</Text>
                        <Text style={styles.textoModal}>Indicado para dor de cabeça, dor no corpo e vômitos. Uso oral e controle de doação.</Text>

                        <Text style={styles.rotuloModal}>Observações</Text>
                        <Text style={styles.textoModal}>Estoque armazenado em temperatura controlada. Priorizar saída para doações emergenciais.</Text>

                        <View style={styles.areaBotoesModal}>
                            <TouchableOpacity style={[styles.botaoSecundario, styles.botaoPrincipal]} onPress={abrirRetirada}>
                                <Text style={styles.textoBotaoSecundario}>Retirar do estoque</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoSecundario, styles.botaoNeutro]} onPress={fecharDetalhes}>
                                <Text style={styles.textoBotaoNeutro}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalRetiradaVisivel} transparent animationType="fade">
                <KeyboardAvoidingView
                    style={styles.modalFundo}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitulo}>Retirar produto</Text>
                        <Text style={styles.modalSubtitulo}>Informe os dados da retirada</Text>

                        <Text style={styles.rotuloModal}>Motivo da retirada: </Text>
                        <TextInput
                            value={motivoRetirada}
                            onChangeText={setMotivoRetirada}
                            style={styles.campoInput}
                            placeholder="Ex: Doação ou descarte"
                            placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.rotuloModal}>Quantidade: </Text>
                        <TextInput
                            value={motivoRetirada}
                            onChangeText={setMotivoRetirada}
                            style={styles.campoInput}
                            placeholder="Quantidade a ser retirada"
                            placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.rotuloModal}>Data da retirada</Text>
                        <TextInput
                            value={dataRetirada}
                            onChangeText={setDataRetirada}
                            style={styles.campoInput}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#9ca3af"
                        />

                        <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmarRetirada}>
                            <Text style={styles.textoBotaoConfirmar}>Confirmar retirada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.botaoFecharModal} onPress={() => setModalRetiradaVisivel(false)}>
                            <Text style={styles.textoBotaoFecharModal}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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

    card: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 14,
        marginTop: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },

    imagemDentroCard: {
        position: 'relative',
        marginBottom: 14,
    },

    imagemCard: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
        borderRadius: 18,
        backgroundColor: '#f7fafc',
    },

    etiquetaCard: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    textoEtiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#dc2626',
    },

    conteudoCard: {
        paddingTop: 2,
    },

    tituloCard: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },

    subtituloCard: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12,
    },

    linhaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    rotuloInfo: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },

    valorInfo: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },

    containerTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },

    etiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        backgroundColor: '#4e9073',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        marginRight: 6,
        marginBottom: 6,
    },

    botaoInfo: {
        backgroundColor: '#72CAA5',
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
    },

    textoBotaoInfo: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },

    modalFundo: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.55)',
        justifyContent: 'center',
        padding: 20,
    },

    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },

    modalTitulo: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },

    modalSubtitulo: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 18,
    },

    gradeInfoModal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    itemInfoModal: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },

    linhaInfoModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    rotuloModal: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 6,
    },

    textoModal: {
        color: '#374151',
        fontSize: 14,
        marginBottom: 18,
        lineHeight: 22,
    },

    areaBotoesModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },

    botaoSecundario: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#72CAA5',
    },

    botaoPrincipal: {
        backgroundColor: '#72CAA5',
        marginRight: 12,
    },

    botaoNeutro: {
        backgroundColor: '#eef2ff',
    },

    textoBotaoSecundario: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },

    textoBotaoNeutro: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
    },

    botaoConfirmar: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 14,
    },

    textoBotaoConfirmar: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },

    botaoFecharModal: {
        marginTop: 10,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 14,
    },

    textoBotaoFecharModal: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '700',
    },

    campoInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        color: '#111827',
    },

});
