import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Image
} from 'react-native';
import { MaterialCommunityIcons,Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

interface TipoInfo {
    icone: keyof typeof MaterialCommunityIcons.glyphMap;
    cor: string;
}

const tipoCores: Record<'resgate' | 'doacao' | 'devolucao' | 'cancelamento', TipoInfo> = {
    resgate: { icone: 'pill', cor: cores.verdeSuccesso },
    doacao: { icone: 'shopping-outline', cor: cores.primaria },
    devolucao: { icone: 'undo-variant', cor: cores.amarelaAlerta },
    cancelamento: { icone: 'close-circle', cor: cores.vermelhaDestruir },
};

interface ItemHistorico {
    id: string;
    medicamento: string;
    tipo: 'resgate' | 'doacao' | 'devolucao' | 'cancelamento';
    quantidade: string;
    farmacia: string;
    data: string;
    hora: string;
    status: string;
    referencia: string;
}

export default function HistoricoUsuario() {
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');


    const [historicoExpandido, setHistoricoExpandido] = useState<Record<string, boolean>>({});


    const historico: ItemHistorico[] = [
        {
            id: '1',
            medicamento: 'Dipirona 500mg',
            tipo: 'resgate',
            quantidade: '30 comprimidos',
            farmacia: 'Farmácia Central SP',
            data: '15/05/2025',
            hora: '14:30',
            status: 'Concluído',
            referencia: 'RES-2025-001',
        },
        {
            id: '2',
            medicamento: 'Amoxicilina 500mg',
            tipo: 'doacao',
            quantidade: '21 cápsulas',
            farmacia: 'Farmácia Premium',
            data: '10/05/2025',
            hora: '10:15',
            status: 'Concluído',
            referencia: 'COM-2025-001',
        },
        {
            id: '3',
            medicamento: 'Losartana 50mg',
            tipo: 'resgate',
            quantidade: '60 comprimidos',
            farmacia: 'Farmácia Express',
            data: '08/05/2025',
            hora: '09:45',
            status: 'Concluído',
            referencia: 'RES-2025-002',
        },
        {
            id: '4',
            medicamento: 'Omeprazol 20mg',
            tipo: 'devolucao',
            quantidade: '10 cápsulas',
            farmacia: 'Farmácia Central SP',
            data: '05/05/2025',
            hora: '16:20',
            status: 'Concluído',
            referencia: 'DEV-2025-001',
        },
        {
            id: '5',
            medicamento: 'Metformina 500mg',
            tipo: 'cancelamento',
            quantidade: '-',
            farmacia: 'Farmácia Premium',
            data: '02/05/2025',
            hora: '11:00',
            status: 'Cancelado',
            referencia: 'CAN-2025-001',
        },
        {
            id: '6',
            medicamento: 'Atorvastatina 20mg',
            tipo: 'doacao',
            quantidade: '30 comprimidos',
            farmacia: 'Farmácia 24h',
            data: '28/04/2025',
            hora: '20:00',
            status: 'Concluído',
            referencia: 'COM-2025-002',
        },
        {
            id: '7',
            medicamento: 'Ibuprofeno 600mg',
            tipo: 'resgate',
            quantidade: '20 comprimidos',
            farmacia: 'Farmácia Central SP',
            data: '25/04/2025',
            hora: '13:15',
            status: 'Concluído',
            referencia: 'RES-2025-003',
        },
    ];

    const historicoFiltrado = historico.filter(h => {
        if (filtroTipo === 'todos') return true;
        return h.tipo === filtroTipo;
    });

    const toggleDetalhes = (id: string) => {
        setHistoricoExpandido(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const getTituloTipo = (tipo: string) => {
        switch (tipo) {
            case 'resgate':
                return 'Resgate com Receita';
            case 'doacao':
                return 'Doação';
            case 'devolucao':
                return 'Devolução';
            case 'cancelamento':
                return 'Cancelamento';
            default:
                return 'Outro';
        }
    };


    const renderItem = ({ item }: { item: ItemHistorico }) => {
        const tipoInfo = tipoCores[item.tipo];

        return (
            <TouchableOpacity
                style={styles.cartaoHistorico}
                onPress={() => toggleDetalhes(item.id)}
            >

                <View style={styles.headerHistorico}>
                    <View
                        style={[
                            styles.circuloTipo,
                            { backgroundColor: tipoInfo.cor + '20' },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={tipoInfo.icone}
                            size={20}
                            color={tipoInfo.cor}
                        />
                    </View>

                    <View style={styles.grupoInfo}>
                        <Text style={styles.medicamentoHistorico}>{item.medicamento}</Text>
                        <Text style={styles.tipoHistorico}>{getTituloTipo(item.tipo)}</Text>
                    </View>

                    <View style={styles.grupoPreco}>
                        <Text style={[
                            styles.precoHistorico,
                            item.tipo === 'cancelamento' && { color: cores.textoSecundario, textDecorationLine: 'line-through' }
                        ]}>
                        </Text>
                    </View>
                </View>


                {historicoExpandido[item.id] && (
                    <View style={styles.detalhesExpandidos}>

                        <View style={styles.linhaDetalhes}>
                            <MaterialCommunityIcons name="calendar-outline" size={14} color={cores.textoSecundario} />
                            <Text style={styles.labelDetalhes}>Data</Text>
                            <Text style={styles.valorDetalhes}>{item.data} às {item.hora}</Text>
                        </View>


                        <View style={styles.linhaDetalhes}>
                            <MaterialCommunityIcons name="hospital-box" size={14} color={cores.textoSecundario} />
                            <Text style={styles.labelDetalhes}>Farmácia</Text>
                            <Text style={styles.valorDetalhes}>{item.farmacia}</Text>
                        </View>


                        {item.quantidade !== '-' && (
                            <View style={styles.linhaDetalhes}>
                                <MaterialCommunityIcons name="pill" size={14} color={cores.textoSecundario} />
                                <Text style={styles.labelDetalhes}>Quantidade</Text>
                                <Text style={styles.valorDetalhes}>{item.quantidade}</Text>
                            </View>
                        )}


                        <View style={styles.linhaDetalhes}>
                            <MaterialCommunityIcons name="barcode" size={14} color={cores.textoSecundario} />
                            <Text style={styles.labelDetalhes}>Referência</Text>
                            <Text style={styles.valorDetalhes}>{item.referencia}</Text>
                        </View>


                        <View style={styles.linhaDetalhes}>
                            <MaterialCommunityIcons
                                name={item.status === 'Concluído' ? 'check-circle' : 'close-circle'}
                                size={14}
                                color={item.status === 'Concluído' ? cores.verdeSuccesso : cores.vermelhaDestruir}
                            />
                            <Text style={styles.labelDetalhes}>Status</Text>
                            <Text style={[
                                styles.valorDetalhes,
                                {
                                    color: item.status === 'Concluído' ? cores.verdeSuccesso : cores.vermelhaDestruir,
                                    fontWeight: '600',
                                }
                            ]}>
                                {item.status}
                            </Text>
                        </View>


                        <View style={styles.linhaAcoes}>
                            <TouchableOpacity style={styles.botaoDetalhes}>
                                <MaterialCommunityIcons name="information-outline" size={14} color={cores.primaria} />
                                <Text style={styles.textoDetalhes}>Detalhes</Text>
                            </TouchableOpacity>

                            {item.tipo === 'doacao' && (
                                <TouchableOpacity style={styles.botaoNota}>
                                    <MaterialCommunityIcons name="file-document-outline" size={14} color={cores.primaria} />
                                    <Text style={styles.textoNota}>Nota</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.botaoCompartilhar}>
                                <MaterialCommunityIcons name="share-outline" size={14} color={cores.fundoPagina} />
                                <Text style={styles.textoCompartilhar}>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

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

            <View style={styles.tituloSessao}>
                <Text style={styles.tituloPrincipal}>Historico</Text>
                <Text style={styles.subTitulo}>Veja aqui seus históricos de medicamentos</Text>
            </View>

            <View style={{ maxHeight: 60 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.containerFiltros}
                    contentContainerStyle={styles.contentFiltros}
                >
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'resgate', label: 'Resgates' },
                        { id: 'doacao', label: 'Doação' },
                        { id: 'devolucao', label: 'Devoluções' },
                    ].map(filtro => (
                        <TouchableOpacity
                            key={filtro.id}
                            style={[
                                styles.filtro,
                                filtroTipo === filtro.id && styles.filtroSelecionado,
                            ]}
                            onPress={() => setFiltroTipo(filtro.id)}
                        >
                            <Text
                                style={[
                                    styles.textoFiltro,
                                    filtroTipo === filtro.id && styles.textoFiltroSelecionado,
                                ]}
                            >
                                {filtro.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>


            {historicoFiltrado.length > 0 ? (
                <FlatList
                    data={historicoFiltrado}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listaContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.estadoVazio}>
                    <MaterialCommunityIcons name="history" size={48} color={cores.textoSecundario} />
                    <Text style={styles.textoVazio}>Nenhum registro encontrado</Text>
                </View>
            )}


            <View style={styles.secaoEstatisticas}>
                <View style={styles.cartaoEstatistica}>
                    <View style={styles.grupoEstat}>
                        <Text style={styles.numeroEstat}>{historico.length}</Text>
                        <Text style={styles.labelEstat}>Total de Transações</Text>
                    </View>
                    <View style={styles.grupoEstat}>
                        <Text style={styles.numeroEstat}>
                            {historico.filter(h => h.status === 'Concluído').length}
                        </Text>
                        <Text style={styles.labelEstat}>Concluídas</Text>
                    </View>
                    <View style={styles.grupoEstat}>
                        <Text style={styles.numeroEstat}>
                            {historico.filter(h => h.tipo === 'resgate').length}
                        </Text>
                        <Text style={styles.labelEstat}>Resgates</Text>
                    </View>
                </View>
            </View>
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
    containerFiltros: {
        backgroundColor: cores.fundoPagina,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
    },
    contentFiltros: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 8,
    },
    filtro: {
        paddingVertical: 7,
        paddingHorizontal: 14,
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
        paddingBottom: 140,
        gap: 10,
    },
    cartaoHistorico: {
        backgroundColor: cores.fundoPagina,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 10,
    },
    headerHistorico: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
    },
    circuloTipo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grupoInfo: {
        flex: 1,
    },
    medicamentoHistorico: {
        fontSize: 14,
        fontWeight: '700',
        color: cores.textoPrincipal,
    },
    tipoHistorico: {
        fontSize: 12,
        color: cores.textoSecundario,
        fontWeight: '500',
    },
    grupoPreco: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 4,
    },
    precoHistorico: {
        fontSize: 13,
        fontWeight: '700',
        color: cores.secundaria,
    },
    detalhesExpandidos: {
        borderTopWidth: 1,
        borderTopColor: cores.borda,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: cores.fundoLeve,
        gap: 10,
    },
    linhaDetalhes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelDetalhes: {
        fontSize: 11,
        color: cores.textoSecundario,
        fontWeight: '600',
        width: 80,
        textTransform: 'uppercase',
    },
    valorDetalhes: {
        flex: 1,
        fontSize: 12,
        color: cores.textoPrincipal,
        fontWeight: '500',
    },
    linhaAcoes: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    botaoDetalhes: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: cores.primaria,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    textoDetalhes: {
        fontSize: 11,
        fontWeight: '600',
        color: cores.primaria,
    },
    botaoNota: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: cores.primaria,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    textoNota: {
        fontSize: 11,
        fontWeight: '600',
        color: cores.primaria,
    },
    botaoCompartilhar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.primaria,
        paddingVertical: 7,
        borderRadius: 8,
        gap: 4,
    },
    textoCompartilhar: {
        fontSize: 11,
        fontWeight: '600',
        color: cores.fundoPagina,
    },
    estadoVazio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoVazio: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.textoPrincipal,
        marginTop: 12,
    },
    secaoEstatisticas: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: cores.fundoPagina,
        borderTopWidth: 1,
        borderTopColor: cores.borda,
    },
    cartaoEstatistica: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: cores.fundoLeve,
        borderRadius: 12,
        paddingVertical: 16,
    },
    grupoEstat: {
        alignItems: 'center',
    },
    numeroEstat: {
        fontSize: 20,
        fontWeight: '700',
        color: cores.primaria,
        marginBottom: 4,
    },
    labelEstat: {
        fontSize: 11,
        color: cores.textoSecundario,
        fontWeight: '600',
    },
});