import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { api, obterAuth } from "../../../services/api";

type StatusTriagem = "pendente" | "aprovada" | "reprovada";

type ItemDoacaoApi = {
  id: number;
  nomeMedicamento: string;
  descricaoMedicamento?: string | null;
  quantidade: number;
  medicamentoFormaFarmacoId?: number | null;
  triagemDoacao?: {
    id: number;
    validade: string;
    status?: StatusTriagem;
    aprovado: boolean;
    ativo: boolean;
  } | null;
  medicamentoFormaFarmaco?: {
    medicamento?: { nome?: string };
    formaFarmaco?: { forma?: string; embalagem?: string };
  } | null;
};

type DoacaoApi = {
  id: number;
  cpf: string;
  createdAt: string;
  medicamentoDoacoes?: ItemDoacaoApi[];
};

type CardDoacao = {
  id: string;
  doacaoId: number;
  triagemId: number;
  nomeMedicamento: string;
  descricao: string;
  quantidade: number;
  validade: string;
  dataCadastro: string;
  status: StatusTriagem;
  forma: string;
  cpf: string;
};

function formatarData(valor?: string) {
  if (!valor) return "Não informado";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return valor;

  return data.toLocaleDateString("pt-BR");
}

function normalizarStatus(item: ItemDoacaoApi): StatusTriagem {
  if (item.triagemDoacao?.status) return item.triagemDoacao.status;
  if (item.triagemDoacao?.aprovado) return "aprovada";
  if (item.triagemDoacao?.ativo === false) return "reprovada";
  return "pendente";
}

function corStatus(status: StatusTriagem) {
  if (status === "aprovada") return "#10B981";
  if (status === "reprovada") return "#D92F2F";
  return "#F59E0B";
}

function textoStatus(status: StatusTriagem) {
  if (status === "aprovada") return "Aprovada";
  if (status === "reprovada") return "Reprovada";
  return "Em triagem";
}

