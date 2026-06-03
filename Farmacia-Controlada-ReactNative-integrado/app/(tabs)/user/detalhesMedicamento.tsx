import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  ListRenderItem,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { api, criarFormDataImagem, obterAuth } from '../../../services/api';

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

interface Farmacias {
      id: string,
      nome:string,
      endereco: string,
      distancia:string,
      emEstoque: boolean,
      telefone: string,
      horario: string,

}

interface InfoAdicionais {
      id: string,
      titulo: string,
      conteudo: string,
}


export default function DetalhesMedicamento() {
  const router = useRouter();
  const { id, formaFarmacoId } = useLocalSearchParams<{ id?: string; formaFarmacoId?: string }>();
  const [medicamentoApi, setMedicamentoApi] = useState<any | null>(null);
  const [medicamentoAdicionado, setMedicamentoAdicionado] = useState(false);
  const [modalAgendamentoVisivel, setModalAgendamentoVisivel] = useState(false);
  const [carregandoAgendamento, setCarregandoAgendamento] = useState(false);
  const [receita, setReceita] = useState<string | null>(null)
  const [permissao, setPermissao] = useCameraPermissions()
  const [cameraAtiva, setCameraAtiva] = useState<boolean>(false)
  const [ladoCamera, setLadoCamera] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`/medicamentos/${id}`)
      .then(setMedicamentoApi)
      .catch(() => undefined);
  }, [id]);


  const [dadosReceita, setDadosReceita] = useState({
    fotoReceita: null,
    crmMedico: '',
    nomeMedico: '',
    nomePaciente: '',
    dataReceita: '',
    observacoes: '',
  });

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
   
   
    const abrirMapa = (endereco:string, nome:string) => {
      const caminho = `${endereco},${nome}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(caminho)}`;

    Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.');
      }
    })
    .catch((err) => Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o mapa.'));
    }
  

    const fazerLigacao = (telefone:string) => {
      const numeroLimpo = telefone.replace(/[^0-9+]/g, '');
      const num = `tel: ${numeroLimpo}`

      Linking.canOpenURL(num)
    .then((supported) => {
      if (supported) {
        Linking.openURL(num);
      } else {
        Alert.alert('Erro', 'Este dispositivo não suporta chamadas telefônicas.');
      }
    })
    .catch((err) => Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir discador.'));
    }

    const tirarFoto = async () => {
        if(cameraRef.current) {
            try{
                const foto = await cameraRef.current.takePictureAsync()
                if(foto && foto.uri){
                    setCameraAtiva(false)
                    setReceita(foto.uri)
                }
            } catch (error) {
            alert(error)
        }
    }}


  const primeiraForma = medicamentoApi?.medicamentoFormaFarmacos?.[0];
  const medicamento = {
    id: String(medicamentoApi?.id ?? id ?? '1'),
    nome: medicamentoApi?.nome ?? 'Medicamento',
    laboratorio: medicamentoApi?.tarjaMedicamento?.descricao ?? 'Catálogo global',
    tipo: medicamentoApi?.classeFarmacologica?.classe ?? 'Medicamento',
    descricao: medicamentoApi?.descricao ?? 'Informações carregadas do catálogo de medicamentos.',
    dosagem: primeiraForma?.formaFarmaco?.embalagem ?? 'Consultar embalagem',
    forma: primeiraForma?.formaFarmaco?.forma ?? 'Forma farmacêutica',
    emEstoque: true,
    desconto: true,
  };

  const farmaciasProximas: Farmacias[] = [
    {
      id: '1',
      nome: 'Farmacia Central SP',
      endereco: 'Rua das Flores, 123 - SP',
      distancia: '2.3 km',
      emEstoque: true,
      telefone: '(11) 3333-3333',
      horario: 'Seg-Dom: 08h-22h',
    },
    {
      id: '2',
      nome: 'Farmacia Premium',
      endereco: 'Av. Paulista, 456 - SP',
      distancia: '5.1 km',
      emEstoque: true,
      telefone: '(11) 3333-4444',
      horario: 'Seg-Dom: 09h-21h',
    },
    {
      id: '3',
      nome: 'Farmacia Express',
      endereco: 'Rua da Paz, 789 - SP',
      distancia: '7.8 km',
      emEstoque: false,
      telefone: '(11) 3333-5555',
      horario: 'Seg-Dom: 10h-20h',
    },
  ];

  const informacoesAdicionais: InfoAdicionais[] = [
    {
      id: '1',
      titulo: 'Modo de Usar',
      conteudo: 'Tomar 1 a 2 comprimidos a cada 6-8 horas, não excedendo 4 comprimidos por dia.',
    },
    {
      id: '2',
      titulo: 'Efeitos Colaterais',
      conteudo:
        'Podem ocorrer náuseas, vômitos e reações alérgicas em casos raros. Consulte o médico se persistirem.',
    },
    {
      id: '3',
      titulo: 'Contraindicacoes',
      conteudo:
        'Não recomendado para menores de 3 meses, gestantes sem prescrição médica e pacientes com alergia à dipirona.',
    },
    {
      id: '4',
      titulo: 'Armazenamento',
      conteudo: 'Guardar em local fresco e seco, longe da luz solar. Manter fora do alcance de crianças.',
    },
  ];

  const handleAgendar = () => {
    setModalAgendamentoVisivel(true);
  };

  const fecharModalAgendamento = () => {
    limparFormularioReceita();
    setModalAgendamentoVisivel(false);
  };

  const limparFormularioReceita = () => {
    setDadosReceita({
      fotoReceita: null,
      crmMedico: '',
      nomeMedico: '',
      nomePaciente: '',
      dataReceita: '',
      observacoes: '',
    });
  };

  const confirmarAgendamento = async () => {
    if (!receita) {
      Alert.alert('Atencao', 'Por favor, anexe a foto da receita');
      return;
    }

    if (!dadosReceita.crmMedico.trim()) {
      Alert.alert('Atencao', 'Por favor, insira o CRM do medico');
      return;
    }

    if (!dadosReceita.nomeMedico.trim()) {
      Alert.alert('Atencao', 'Por favor, insira o nome do medico');
      return;
    }

    if (!dadosReceita.nomePaciente.trim()) {
      Alert.alert('Atencao', 'Por favor, insira o nome do paciente');
      return;
    }

    setCarregandoAgendamento(true);
    try {
      const auth = await obterAuth();
      const usuarioId = auth?.usuario?.id;
      const medicamentoFormaFarmacoId = Number(formaFarmacoId || primeiraForma?.id);

      if (!usuarioId) {
        Alert.alert('Atenção', 'Faça login novamente para enviar a receita.');
        return;
      }

      if (!medicamentoFormaFarmacoId) {
        Alert.alert('Atenção', 'Este medicamento não possui forma farmacêutica cadastrada.');
        return;
      }

      const resposta = await api.post<{ receita: { id: number } }>('/receitas', {
        usuarioId,
        crmMedico: dadosReceita.crmMedico,
        dataEmissao: new Date().toISOString(),
        dataVencimento: null,
        observacao: dadosReceita.observacoes || `Paciente: ${dadosReceita.nomePaciente}. Médico: ${dadosReceita.nomeMedico}.`,
        medicamentos: [
          {
            medicamentoFormaFarmacoId,
            quantidade: 1,
            posologia: dadosReceita.observacoes || null,
            continuo: false,
          },
        ],
      });

      if (receita && resposta.receita?.id) {
        await api.post(`/imagens/receitas/${resposta.receita.id}`, criarFormDataImagem(receita));
      }

      Alert.alert('Sucesso', 'Receita enviada com sucesso!');
      fecharModalAgendamento();
    } catch (erro) {
      Alert.alert('Erro', erro instanceof Error ? erro.message : 'Nao foi possivel enviar a receita');
    } finally {
      setCarregandoAgendamento(false);
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

  const renderFarmacia: ListRenderItem<Farmacias> = ({ item }) => (
    <View style={styles.cartaoFarmacia}>
      <View style={styles.headerFarmacia}>
        <View style={styles.grupoFarmacia}>
          <Text style={styles.nomeFarmacia}>{item.nome}</Text>
          <Text style={styles.enderecoFarmacia}>
            <MaterialCommunityIcons name="map-marker" size={12} color={cores.primaria} /> {item.endereco}
          </Text>
        </View>
        <View style={styles.badgeDistancia}>
          <MaterialCommunityIcons name="near-me" size={12} color={cores.fundoPagina} />
          <Text style={styles.textoDistancia}>{item.distancia}</Text>
        </View>
      </View>

      <View style={styles.linhaInfoFarmacia}>
        <View style={styles.infoFarmacia}>
          <Text style={styles.labelInfoFarmacia}>Telefone</Text>
          <Text style={styles.valorInfoFarmacia}>{item.telefone}</Text>
        </View>
        <View style={styles.infoFarmacia}>
          <Text style={styles.labelInfoFarmacia}>Horario</Text>
          <Text style={styles.valorInfoFarmacia}>{item.horario}</Text>
        </View>
      </View>

      {!item.emEstoque && (
        <View style={styles.avisoSemEstoque}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={cores.vermelhaDestruir} />
          <Text style={styles.textoAvisoSemEstoque}>Atualmente sem estoque</Text>
        </View>
      )}

      <View style={styles.linhaAcoesFarmacia}>
        <TouchableOpacity style={styles.botaoMapa} onPress={() => abrirMapa(item.endereco,item.nome)}>
          <MaterialCommunityIcons name="map" size={16} color={cores.primaria} />
          <Text style={styles.textoAcaoMapa}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoLigar} onPress={() => fazerLigacao(item.telefone)} disabled={!item.emEstoque}>
          <MaterialCommunityIcons name="phone" size={16} color={cores.fundoPagina} />
          <Text style={styles.textoAcaoLigar}>Ligar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInformacao: ListRenderItem<InfoAdicionais> = ({ item }) => (
    <View style={styles.cartaoInformacao}>
      <Text style={styles.tituloInformacao}>{item.titulo}</Text>
      <Text style={styles.conteudoInformacao}>{item.conteudo}</Text>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.containerPrincipal} showsVerticalScrollIndicator={false}>

        <View style={styles.headerPagina}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={cores.fundoPagina} />
          </TouchableOpacity>
          <Text style={styles.tituloPagina}>Detalhes</Text>
          <TouchableOpacity style={styles.botaoFavorito}>
            <MaterialCommunityIcons
              name={medicamentoAdicionado ? 'heart' : 'heart-outline'}
              size={24}
              color={cores.fundoPagina}
            />
          </TouchableOpacity>
        </View>


        <View style={styles.secaoInfo}>
          <Text style={styles.nomeMedicamento}>{medicamento.nome}</Text>
          <Text style={styles.laboratorioInfo}>{medicamento.laboratorio}</Text>


          <View style={styles.linhaCaracteristicas}>
            <View style={styles.caracteristica}>
              <MaterialCommunityIcons name="pill" size={16} color={cores.primaria} />
              <Text style={styles.textoCaracteristica}>{medicamento.dosagem}</Text>
            </View>
            <View style={styles.caracteristica}>
              <MaterialCommunityIcons name='tsunami' size={16} color={cores.primaria} />
              <Text style={styles.textoCaracteristica}>{medicamento.forma}</Text>
            </View>
            <View style={styles.caracteristica}>
              <MaterialCommunityIcons
                name={medicamento.emEstoque ? 'check-circle' : 'close-circle'}
                size={16}
                color={medicamento.emEstoque ? cores.verdeSuccesso : cores.vermelhaDestruir}
              />
              <Text style={styles.textoCaracteristica}>
                {medicamento.emEstoque ? 'Em estoque' : 'Sem estoque'}
              </Text>
            </View>
          </View>

          <Text style={styles.descricao}>{medicamento.descricao}</Text>
        </View>


        <View style={styles.secaoBotoes}>
          <TouchableOpacity style={styles.botaoPrincipal} onPress={handleAgendar}>
            <MaterialCommunityIcons name="calendar-check" size={18} color={cores.fundoPagina} />
            <Text style={styles.textoBotaoPrincipal}>Agendar Resgate</Text>
          </TouchableOpacity>


        </View>


        <View style={styles.secao}>
          <View style={styles.headerSecao}>
            <MaterialCommunityIcons name="hospital-box" size={20} color={cores.primaria} />
            <Text style={styles.tituloSecao}>Farmacias Proximas</Text>
          </View>

          <FlatList
            data={farmaciasProximas}
            renderItem={renderFarmacia}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>


        <View style={styles.secao}>
          <View style={styles.headerSecao}>
            <MaterialCommunityIcons name="information-outline" size={20} color={cores.primaria} />
            <Text style={styles.tituloSecao}>Informacoes</Text>
          </View>

          <FlatList
            data={informacoesAdicionais}
            renderItem={renderInformacao}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.espacoFinal} />
      </ScrollView>

      <Modal
        visible={modalAgendamentoVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModalAgendamento}
      >
        <View style={styles.fundoModal}>
          <View style={styles.containerModalAgendamento}>
            <View style={styles.headerModalAgendamento}>
              <Text style={styles.tituloModalAgendamento}>Agendar Resgate</Text>
              <TouchableOpacity onPress={fecharModalAgendamento}>
                <Ionicons name="close" size={28} color={cores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.conteudoModalAgendamento}>

              <View style={styles.secaoFotoReceita}>
                <Text style={styles.labelSecaoFoto}>Foto da Receita *</Text>
                <TouchableOpacity
                  style={styles.areaFotoReceita}
                  onPress={handleAbrirCamera}
                >
                  {receita ? (
                    <Image
                      source={receita ? {uri: receita} : require('../../../assets/LogoFarm.fw.png')}
                      style={styles.fotoReceita}
                    />
                  ) : (
                    <View style={styles.placeholderFotoReceita}>
                      <MaterialCommunityIcons name="file-document-outline" size={48} color={cores.primaria} />
                      <Text style={styles.textoFotoReceita}>Anexar Receita</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>


              <View style={styles.grupoInputAgendamento}>
                <Text style={styles.labelInputAgendamento}>CRM do Medico *</Text>
                <TextInput
                  style={styles.inputAgendamento}
                  placeholder="Ex: 123456/SP"
                  placeholderTextColor={cores.textoSecundario}
                  value={dadosReceita.crmMedico}
                  onChangeText={(texto) => setDadosReceita({ ...dadosReceita, crmMedico: texto })}
                />
              </View>


              <View style={styles.grupoInputAgendamento}>
                <Text style={styles.labelInputAgendamento}>Nome do Medico *</Text>
                <TextInput
                  style={styles.inputAgendamento}
                  placeholder="Ex: Dr. João Silva"
                  placeholderTextColor={cores.textoSecundario}
                  value={dadosReceita.nomeMedico}
                  onChangeText={(texto) => setDadosReceita({ ...dadosReceita, nomeMedico: texto })}
                />
              </View>


              <View style={styles.grupoInputAgendamento}>
                <Text style={styles.labelInputAgendamento}>Nome do Paciente *</Text>
                <TextInput
                  style={styles.inputAgendamento}
                  placeholder="Ex: Maria Silva"
                  placeholderTextColor={cores.textoSecundario}
                  value={dadosReceita.nomePaciente}
                  onChangeText={(texto) => setDadosReceita({ ...dadosReceita, nomePaciente: texto })}
                />
              </View>


              <View style={styles.grupoInputAgendamento}>
                <Text style={styles.labelInputAgendamento}>Data da Receita</Text>
                <TextInput
                  style={styles.inputAgendamento}
                  placeholder="Ex: 01/06/2024"
                  placeholderTextColor={cores.textoSecundario}
                  value={dadosReceita.dataReceita}
                  onChangeText={(texto) => setDadosReceita({ ...dadosReceita, dataReceita: texto })}
                />
              </View>


              <View style={styles.grupoInputAgendamento}>
                <Text style={styles.labelInputAgendamento}>Observacoes</Text>
                <TextInput
                  style={[styles.inputAgendamento, styles.inputMultilinhaAgendamento]}
                  placeholder="Ex: Informações adicionais sobre o medicamento ou receita"
                  placeholderTextColor={cores.textoSecundario}
                  value={dadosReceita.observacoes}
                  onChangeText={(texto) => setDadosReceita({ ...dadosReceita, observacoes: texto })}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.espacoRodapeAgendamento} />
            </ScrollView>


            <View style={styles.rodapeModalAgendamento}>
              <TouchableOpacity
                style={styles.botaoCancelarAgendamento}
                onPress={fecharModalAgendamento}
                disabled={carregandoAgendamento}
              >
                <Text style={styles.textoBotaoCancelarAgendamento}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoConfirmarAgendamento, carregandoAgendamento && styles.botaoDesabilitado]}
                onPress={confirmarAgendamento}
                disabled={carregandoAgendamento}
              >
                {carregandoAgendamento ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
                    <Text style={styles.textoBotaoConfirmarAgendamento}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    backgroundColor: cores.fundoLeve,
  },
  headerPagina: {
    backgroundColor: cores.primaria,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    padding: 8,
  },
  tituloPagina: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.fundoPagina,
  },
  botaoFavorito: {
    padding: 8,
  },
  secaoInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: cores.fundoPagina,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  nomeMedicamento: {
    fontSize: 22,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: 4,
  },
  laboratorioInfo: {
    fontSize: 13,
    color: cores.textoSecundario,
    fontWeight: '500',
    marginBottom: 12,
  },
  badgeDescontoGrande: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  textoDescontoGrande: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.vermelhaDestruir,
  },
  linhaCaracteristicas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  caracteristica: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: cores.fundoLeve,
    borderRadius: 8,
  },
  textoCaracteristica: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  descricao: {
    fontSize: 14,
    color: cores.textoSecundario,
    lineHeight: 20,
    fontWeight: '500',
  },
  secaoBotoes: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: cores.fundoPagina,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  botaoPrincipal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.secundaria,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  textoBotaoPrincipal: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.fundoPagina,
  },
  botaoSecundario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: cores.primaria,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  textoBotaoSecundario: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.primaria,
  },
  secao: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 8,
    backgroundColor: cores.fundoPagina,
  },
  headerSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginLeft: 10,
  },
  cartaoFarmacia: {
    backgroundColor: cores.fundoLeve,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  headerFarmacia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  grupoFarmacia: {
    flex: 1,
  },
  nomeFarmacia: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: 4,
  },
  enderecoFarmacia: {
    fontSize: 12,
    color: cores.textoSecundario,
    fontWeight: '500',
  },
  badgeDistancia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
    marginLeft: 8,
  },
  textoDistancia: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.fundoPagina,
  },
  linhaInfoFarmacia: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  infoFarmacia: {
    flex: 1,
  },
  labelInfoFarmacia: {
    fontSize: 10,
    color: cores.textoSecundario,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  valorInfoFarmacia: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  avisoSemEstoque: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    marginBottom: 10,
  },
  textoAvisoSemEstoque: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.vermelhaDestruir,
  },
  linhaAcoesFarmacia: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoMapa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: cores.primaria,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  textoAcaoMapa: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.primaria,
  },
  botaoLigar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.verdeSuccesso,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  textoAcaoLigar: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.fundoPagina,
  },
  cartaoInformacao: {
    backgroundColor: cores.fundoLeve,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: cores.primaria,
  },
  tituloInformacao: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: 6,
  },
  conteudoInformacao: {
    fontSize: 12,
    color: cores.textoSecundario,
    fontWeight: '500',
    lineHeight: 18,
  },
  espacoFinal: {
    height: 40,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  containerModalAgendamento: {
    backgroundColor: cores.fundoPagina,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 0,
  },
  headerModalAgendamento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  tituloModalAgendamento: {
    fontSize: 22,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  conteudoModalAgendamento: {
    paddingHorizontal: 20,
  },
  secaoFotoReceita: {
    marginVertical: 24,
  },
  labelSecaoFoto: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.textoPrincipal,
    marginBottom: 12,
  },
  areaFotoReceita: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: cores.fundoLeve,
    borderWidth: 2,
    borderColor: cores.borda,
    borderStyle: 'dashed',
  },
  fotoReceita: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderFotoReceita: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoFotoReceita: {
    fontSize: 14,
    color: cores.primaria,
    marginTop: 8,
    fontWeight: '500',
  },
  grupoInputAgendamento: {
    marginBottom: 18,
  },
  labelInputAgendamento: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.textoPrincipal,
    marginBottom: 8,
  },
  inputAgendamento: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: cores.textoPrincipal,
    backgroundColor: cores.fundoLeve,
  },
  inputMultilinhaAgendamento: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  espacoRodapeAgendamento: {
    height: 20,
  },
  rodapeModalAgendamento: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: 12,
  },
  botaoCancelarAgendamento: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.borda,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoCancelarAgendamento: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  botaoConfirmarAgendamento: {
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
  textoBotaoConfirmarAgendamento: {
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
  
});
