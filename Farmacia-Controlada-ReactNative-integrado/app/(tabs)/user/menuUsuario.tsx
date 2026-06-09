import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Image,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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


interface card {
    id: string;
    titulo: string;
    descricao: string;
    numero: number;
    icone: keyof typeof MaterialCommunityIcons.glyphMap;
    cor: string;
    rota: Href<any>;
}


interface AcaoRapida {
    id: string;
    label: string;
    descricao: string;
    icone: keyof typeof MaterialCommunityIcons.glyphMap;
    rota: Href<any>;
}

interface Atividade {
    id: string;
    tipo: string;
    medicamento: string;
    farmacia: string;
    data: string;
    icone: keyof typeof MaterialCommunityIcons.glyphMap;
    cor: string;
}

export default function MenuUsuario() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<any>(null);
    const [quantidadeMedicamentos, setQuantidadeMedicamentos] = useState(0);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            const auth = await obterAuth();

            if (auth?.usuario) {
                setUsuario(auth.usuario);
            }

            const medicamentos = await api.get<any[]>('/medicamentos');

            setQuantidadeMedicamentos(medicamentos.length);
        } catch (error) {
            console.log('Erro ao carregar dados:', error);
        } finally {
            setCarregando(false);
        }
    }

    const cardPrincipais: card[] = [
        {
            id: '1',
            titulo: 'Medicamentos',
            descricao: 'Disponíveis',
            numero: quantidadeMedicamentos,
            icone: 'pill',
            cor: cores.primaria,
            rota: '/(tabs)/user/medicamentos',
        },
    ];
    const acoesRapidas: AcaoRapida[] = [
        {
            id: '1',
            label: 'Buscar',
            descricao: 'Medicamentos',
            icone: 'magnify',
            rota: '/(tabs)/user/medicamentos',
        },

        {
            id: '2',
            label: 'Perfil',
            descricao: 'Meus dados',
            icone: 'account-circle-outline',
            rota: '/(tabs)/user/perfil',
        },

        {
            id: '3',
            label: 'Doação',
            descricao: 'Realizar Doações',
            icone: 'heart',
            rota: '/(tabs)/user/doacao',
        }
    ];

    const atividadeRecente = [
        {
            id: '1',
            tipo: 'resgate',
            medicamento: 'Dipirona 500mg',
            farmacia: 'Farmácia Central SP',
            data: 'Hoje',
            icone: 'check-circle' as keyof typeof MaterialCommunityIcons.glyphMap,
            cor: cores.verdeSuccesso,
        },
        {
            id: '2',
            tipo: 'resgate',
            medicamento: 'Amoxicilina 500mg',
            farmacia: 'Farmácia Premium',
            data: 'Ontem',
            icone: 'check-circle' as keyof typeof MaterialCommunityIcons.glyphMap,
            cor: cores.verdeSuccesso,
        },
        {
            id: '3',
            tipo: 'compra',
            medicamento: 'Omeprazol 20mg',
            farmacia: 'Farmácia Express',
            data: '3 dias atrás',
            icone: 'shopping-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
            cor: cores.primaria,
        },
    ];

    const renderCartaoPrincipal = ({ item }: { item: card }) => (
        <TouchableOpacity
            style={styles.cartaoPrincipal}
            onPress={() => router.push(item.rota)}
        >
            <View style={[styles.iconePrincipal, { backgroundColor: item.cor + '20' }]}>
                <MaterialCommunityIcons name={item.icone} size={28} color={item.cor} />
            </View>
            <View style={styles.grupoTexto}>
                <Text style={styles.tituloCarta}>{item.titulo}</Text>
                <Text style={styles.descricaoCarta}>{item.descricao}</Text>
            </View>
            <View style={styles.grupoNumero}>
                <Text style={styles.numeroDestaque}>{item.numero}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={cores.textoSecundario} />
            </View>
        </TouchableOpacity>
    );

    const renderAcaoRapida = ({ item }: { item: AcaoRapida }) => (
        <TouchableOpacity
            style={styles.botaoAcaoRapida}
            onPress={() => router.push(item.rota)}
        >
            <View style={styles.iconeAcao}>
                <MaterialCommunityIcons name={item.icone} size={24} color={cores.primaria} />
            </View>
            <Text style={styles.labelAcao}>{item.label}</Text>
            <Text style={styles.descricaoAcao}>{item.descricao}</Text>
        </TouchableOpacity>
    );

    const renderAtividadeRecente = ({ item }: { item: Atividade }) => (
        <View style={styles.cartaoAtividade}>
            <View style={[
                styles.iconeAtividade,
                { backgroundColor: item.cor + '20' }
            ]}>
                <MaterialCommunityIcons name={item.icone} size={18} color={item.cor} />
            </View>
            <View style={styles.grupoAtividade}>
                <Text style={styles.medicamentoAtividade}>{item.medicamento}</Text>
                <Text style={styles.textoAtividadeSecundaria}>
                    <MaterialCommunityIcons name="hospital-box" size={12} color={cores.textoSecundario} /> {item.farmacia}
                </Text>
            </View>
            <Text style={styles.dataAtividade}>{item.data}</Text>
        </View>
    );

    if (carregando) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>Carregando...</Text>
        </View>
    );
}

    return (
        <ScrollView
            style={styles.containerPrincipal}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Image
                    source={require('../../../assets/LogoFarm.fw.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.acaoHeader}>
                    

                    <TouchableOpacity style={styles.buttonPerfil} onPress={() => router.push('/(tabs)/user/perfil')} accessibilityLabel="Perfil do usuário">
                        <Ionicons name="person-circle-outline" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tituloSessao}>
                <Text style={styles.tituloPrincipal}>
                    Olá, {usuario?.nome || 'Usuário'}
                </Text>
                <Text style={styles.subTitulo}>Seja Bem-Vindo ao menu inicial</Text>

                {usuario?.email && (
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#666',
                            marginTop: 5,
                        }}
                    >
                        {usuario.email}
                    </Text>
                )}

                {usuario?.cpf && (
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#888',
                            marginTop: 2,
                        }}
                    >
                        CPF: {usuario.cpf}
                    </Text>
                )}
            </View>

            <View style={styles.secaoCartoes}>
                <Text style={styles.tituloSecao}>Resumo</Text>
                <FlatList
                    data={cardPrincipais}
                    renderItem={renderCartaoPrincipal}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <View style={styles.secaoAcoes}>
                <Text style={styles.tituloSecao}>Ações Rápidas</Text>
                <FlatList
                    data={acoesRapidas}
                    renderItem={renderAcaoRapida}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.gridWrapper}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <View style={styles.secaoAtividade}>
                <View style={styles.headerAtividade}>
                    <Text style={styles.tituloSecao}>Atividade Recente</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/user/historico')}>
                        <Text style={styles.linkVerTudo}>Ver tudo</Text>
                    </TouchableOpacity>
                </View>

                {atividadeRecente.length > 0 ? (
                    <FlatList
                        data={atividadeRecente}
                        renderItem={renderAtividadeRecente}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.vazio}>
                        <MaterialCommunityIcons name="history" size={40} color={cores.textoSecundario} />
                        <Text style={styles.textoVazio}>Nenhuma atividade recente</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: {
        flex: 1,
        backgroundColor: cores.fundoLeve,
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
    secaoCartoes: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    tituloSecao: {
        fontSize: 16,
        fontWeight: '700',
        color: cores.textoPrincipal,
        marginBottom: 14,
    },
    cartaoPrincipal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cores.fundoPagina,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    iconePrincipal: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    grupoTexto: {
        flex: 1,
    },
    tituloCarta: {
        fontSize: 14,
        fontWeight: '700',
        color: cores.textoPrincipal,
    },
    descricaoCarta: {
        fontSize: 12,
        color: cores.textoSecundario,
        fontWeight: '500',
        marginTop: 2,
    },
    grupoNumero: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    numeroDestaque: {
        fontSize: 20,
        fontWeight: '700',
        color: cores.primaria,
        marginRight: 4,
    },
    secaoAcoes: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    gridWrapper: {
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 10,
    },
    botaoAcaoRapida: {
        flex: 1,
        backgroundColor: cores.fundoPagina,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    iconeAcao: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: cores.fundoLeve,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelAcao: {
        fontSize: 12,
        fontWeight: '700',
        color: cores.textoPrincipal,
        marginBottom: 2,
    },
    descricaoAcao: {
        fontSize: 11,
        color: cores.textoSecundario,
        fontWeight: '500',
    },
    secaoAtividade: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerAtividade: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    linkVerTudo: {
        fontSize: 12,
        fontWeight: '600',
        color: cores.primaria,
    },
    cartaoAtividade: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cores.fundoPagina,
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    iconeAtividade: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    grupoAtividade: {
        flex: 1,
    },
    medicamentoAtividade: {
        fontSize: 13,
        fontWeight: '600',
        color: cores.textoPrincipal,
    },
    textoAtividadeSecundaria: {
        fontSize: 11,
        color: cores.textoSecundario,
        fontWeight: '500',
        marginTop: 2,
    },
    dataAtividade: {
        fontSize: 11,
        color: cores.textoSecundario,
        fontWeight: '500',
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    textoVazio: {
        fontSize: 13,
        color: cores.textoSecundario,
        marginTop: 8,
    },
});