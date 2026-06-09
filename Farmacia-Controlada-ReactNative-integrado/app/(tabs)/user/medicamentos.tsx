import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    ListRenderItem,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { api } from '../../../services/api';

interface MedicamentoApi {
    id: number;
    nome: string;
    descricao: string;
    classeFarmacologica?: { classe?: string };
    tarjaMedicamento?: { cor?: string; descricao?: string };
    medicamentoFormaFarmacos?: Array<{
        id: number;
        formaFarmaco?: { forma?: string; embalagem?: string };
    }>;
}

interface Medicamento {
    id: string;
    nome: string;
    descricao: string;
    laboratorio: string;
    tipo: string;
    forma: string;
    formaFarmacoId?: number;
}

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

function mapMedicamento(item: MedicamentoApi): Medicamento {
    const primeiraForma = item.medicamentoFormaFarmacos?.[0];

    return {
        id: String(item.id),
        nome: item.nome,
        descricao: item.descricao,
        laboratorio:
            item.tarjaMedicamento?.descricao ?? 'Não informado',
        tipo:
            item.classeFarmacologica?.classe ?? 'Medicamento',
        forma:
            primeiraForma?.formaFarmaco?.forma ?? 'Não informado',
        formaFarmacoId: primeiraForma?.id,
    };
}

