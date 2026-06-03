import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { api, obterAuth } from '../../../services/api';

const cores = {
    primaria: '#72CAA5',
    secundaria: '#369262',
    vermelhaDestruir: '#D92F2F',
    amarelaAlerta: '#F59E0B',
    verdeSuccesso: '#10B981',
    fundoPagina: '#FFFFFF',
    textoPrincipal: '#1F2937',
    textoSecundario: '#6B7280',
    borda: '#E5E7EB',
    fundoLeve: '#F9FAFB',
};

interface DadosMedicamento {
    nome: string;
    descricao: string;
    quantidade: string;
    dataValidade: string;
    foto: string | null;
}

export default function TelaDoacao() {
    const [modalVisivel, setModalVisivel] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [dadosMedicamento, setDadosMedicamento] = useState<DadosMedicamento>({
        nome: '',
        descricao: '',
        quantidade: '',
        dataValidade: '',
        foto: null,
    });
    const [doacao, setDoacao] = useState<string | null>(null)
    const [permissao, setPermissao] = useCameraPermissions()
    const [cameraAtiva, setCameraAtiva] = useState<boolean>(false)
    const [ladoCamera, setLadoCamera] = useState<'back' | 'front'>('back');
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

    const tirarFoto = async () => {
        if(cameraRef.current) {
            try{
                const foto = await cameraRef.current.takePictureAsync()
                if(foto && foto.uri){
                    setCameraAtiva(false)
                    setDoacao(foto.uri)
                }
            } catch (error) {
            alert(error)
        }
    }}

    const limparFormulario = () => {
        setDadosMedicamento({
            nome: '',
            descricao: '',
            quantidade: '',
            dataValidade: '',
            foto: null,
        });
    };

    const fecharModal = () => {
        limparFormulario();
        setModalVisivel(false);
    };


    const confirmarDoacao = async () => {
        if (!dadosMedicamento.nome.trim()) {
            Alert.alert('Atenção', 'Por favor, insira o nome do medicamento');
            return;
        }

        if (!dadosMedicamento.quantidade.trim()) {
            Alert.alert('Atenção', 'Por favor, insira a quantidade');
            return;
        }

        setCarregando(true);
        try {
            const auth = await obterAuth();
            const cpf = auth?.usuario?.cpf;

            if (!cpf) {
                Alert.alert('Atenção', 'Faça login novamente para registrar uma doação.');
                return;
            }

            const medicamentos = await api.get<any[]>(`/medicamentos?nome=${encodeURIComponent(dadosMedicamento.nome)}`);
            const medicamentoFormaFarmacoId = medicamentos?.[0]?.medicamentoFormaFarmacos?.[0]?.id;

            if (!medicamentoFormaFarmacoId) {
                Alert.alert('Atenção', 'Medicamento não encontrado no catálogo. Cadastre-o antes de registrar a doação.');
                return;
            }

            await api.post('/doacoes', {
                cpf,
                itens: [
                    {
                        medicamentoFormaFarmacoId,
                        quantidade: Number(dadosMedicamento.quantidade),
                        validade: dadosMedicamento.dataValidade,
                    },
                ],
            });

            Alert.alert('Sucesso', 'Doação registrada com sucesso!');
            fecharModal();
        } catch (erro) {
            Alert.alert('Erro', erro instanceof Error ? erro.message : 'Não foi possível realizar a doação');
        } finally {
            setCarregando(false);
        }
    };

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
        <View style={styles.containerPrincipal}>
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

                    <TouchableOpacity style={styles.buttonPerfil} onPress={() => router.push('/(tabs)/user/perfil')} accessibilityLabel="Perfil do usuário">
                        <Ionicons name="person-circle-outline" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.tituloSessao}>
                    <Text style={styles.tituloPrincipal}>Doações</Text>
                    <Text style={styles.subTitulo}>Contribua doando medicamentos para quem precisa</Text>
                </View>

                <View style={styles.secaoConteudo}>
                    <View style={styles.cardInfo}>
                        <MaterialCommunityIcons name="heart-multiple" size={48} color={cores.primaria} />
                        <Text style={styles.textoCardInfo}>Sua doação faz diferença</Text>
                        <Text style={styles.descricaoCard}>Ajude a levar medicamentos para pessoas que necessitam</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.botaoRealizarDoacao}
                        onPress={() => setModalVisivel(true)}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                        <Text style={styles.textoBotaoDoacao}>Realizar Doação</Text>
                    </TouchableOpacity>

                    <View style={styles.secaoBeneficios}>
                        <Text style={styles.tituloBeneficios}>Como funciona</Text>
                        <View style={styles.itemBeneficio}>
                            <View style={styles.numeroBeneficio}>
                                <Text style={styles.numeroTexto}>1</Text>
                            </View>
                            <View style={styles.conteudoBeneficio}>
                                <Text style={styles.tituloBeneficioItem}>Cadastre o medicamento</Text>
                                <Text style={styles.descricaoBeneficio}>Informe os detalhes do medicamento a ser doado</Text>
                            </View>
                        </View>

                        <View style={styles.itemBeneficio}>
                            <View style={styles.numeroBeneficio}>
                                <Text style={styles.numeroTexto}>2</Text>
                            </View>
                            <View style={styles.conteudoBeneficio}>
                                <Text style={styles.tituloBeneficioItem}>Revisão do cadastro</Text>
                                <Text style={styles.descricaoBeneficio}>Nosso sistema revisa a informação do medicamento</Text>
                            </View>
                        </View>

                        <View style={styles.itemBeneficio}>
                            <View style={styles.numeroBeneficio}>
                                <Text style={styles.numeroTexto}>3</Text>
                            </View>
                            <View style={styles.conteudoBeneficio}>
                                <Text style={styles.tituloBeneficioItem}>Disponível para doação</Text>
                                <Text style={styles.descricaoBeneficio}>Medicamento fica disponível para recepção de solicitações</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            
            <Modal
                visible={modalVisivel}
                transparent={true}
                animationType="slide"
                onRequestClose={fecharModal}
            >
                <View style={styles.fundoModal}>
                    <View style={styles.containerModal}>
                        <View style={styles.headerModal}>
                            <Text style={styles.tituloModal}>Adicionar Doação</Text>
                            <TouchableOpacity onPress={fecharModal}>
                                <Ionicons name="close" size={28} color={cores.textoPrincipal} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.conteudoModal}>
                            
                            <View style={styles.secaoFoto}>
                                <TouchableOpacity
                                    style={styles.areaFoto}
                                    onPress={handleAbrirCamera}
                                >
                                {doacao ?(
                                    <View style={styles.placeholderFoto}>
                                            <Image
                                            source={doacao ? {uri: doacao}: require('../../../assets/LogoFarm.fw.png')}
                                            resizeMode="cover"
                                            style={styles.imagemDoacao}
                                            />
                                        </View>
                                ) : (
                                    <View style={styles.placeholderFoto}>
                                            <MaterialCommunityIcons name="camera-plus" size={48} color={cores.primaria} />
                                            <Text style={styles.textoFoto}>Adicionar Foto</Text>
                                        </View>
                                )
                                
                                }
                                        
                                    
                                </TouchableOpacity>
                            </View>

                            
                            <View style={styles.grupoInput}>
                                <Text style={styles.labelInput}>Nome do Medicamento *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Dipirona 500mg"
                                    placeholderTextColor={cores.textoSecundario}
                                    value={dadosMedicamento.nome}
                                    onChangeText={(texto) => setDadosMedicamento({ ...dadosMedicamento, nome: texto })}
                                />
                            </View>

                            
                            <View style={styles.grupoInput}>
                                <Text style={styles.labelInput}>Descrição / Observações</Text>
                                <TextInput
                                    style={[styles.input, styles.inputMultilinha]}
                                    placeholder="Ex: Medicamento em perfeito estado, embalagem íntegra"
                                    placeholderTextColor={cores.textoSecundario}
                                    value={dadosMedicamento.descricao}
                                    onChangeText={(texto) => setDadosMedicamento({ ...dadosMedicamento, descricao: texto })}
                                    multiline={true}
                                    numberOfLines={3}
                                />
                            </View>

                           
                            <View style={styles.grupoInput}>
                                <Text style={styles.labelInput}>Quantidade *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 10 unidades"
                                    placeholderTextColor={cores.textoSecundario}
                                    value={dadosMedicamento.quantidade}
                                    onChangeText={(texto) => setDadosMedicamento({ ...dadosMedicamento, quantidade: texto })}
                                />
                            </View>

                         
                            <View style={styles.grupoInput}>
                                <Text style={styles.labelInput}>Data de Validade</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 12/2025"
                                    placeholderTextColor={cores.textoSecundario}
                                    value={dadosMedicamento.dataValidade}
                                    onChangeText={(texto) => setDadosMedicamento({ ...dadosMedicamento, dataValidade: texto })}
                                />
                            </View>

                            <View style={styles.espacoRodape} />
                        </ScrollView>

                        
                        <View style={styles.rodapeModal}>
                            <TouchableOpacity
                                style={styles.botaoVoltar}
                                onPress={fecharModal}
                                disabled={carregando}
                            >
                                <Text style={styles.textoBotaoVoltar}>Voltar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.botaoDoar, carregando && styles.botaoDesabilitado]}
                                onPress={confirmarDoacao}
                                disabled={carregando}
                            >
                                {carregando ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="heart" size={20} color="#fff" />
                                        <Text style={styles.textoBotaoDoar}>Confirmar Doação</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    containerPrincipal: {
        flex: 1,
        backgroundColor: cores.fundoLeve,
    },
    header: {
        height: 100,
        backgroundColor: cores.primaria,
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
        marginTop: 24,
        marginBottom: 24,
    },
    tituloPrincipal: {
        fontSize: 28,
        fontWeight: '700',
        color: cores.textoPrincipal,
    },
    subTitulo: {
        fontSize: 16,
        color: cores.textoSecundario,
        marginTop: 6,
    },
    secaoConteudo: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    cardInfo: {
        backgroundColor: cores.fundoPagina,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    textoCardInfo: {
        fontSize: 18,
        fontWeight: '600',
        color: cores.textoPrincipal,
        marginTop: 12,
    },
    descricaoCard: {
        fontSize: 14,
        color: cores.textoSecundario,
        marginTop: 8,
        textAlign: 'center',
    },
    botaoRealizarDoacao: {
        backgroundColor: cores.primaria,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: cores.primaria,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    textoBotaoDoacao: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    secaoBeneficios: {
        backgroundColor: cores.fundoPagina,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tituloBeneficios: {
        fontSize: 18,
        fontWeight: '700',
        color: cores.textoPrincipal,
        marginBottom: 16,
    },
    itemBeneficio: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    numeroBeneficio: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: cores.primaria,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    numeroTexto: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    conteudoBeneficio: {
        flex: 1,
    },
    tituloBeneficioItem: {
        fontSize: 15,
        fontWeight: '600',
        color: cores.textoPrincipal,
    },
    descricaoBeneficio: {
        fontSize: 13,
        color: cores.textoSecundario,
        marginTop: 4,
    },
    

    fundoModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    containerModal: {
        backgroundColor: cores.fundoPagina,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 0,
    },
    headerModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
    },
    tituloModal: {
        fontSize: 22,
        fontWeight: '700',
        color: cores.textoPrincipal,
    },
    conteudoModal: {
        paddingHorizontal: 20,
    },
    secaoFoto: {
        marginVertical: 24,
        alignItems: 'center',
    },
    areaFoto: {
        width: '100%',
        height: 240,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: cores.fundoLeve,
        borderWidth: 2,
        borderColor: cores.borda,
        borderStyle: 'dashed',
    },
    fotoMedicamento: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderFoto: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoFoto: {
        fontSize: 14,
        color: cores.primaria,
        marginTop: 8,
        fontWeight: '500',
    },
    grupoInput: {
        marginBottom: 18,
    },
    labelInput: {
        fontSize: 15,
        fontWeight: '600',
        color: cores.textoPrincipal,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: cores.textoPrincipal,
        backgroundColor: cores.fundoLeve,
    },
    inputMultilinha: {
        minHeight: 100,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    espacoRodape: {
        height: 20,
    },
    rodapeModal: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: cores.borda,
        gap: 12,
    },
    botaoVoltar: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: cores.borda,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoBotaoVoltar: {
        fontSize: 15,
        fontWeight: '600',
        color: cores.textoPrincipal,
    },
    botaoDoar: {
        flex: 1,
        backgroundColor: cores.primaria,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    botaoDesabilitado: {
        opacity: 0.6,
    },
    textoBotaoDoar: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
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
  imagemDoacao: {
    width: 250,
    height: 250,
    borderRadius: 45
  }
});