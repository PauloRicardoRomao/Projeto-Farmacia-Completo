import ClasseFarmacologicaMedicamento from "./classe-farmacologica-medicamento.model";
import Doacao from "./doacao.model";
import Empresa from "./empresa.model";
import EnderecoEmpresa from "./endereco-empresa.model";
import EstoqueMedicamento from "./estoque-medicamento.model";
import FormaFarmacoMedicamento from "./forma-farmaco-medicamento.model";
import ItemEstoqueMedicamento from "./item-estoque-medicamento.model";
import Imagem from "./imagem.model";
import Medicamento from "./medicamento.model";
import MedicamentoDoacao from "./medicamento-doacao.model";
import MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";
import MedicamentoUsoTerapeutico from "./medicamento-uso-terapeutico.model";
import ReceitaMedicamento from "./receita-medicamento.model";
import ReceitaUsuario from "./receita-usuario.model";
import TarjaMedicamento from "./tarja-medicamento.model";
import TriagemDoacao from "./triagem-doacao.model";
import UsoTerapeuticoMedicamento from "./uso-terapeutico-medicamento.model";
import Usuario from "./usuario.model";
import UsuarioEmpresa from "./usuario-empresa.model";
import { registerAssociations } from "./associations";

registerAssociations();

export {
  ClasseFarmacologicaMedicamento,
  Doacao,
  Empresa,
  EnderecoEmpresa,
  EstoqueMedicamento,
  FormaFarmacoMedicamento,
  ItemEstoqueMedicamento,
  Imagem,
  Medicamento,
  MedicamentoDoacao,
  MedicamentoFormaFarmaco,
  MedicamentoUsoTerapeutico,
  ReceitaMedicamento,
  ReceitaUsuario,
  TarjaMedicamento,
  TriagemDoacao,
  UsoTerapeuticoMedicamento,
  Usuario,
  UsuarioEmpresa,
};
