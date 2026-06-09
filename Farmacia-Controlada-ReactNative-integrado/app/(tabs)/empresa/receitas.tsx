import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { api, obterAuth } from "../../../services/api";

type StatusReceita = "pendente" | "aprovada" | "rejeitada" | "dispensada";

type ReceitaApi = {
  id: number;
  status?: StatusReceita;
  crmMedico?: string | null;
  dataEmissao: string;
  dataVencimento?: string | null;
  observacao?: string | null;
  usuario?: {
    nome?: string | null;
    email?: string | null;
    cpf?: string | null;
  } | null;
  empresa?: {
    razaoSocial?: string;
  } | null;
  receitasMedicamentos?: Array<{
    id: number;
    quantidade: number;
    posologia?: string | null;
    medicamentoFormaFarmaco?: {
      medicamento?: { nome?: string };
      formaFarmaco?: { forma?: string; embalagem?: string };
    } | null;
  }>;
};

function formatarData(valor?: string | null) {
  if (!valor) return "Não informado";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return valor;

  return data.toLocaleDateString("pt-BR");
}

function corStatus(status: StatusReceita) {
  if (status === "aprovada") return "#10B981";
  if (status === "rejeitada") return "#D92F2F";
  if (status === "dispensada") return "#2563EB";
  return "#F59E0B";
}

function textoStatus(status: StatusReceita) {
  if (status === "aprovada") return "Aprovada";
  if (status === "rejeitada") return "Rejeitada";
  if (status === "dispensada") return "Retirada";
  return "Pendente";
}

function listarMedicamentos(receita?: ReceitaApi | null) {
  const itens = receita?.receitasMedicamentos ?? [];

  if (itens.length === 0) return "Nenhum medicamento informado.";

  return itens
    .map((item) => {
      const nome = item.medicamentoFormaFarmaco?.medicamento?.nome ?? "Medicamento";
      const forma = item.medicamentoFormaFarmaco?.formaFarmaco?.forma ?? "forma não informada";

      return `${nome} (${forma}) - ${item.quantidade} un.`;
    })
    .join("\n");
}