export default function MedicamentosUsuario() {
    const router = useRouter();
    const [busca, setBusca] = useState('');
    const [filtroSelecionado, setFiltroSelecionado] = useState('todos');
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [totalMedicamentos, setTotalMedicamentos] = useState(0);

    useEffect(() => {
        carregarMedicamentos();
    }, []);

    const carregarMedicamentos = async () => {
        try {
            setCarregando(true);

            const resposta = await api.get<MedicamentoApi[]>('/medicamentos');

            const lista = resposta.map(mapMedicamento);

            setMedicamentos(lista);
            setTotalMedicamentos(lista.length);
        } catch (error) {
            Alert.alert(
                'Erro',
                error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar medicamentos.'
            );
        } finally {
            setCarregando(false);
        }
    };

    const tiposUnicos = ['Todos', ...new Set(medicamentos.map(m => m.tipo))];

    const medicamentos_filtrados = medicamentos.filter(m => {
        const matchBusca =
            m.nome.toLowerCase().includes(busca.toLowerCase()) ||
            m.descricao.toLowerCase().includes(busca.toLowerCase()) ||
            m.tipo.toLowerCase().includes(busca.toLowerCase());

        const matchFiltro =
            filtroSelecionado === 'todos' ||
            m.tipo === filtroSelecionado;

        return matchBusca && matchFiltro;
    });

    const renderMedicamento: ListRenderItem<Medicamento> = ({ item }) => (
        <TouchableOpacity
            style={styles.cartaoMedicamento}
            onPress={() =>
                router.push(
                    `/(tabs)/user/detalhesMedicamento?id=${item.id}&formaFarmacoId=${item.formaFarmacoId ?? ''}`
                )
            }
        >
            <View style={styles.headerMedicamento}>
                <View style={styles.grupoNome}>
                    <Text style={styles.nomeMedicamento}>
                        {item.nome}
                    </Text>

                    <Text style={styles.laboratorioMedicamento}>
                        {item.laboratorio}
                    </Text>
                </View>
            </View>

            <Text
                numberOfLines={2}
                style={{
                    color: '#6B7280',
                    marginBottom: 10,
                    fontSize: 12,
                }}
            >
                {item.descricao}
            </Text>

            <View style={styles.linhaSecundaria}>
                <View style={styles.badgeTipo}>
                    <Text style={styles.textoTipo}>
                        {item.tipo}
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: '#EEF2FF',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 6,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: '#4F46E5',
                        }}
                    >
                        {item.forma}
                    </Text>
                </View>
            </View>

            <View style={styles.rodape}>
                <View style={styles.grupFarmacia}>
                    <MaterialCommunityIcons
                        name="pill"
                        size={14}
                        color={cores.primaria}
                    />

                    <Text style={styles.textoFarmacia}>
                        Medicamento cadastrado
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.containerPrincipal}>
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
                <Text style={styles.tituloPrincipal}>Medicamentos</Text>
                <Text style={styles.subTitulo}>
                    {totalMedicamentos} medicamentos encontrados
                </Text>
            </View>

            <View style={styles.containerBusca}>
                <View style={styles.campoBusca}>
                    <MaterialCommunityIcons name="magnify" size={20} color={cores.textoSecundario} />
                    <TextInput
                        style={styles.entradaBusca}
                        placeholder="Buscar medicamento..."
                        placeholderTextColor={cores.textoSecundario}
                        value={busca}
                        onChangeText={setBusca}
                    />
                    {busca.length > 0 && (
                        <TouchableOpacity onPress={() => setBusca('')}>
                            <MaterialCommunityIcons name="close" size={20} color={cores.textoSecundario} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.containerFiltros}
                contentContainerStyle={styles.contentFiltros}
            >
                {tiposUnicos.map((tipo, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.filtro,
                            ((filtroSelecionado === 'todos' && tipo === 'Todos') ||
                                filtroSelecionado === tipo) && styles.filtroSelecionado,
                        ]}
                        onPress={() => setFiltroSelecionado(tipo === 'Todos' ? 'todos' : tipo)}
                    >
                        <Text
                            style={[
                                styles.textoFiltro,
                                ((filtroSelecionado === 'todos' && tipo === 'Todos') ||
                                    filtroSelecionado === tipo) && styles.textoFiltroSelecionado,
                            ]}
                        >
                            {tipo}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {carregando ? (
                <ActivityIndicator color={cores.primaria} style={{ marginTop: 32 }} />
            ) : medicamentos_filtrados.length > 0 ? (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                    <FlatList
                        data={medicamentos_filtrados}
                        renderItem={renderMedicamento}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listaContent}
                        showsVerticalScrollIndicator={false}
                    />
                </ScrollView>
            ) : (
                <View style={styles.estadoVazio}>
                    <MaterialCommunityIcons name="magnify" size={48} color={cores.textoSecundario} />
                    <Text style={styles.textoVazio}>Nenhum medicamento encontrado</Text>
                    <Text style={styles.textoSecundarioVazio}>Tente uma busca diferente</Text>
                </View>
            )}
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
        marginBottom: 30,
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
    containerBusca: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: cores.fundoPagina,
        borderBottomColor: cores.borda,
    },
    campoBusca: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: cores.fundoLeve,
    },
    entradaBusca: {
        flex: 1,
        paddingVertical: 11,
        paddingHorizontal: 8,
        fontSize: 14,
        color: cores.textoPrincipal,
    },
    containerFiltros: {
        backgroundColor: cores.fundoPagina,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
        maxHeight: 60,

    },
    contentFiltros: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,


    },
    filtro: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: cores.fundoLeve,
        borderWidth: 1,
        borderColor: cores.borda,

    },
    filtroSelecionado: {
        backgroundColor: cores.primaria,
        borderColor: cores.primaria,

    },
    textoFiltro: {
        fontSize: 12,
        fontWeight: '600',
        color: cores.textoSecundario,
    },
    textoFiltroSelecionado: {
        color: cores.fundoPagina,
    },
    listaContent: {
        padding: 16,
        paddingBottom: 20,
        gap: 12,
        marginTop: 10,
    },
    cartaoMedicamento: {
        backgroundColor: cores.fundoPagina,
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    headerMedicamento: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    grupoNome: {
        flex: 1,
    },
    nomeMedicamento: {
        fontSize: 15,
        fontWeight: '700',
        color: cores.textoPrincipal,
        marginBottom: 2,
    },
    laboratorioMedicamento: {
        fontSize: 12,
        color: cores.textoSecundario,
        fontWeight: '500',
    },
    badgeDesconto: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
        marginLeft: 8,
    },
    textoDesconto: {
        fontSize: 10,
        fontWeight: '700',
        color: cores.vermelhaDestruir,
    },
    linhaSecundaria: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    badgeTipo: {
        backgroundColor: cores.fundoLeve,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    textoTipo: {
        fontSize: 11,
        fontWeight: '600',
        color: cores.secundaria,
    },
    badgeSemEstoque: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
    },
    textoSemEstoque: {
        fontSize: 10,
        fontWeight: '600',
        color: cores.vermelhaDestruir,
    },
    rodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: cores.borda,
    },
    grupFarmacia: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    textoFarmacia: {
        fontSize: 12,
        fontWeight: '600',
        color: cores.secundaria,
    },
    estadoVazio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    textoVazio: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.textoPrincipal,
        marginTop: 12,
    },
    textoSecundarioVazio: {
        fontSize: 13,
        color: cores.textoSecundario,
        marginTop: 4,
    },
});