export default function DoacoesEmpresa() {
  const [doacoes, setDoacoes] = useState<CardDoacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [doacaoSelecionada, setDoacaoSelecionada] = useState<CardDoacao | null>(null);

  const indicadores = useMemo(
    () => ({
      pendentes: doacoes.filter((item) => item.status === "pendente").length,
      aprovadas: doacoes.filter((item) => item.status === "aprovada").length,
      reprovadas: doacoes.filter((item) => item.status === "reprovada").length,
    }),
    [doacoes],
  );

  async function carregarDoacoes() {
    try {
      setCarregando(true);
      const response = await api.get<DoacaoApi[]>("/doacoes");
      const cards = response.flatMap((doacao) =>
        (doacao.medicamentoDoacoes ?? [])
          .filter((item) => item.triagemDoacao?.id)
          .map((item) => ({
            id: `${doacao.id}-${item.id}`,
            doacaoId: doacao.id,
            triagemId: item.triagemDoacao!.id,
            nomeMedicamento:
              item.medicamentoFormaFarmaco?.medicamento?.nome ?? item.nomeMedicamento,
            descricao: item.descricaoMedicamento ?? "Sem descrição informada.",
            quantidade: Number(item.quantidade ?? 0),
            validade: formatarData(item.triagemDoacao?.validade),
            dataCadastro: formatarData(doacao.createdAt),
            status: normalizarStatus(item),
            forma:
              item.medicamentoFormaFarmaco?.formaFarmaco?.forma ??
              "Será vinculada pelo catálogo ao aprovar",
            cpf: doacao.cpf,
          })),
      );

      setDoacoes(cards);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível carregar as doações.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDoacoes();
  }, []);

  async function aprovarDoacao(item: CardDoacao) {
    try {
      setProcessandoId(item.id);
      const auth = await obterAuth();
      const empresaId = auth?.empresa?.id;

      if (!empresaId) {
        Alert.alert("Atenção", "Faça login novamente como empresa.");
        return;
      }

      await api.patch(`/doacoes/triagens/${item.triagemId}/aprovar`, {
        empresaId,
        observacao: `Entrada no estoque pela doação #${item.doacaoId}.`,
      });

      Alert.alert("Sucesso", "Doação aprovada e medicamento lançado no estoque.");
      await carregarDoacoes();
    } catch (error) {
      Alert.alert(
        "Erro ao aprovar",
        error instanceof Error ? error.message : "Não foi possível aprovar a doação.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function reprovarDoacao(item: CardDoacao) {
    try {
      setProcessandoId(item.id);
      await api.patch(`/doacoes/triagens/${item.triagemId}/reprovar`, {});
      Alert.alert("Sucesso", "Doação reprovada na triagem.");
      await carregarDoacoes();
    } catch (error) {
      Alert.alert(
        "Erro ao reprovar",
        error instanceof Error ? error.message : "Não foi possível reprovar a doação.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  function abrirModal(item: CardDoacao) {
    setDoacaoSelecionada(item);
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    setDoacaoSelecionada(null);
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={require("../../../assets/LogoFarm.fw.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.acaoHeader}>
            <Ionicons name="notifications-outline" size={28} color="#fff" />
            <Ionicons name="person-circle-outline" size={32} color="#fff" />
          </View>
        </View>

        <View style={styles.titulo}>
          <Text style={styles.tituloPrincipal}>Central de Doações</Text>
          <Text style={styles.subtitulo}>Triagem, aprovação e entrada automática em estoque</Text>
        </View>

        <View style={styles.layoutIndicadores}>
          <View style={[styles.cardIndicador, { backgroundColor: "#D92F2F" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.reprovadas}</Text>
            <Text style={styles.indicadorTexto}>Reprovadas</Text>
          </View>
          <View style={[styles.cardIndicador, { backgroundColor: "#F59E0B" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.pendentes}</Text>
            <Text style={styles.indicadorTexto}>Em triagem</Text>
          </View>
          <View style={[styles.cardIndicador, { backgroundColor: "#10B981" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.aprovadas}</Text>
            <Text style={styles.indicadorTexto}>Aprovadas</Text>
          </View>
        </View>

        <View style={styles.lista}>
          {carregando ? (
            <ActivityIndicator color="#369262" size="large" />
          ) : doacoes.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma doação cadastrada.</Text>
          ) : (
            doacoes.map((item) => (
              <View key={item.id} style={styles.cardDoacao}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>Doação #{item.doacaoId}</Text>
                    <Text style={styles.cardInfo}>Medicamento: {item.nomeMedicamento}</Text>
                    <Text style={styles.cardInfo}>Quantidade: {item.quantidade}</Text>
                    <Text style={styles.cardInfo}>Validade: {item.validade}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: corStatus(item.status) }]}>
                    <Text style={styles.statusTexto}>{textoStatus(item.status)}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.buttonInfo} onPress={() => abrirModal(item)}>
                    <Ionicons name="information-circle-outline" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Detalhes</Text>
                  </TouchableOpacity>

                  {item.status === "pendente" && (
                    <>
                      <TouchableOpacity
                        style={styles.buttonReject}
                        onPress={() => reprovarDoacao(item)}
                        disabled={processandoId === item.id}
                      >
                        <Ionicons name="close-outline" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Reprovar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buttonApprove}
                        onPress={() => aprovarDoacao(item)}
                        disabled={processandoId === item.id}
                      >
                        <Ionicons name="checkmark-outline" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Aprovar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={fecharModal}>
        <View style={styles.fundoModal}>
          <View style={styles.modalCard}>
            <View style={styles.headerModal}>
              <Text style={styles.modalTitulo}>Detalhes da Doação</Text>
              <TouchableOpacity onPress={fecharModal}>
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Medicamento</Text>
            <Text style={styles.modalValor}>{doacaoSelecionada?.nomeMedicamento}</Text>

            <Text style={styles.modalLabel}>Descrição</Text>
            <Text style={styles.modalValor}>{doacaoSelecionada?.descricao}</Text>

            <Text style={styles.modalLabel}>Forma farmacêutica</Text>
            <Text style={styles.modalValor}>{doacaoSelecionada?.forma}</Text>

            <Text style={styles.modalLabel}>CPF do doador</Text>
            <Text style={styles.modalValor}>{doacaoSelecionada?.cpf}</Text>

            <Text style={styles.modalLabel}>Status</Text>
            <Text style={styles.modalValor}>{doacaoSelecionada ? textoStatus(doacaoSelecionada.status) : ""}</Text>

            {doacaoSelecionada?.status === "pendente" && (
              <View style={styles.rodapeModal}>
                <TouchableOpacity
                  style={styles.botaoRejeitar}
                  onPress={() => {
                    const item = doacaoSelecionada;
                    fecharModal();
                    if (item) reprovarDoacao(item);
                  }}
                >
                  <Text style={styles.textoBotaoModal}>Reprovar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoAprovar}
                  onPress={() => {
                    const item = doacaoSelecionada;
                    fecharModal();
                    if (item) aprovarDoacao(item);
                  }}
                >
                  <Text style={styles.textoBotaoModal}>Aprovar e lançar estoque</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 100,
    backgroundColor: "#72CAA5",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: { width: 200, height: 80 },
  acaoHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  titulo: { marginHorizontal: 20, marginTop: 20 },
  tituloPrincipal: { fontSize: 25, fontWeight: "bold", color: "#1F2937" },
  subtitulo: { fontSize: 16, color: "#6B7280", marginTop: 4 },
  layoutIndicadores: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  cardIndicador: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  indicadorNumero: { color: "#fff", fontSize: 28, fontWeight: "800" },
  indicadorTexto: { color: "#fff", fontSize: 12, fontWeight: "700", marginTop: 4 },
  lista: { padding: 20, gap: 12 },
  vazio: { textAlign: "center", color: "#6B7280", marginTop: 30 },
  cardDoacao: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  cardTitulo: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  cardInfo: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignSelf: "flex-start" },
  statusTexto: { color: "#fff", fontWeight: "700", fontSize: 12 },
  actionButtons: { flexDirection: "row", gap: 8, marginTop: 14 },
  buttonApprove: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  buttonReject: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D92F2F",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  buttonInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  headerModal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitulo: { fontSize: 20, fontWeight: "700", color: "#333" },
  modalLabel: { fontSize: 12, color: "#888", fontWeight: "700", marginTop: 12, textTransform: "uppercase" },
  modalValor: { fontSize: 16, color: "#333", marginTop: 4 },
  rodapeModal: { flexDirection: "row", gap: 10, marginTop: 22 },
  botaoRejeitar: { flex: 1, backgroundColor: "#D92F2F", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  botaoAprovar: { flex: 1.4, backgroundColor: "#10B981", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  textoBotaoModal: { color: "#fff", fontWeight: "700", fontSize: 13, textAlign: "center" },
});