export default function ReceitasEmpresa() {
  const [receitas, setReceitas] = useState<ReceitaApi[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState<ReceitaApi | null>(null);

  const indicadores = useMemo(
    () => ({
      pendentes: receitas.filter((item) => (item.status ?? "pendente") === "pendente").length,
      aprovadas: receitas.filter((item) => item.status === "aprovada").length,
      retiradas: receitas.filter((item) => item.status === "dispensada").length,
    }),
    [receitas],
  );

  const receitasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return receitas;

    return receitas.filter((receita) => {
      const paciente = receita.usuario?.nome ?? "";
      const medicamentos = listarMedicamentos(receita);

      return `${paciente} ${medicamentos} ${receita.crmMedico ?? ""}`
        .toLowerCase()
        .includes(termo);
    });
  }, [busca, receitas]);

  async function carregarReceitas() {
    try {
      setCarregando(true);
      const response = await api.get<ReceitaApi[]>("/receitas");
      setReceitas(response);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível carregar as receitas.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function obterEmpresaId() {
    const auth = await obterAuth();
    const empresaId = auth?.empresa?.id;

    if (!empresaId) {
      Alert.alert("Atenção", "Faça login novamente como empresa.");
      return null;
    }

    return empresaId;
  }

  async function aprovarReceita(receita: ReceitaApi) {
    try {
      setProcessandoId(receita.id);
      const empresaId = await obterEmpresaId();

      if (!empresaId) return;

      await api.patch(`/receitas/${receita.id}/aprovar`, {
        empresaId,
        observacao: receita.observacao ?? "Receita aprovada pela triagem da empresa.",
      });

      Alert.alert("Sucesso", "Receita aprovada e autorizada para retirada.");
      await carregarReceitas();
    } catch (error) {
      Alert.alert(
        "Erro ao aprovar",
        error instanceof Error ? error.message : "Não foi possível aprovar a receita.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function reprovarReceita(receita: ReceitaApi) {
    try {
      setProcessandoId(receita.id);
      const empresaId = await obterEmpresaId();

      if (!empresaId) return;

      await api.patch(`/receitas/${receita.id}/reprovar`, {
        empresaId,
        observacao: "Receita reprovada na triagem da empresa.",
      });

      Alert.alert("Sucesso", "Receita reprovada.");
      await carregarReceitas();
    } catch (error) {
      Alert.alert(
        "Erro ao reprovar",
        error instanceof Error ? error.message : "Não foi possível reprovar a receita.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function retirarMedicamento(receita: ReceitaApi) {
    try {
      setProcessandoId(receita.id);
      const empresaId = await obterEmpresaId();

      if (!empresaId) return;

      await api.post(`/receitas/${receita.id}/dispensar`, {
        empresaId,
        observacao: `Retirada de medicamento da receita #${receita.id}.`,
      });

      Alert.alert("Sucesso", "Medicamento retirado e estoque baixado.");
      await carregarReceitas();
    } catch (error) {
      Alert.alert(
        "Erro na retirada",
        error instanceof Error ? error.message : "Não foi possível retirar o medicamento.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

  function abrirDetalhes(receita: ReceitaApi) {
    setReceitaSelecionada(receita);
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    setReceitaSelecionada(null);
  }

  function renderAcoes(receita: ReceitaApi) {
    const status = receita.status ?? "pendente";
    const bloqueado = processandoId === receita.id;

    if (status === "pendente") {
      return (
        <View style={styles.triageAcao}>
          <TouchableOpacity
            style={[styles.triageButton, { backgroundColor: "#72CAA5" }]}
            onPress={() => aprovarReceita(receita)}
            disabled={bloqueado}
          >
            <Text style={styles.triageButtonText}>Aprovar receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.triageButton, { backgroundColor: "#E60A0A" }]}
            onPress={() => reprovarReceita(receita)}
            disabled={bloqueado}
          >
            <Text style={styles.triageButtonText}>Rejeitar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "aprovada") {
      return (
        <View style={styles.triageAcao}>
          <TouchableOpacity
            style={[styles.triageButton, { backgroundColor: "#2563EB" }]}
            onPress={() => retirarMedicamento(receita)}
            disabled={bloqueado}
          >
            <Text style={styles.triageButtonText}>Confirmar retirada e baixar estoque</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
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
          <Text style={styles.tituloPrincipal}>Prontuário - Receitas</Text>
          <Text style={styles.subtitulo}>Triagem, autorização e retirada com baixa automática no estoque</Text>
        </View>

        <View style={styles.layoutIndicadores}>
          <View style={[styles.cardIndicador, { backgroundColor: "#F59E0B" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.pendentes}</Text>
            <Text style={styles.indicadorTexto}>Pendentes</Text>
          </View>
          <View style={[styles.cardIndicador, { backgroundColor: "#10B981" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.aprovadas}</Text>
            <Text style={styles.indicadorTexto}>Autorizadas</Text>
          </View>
          <View style={[styles.cardIndicador, { backgroundColor: "#2563EB" }]}>
            <Text style={styles.indicadorNumero}>{indicadores.retiradas}</Text>
            <Text style={styles.indicadorTexto}>Retiradas</Text>
          </View>
        </View>

        <View style={styles.cardInputReceitas}>
          <TextInput
            placeholder="Buscar paciente, CRM ou medicamento"
            placeholderTextColor="#777"
            value={busca}
            onChangeText={setBusca}
            style={styles.inputBusca}
          />
          <TouchableOpacity style={styles.botaoBuscar} onPress={carregarReceitas}>
            <Text style={{ color: "white", fontWeight: "700" }}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          {carregando ? (
            <ActivityIndicator color="#369262" size="large" />
          ) : receitasFiltradas.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma receita encontrada.</Text>
          ) : (
            receitasFiltradas.map((receita) => {
              const status = receita.status ?? "pendente";

              return (
                <View key={receita.id} style={styles.triageCard}>
                  <View style={styles.triageHeader}>
                    <Text style={styles.triageTitulo}>Receita #{receita.id}</Text>
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <View style={[styles.triageEstado, { backgroundColor: corStatus(status) }]}>
                        <Text style={styles.triageEstadoText}>{textoStatus(status)}</Text>
                      </View>
                      <TouchableOpacity style={styles.infoBadge} onPress={() => abrirDetalhes(receita)}>
                        <Text style={styles.triageEstadoText}>Mais info</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.triageInfo}>Paciente: {receita.usuario?.nome ?? "Não informado"}</Text>
                  <Text style={styles.triageInfo}>CPF: {receita.usuario?.cpf ?? "Não informado"}</Text>
                  <Text style={styles.triageInfo}>Emissão: {formatarData(receita.dataEmissao)}</Text>
                  <Text style={styles.triageInfo}>Medicamentos: {listarMedicamentos(receita)}</Text>

                  {renderAcoes(receita)}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={fecharModal}>
        <View style={styles.fundoModal}>
          <View style={styles.containerModalReceita}>
            <View style={styles.headerModalReceita}>
              <Text style={styles.tituloModalReceita}>Detalhes da Receita</Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.conteudoModalReceita}>
              <View style={styles.placeholderFotoModal}>
                <MaterialCommunityIcons name="file-document-outline" size={64} color="#72CAA5" />
                <Text style={styles.textoPlaceholder}>Receita enviada pelo paciente</Text>
              </View>

              <Text style={styles.labelInfoModal}>Número da Receita</Text>
              <Text style={styles.valorInfoModal}>Receita #{receitaSelecionada?.id}</Text>

              <Text style={styles.labelInfoModal}>Paciente</Text>
              <Text style={styles.valorInfoModal}>{receitaSelecionada?.usuario?.nome ?? "Não informado"}</Text>

              <Text style={styles.labelInfoModal}>CRM do médico</Text>
              <Text style={styles.valorInfoModal}>{receitaSelecionada?.crmMedico ?? "Não informado"}</Text>

              <Text style={styles.labelInfoModal}>Medicamentos</Text>
              <Text style={styles.valorInfoModal}>{listarMedicamentos(receitaSelecionada)}</Text>

              <Text style={styles.labelInfoModal}>Observações</Text>
              <Text style={styles.valorInfoModal}>{receitaSelecionada?.observacao ?? "Sem observações."}</Text>
            </ScrollView>

            <View style={styles.rodapeModalReceita}>
              <TouchableOpacity style={styles.botaoFecharModal} onPress={fecharModal}>
                <Text style={styles.textoBotaoAprovar}>Fechar</Text>
              </TouchableOpacity>
            </View>
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
  layoutIndicadores: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 18 },
  cardIndicador: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  indicadorNumero: { color: "#fff", fontSize: 28, fontWeight: "800" },
  indicadorTexto: { color: "#fff", fontSize: 12, fontWeight: "700", marginTop: 4 },
  cardInputReceitas: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
  },
  inputBusca: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    color: "#111827",
    backgroundColor: "#EBE8E8",
  },
  botaoBuscar: { padding: 12, backgroundColor: "#369262", borderRadius: 8, justifyContent: "center" },
  sectionContainer: { marginHorizontal: 20, marginTop: 24, marginBottom: 20 },
  vazio: { textAlign: "center", color: "#6B7280", marginTop: 30 },
  triageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  triageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  triageTitulo: { fontSize: 16, fontWeight: "bold", color: "#333" },
  triageEstado: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  infoBadge: { backgroundColor: "#5DAE42", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  triageEstadoText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  triageInfo: { fontSize: 13, color: "#666", marginBottom: 8, lineHeight: 18 },
  triageAcao: { flexDirection: "row", gap: 10, marginTop: 12 },
  triageButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  triageButtonText: { color: "#fff", fontWeight: "600", fontSize: 13, textAlign: "center" },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerModalReceita: { backgroundColor: "#fff", borderRadius: 16, maxHeight: "90%", width: "100%" },
  headerModalReceita: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tituloModalReceita: { fontSize: 20, fontWeight: "700", color: "#333" },
  conteudoModalReceita: { maxHeight: "75%", padding: 20 },
  placeholderFotoModal: {
    width: "100%",
    height: 160,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  textoPlaceholder: { fontSize: 14, color: "#777", marginTop: 8 },
  labelInfoModal: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  valorInfoModal: { fontSize: 16, color: "#333", fontWeight: "500", lineHeight: 22 },
  rodapeModalReceita: { padding: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  botaoFecharModal: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#72CAA5", alignItems: "center" },
  textoBotaoAprovar: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
