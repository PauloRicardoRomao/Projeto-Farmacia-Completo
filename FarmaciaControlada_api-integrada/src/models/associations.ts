import ClasseFarmacologicaMedicamento from "./classe-farmacologica-medicamento.model";
import Doacao from "./doacao.model";
import Empresa from "./empresa.model";
import EnderecoEmpresa from "./endereco-empresa.model";
import EstoqueMedicamento from "./estoque-medicamento.model";
import FormaFarmacoMedicamento from "./forma-farmaco-medicamento.model";
import ItemEstoqueMedicamento from "./item-estoque-medicamento.model";
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

import Imagem from "./imagem.model";

export function registerAssociations() {
  Empresa.hasMany(EnderecoEmpresa, {
    foreignKey: "empresaId",
    as: "enderecos",
  });

  EnderecoEmpresa.belongsTo(Empresa, {
    foreignKey: "empresaId",
    as: "empresa",
  });

  Usuario.hasMany(UsuarioEmpresa, {
    foreignKey: "usuarioId",
    as: "usuariosEmpresas",
  });

  UsuarioEmpresa.belongsTo(Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });

  Empresa.hasMany(UsuarioEmpresa, {
    foreignKey: "empresaId",
    as: "usuariosEmpresas",
  });

  UsuarioEmpresa.belongsTo(Empresa, {
    foreignKey: "empresaId",
    as: "empresa",
  });

  Usuario.belongsToMany(Empresa, {
    through: { model: UsuarioEmpresa, unique: false },
    foreignKey: "usuarioId",
    otherKey: "empresaId",
    as: "empresas",
  });

  Empresa.belongsToMany(Usuario, {
    through: { model: UsuarioEmpresa, unique: false },
    foreignKey: "empresaId",
    otherKey: "usuarioId",
    as: "usuarios",
  });

  Usuario.hasMany(ReceitaUsuario, {
    foreignKey: "usuarioId",
    as: "receitasUsuarios",
  });

  ReceitaUsuario.belongsTo(Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });

  Empresa.hasMany(ReceitaUsuario, {
    foreignKey: "empresaId",
    as: "receitasUsuarios",
  });

  ReceitaUsuario.belongsTo(Empresa, {
    foreignKey: "empresaId",
    as: "empresa",
  });

  ReceitaUsuario.hasMany(ReceitaMedicamento, {
    foreignKey: "receitaUsuarioId",
    as: "receitasMedicamentos",
  });

  ReceitaMedicamento.belongsTo(ReceitaUsuario, {
    foreignKey: "receitaUsuarioId",
    as: "receitaUsuario",
  });

  MedicamentoFormaFarmaco.hasMany(ReceitaMedicamento, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "receitasMedicamentos",
  });

  ReceitaMedicamento.belongsTo(MedicamentoFormaFarmaco, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "medicamentoFormaFarmaco",
  });

  ReceitaUsuario.belongsToMany(MedicamentoFormaFarmaco, {
    through: { model: ReceitaMedicamento, unique: false },
    foreignKey: "receitaUsuarioId",
    otherKey: "medicamentoFormaFarmacoId",
    as: "medicamentosFormaFarmaco",
  });

  MedicamentoFormaFarmaco.belongsToMany(ReceitaUsuario, {
    through: { model: ReceitaMedicamento, unique: false },
    foreignKey: "medicamentoFormaFarmacoId",
    otherKey: "receitaUsuarioId",
    as: "receitasUsuarios",
  });

  ClasseFarmacologicaMedicamento.hasMany(Medicamento, {
    foreignKey: "classeId",
    as: "medicamentos",
  });

  Medicamento.belongsTo(ClasseFarmacologicaMedicamento, {
    foreignKey: "classeId",
    as: "classeFarmacologica",
  });

  TarjaMedicamento.hasMany(Medicamento, {
    foreignKey: "tarjaId",
    as: "medicamentos",
  });

  Medicamento.belongsTo(TarjaMedicamento, {
    foreignKey: "tarjaId",
    as: "tarjaMedicamento",
  });

  Medicamento.hasMany(MedicamentoFormaFarmaco, {
    foreignKey: "medicamentoId",
    as: "medicamentoFormaFarmacos",
  });

  MedicamentoFormaFarmaco.belongsTo(Medicamento, {
    foreignKey: "medicamentoId",
    as: "medicamento",
  });

  FormaFarmacoMedicamento.hasMany(MedicamentoFormaFarmaco, {
    foreignKey: "formaFarmacoId",
    as: "medicamentoFormaFarmacos",
  });

  MedicamentoFormaFarmaco.belongsTo(FormaFarmacoMedicamento, {
    foreignKey: "formaFarmacoId",
    as: "formaFarmaco",
  });

  Medicamento.belongsToMany(FormaFarmacoMedicamento, {
    through: { model: MedicamentoFormaFarmaco, unique: false },
    foreignKey: "medicamentoId",
    otherKey: "formaFarmacoId",
    as: "formasFarmaco",
  });

  FormaFarmacoMedicamento.belongsToMany(Medicamento, {
    through: { model: MedicamentoFormaFarmaco, unique: false },
    foreignKey: "formaFarmacoId",
    otherKey: "medicamentoId",
    as: "medicamentos",
  });

  Empresa.hasMany(EstoqueMedicamento, {
    foreignKey: "empresaId",
    as: "estoquesMedicamentos",
  });

  EstoqueMedicamento.belongsTo(Empresa, {
    foreignKey: "empresaId",
    as: "empresa",
  });

  MedicamentoFormaFarmaco.hasMany(EstoqueMedicamento, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "estoquesMedicamentos",
  });

  EstoqueMedicamento.belongsTo(MedicamentoFormaFarmaco, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "medicamentoFormaFarmaco",
  });

  EstoqueMedicamento.hasMany(ItemEstoqueMedicamento, {
    foreignKey: "estoqueMedicamentoId",
    as: "itensEstoqueMedicamento",
  });

  ItemEstoqueMedicamento.belongsTo(EstoqueMedicamento, {
    foreignKey: "estoqueMedicamentoId",
    as: "estoqueMedicamento",
  });

  TriagemDoacao.hasMany(ItemEstoqueMedicamento, {
    foreignKey: "triagemDoacaoId",
    as: "itensEstoqueMedicamento",
  });

  ItemEstoqueMedicamento.belongsTo(TriagemDoacao, {
    foreignKey: "triagemDoacaoId",
    as: "triagemDoacao",
  });

  Doacao.hasMany(MedicamentoDoacao, {
    foreignKey: "doacaoId",
    as: "medicamentoDoacoes",
  });

  MedicamentoDoacao.belongsTo(Doacao, {
    foreignKey: "doacaoId",
    as: "doacao",
  });

  MedicamentoFormaFarmaco.hasMany(MedicamentoDoacao, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "medicamentoDoacoes",
  });

  MedicamentoDoacao.belongsTo(MedicamentoFormaFarmaco, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "medicamentoFormaFarmaco",
  });

  Doacao.belongsToMany(MedicamentoFormaFarmaco, {
    through: { model: MedicamentoDoacao, unique: false },
    foreignKey: "doacaoId",
    otherKey: "medicamentoFormaFarmacoId",
    as: "medicamentosFormaFarmaco",
  });

  MedicamentoFormaFarmaco.belongsToMany(Doacao, {
    through: { model: MedicamentoDoacao, unique: false },
    foreignKey: "medicamentoFormaFarmacoId",
    otherKey: "doacaoId",
    as: "doacoes",
  });

  MedicamentoDoacao.hasOne(TriagemDoacao, {
    foreignKey: "medicamentoDoacaoId",
    as: "triagemDoacao",
  });

  TriagemDoacao.belongsTo(MedicamentoDoacao, {
    foreignKey: "medicamentoDoacaoId",
    as: "medicamentoDoacao",
  });

  Medicamento.hasMany(MedicamentoUsoTerapeutico, {
    foreignKey: "medicamentoId",
    as: "medicamentoUsoTerapeuticos",
  });

  MedicamentoUsoTerapeutico.belongsTo(Medicamento, {
    foreignKey: "medicamentoId",
    as: "medicamento",
  });

  UsoTerapeuticoMedicamento.hasMany(MedicamentoUsoTerapeutico, {
    foreignKey: "usoTerapeuticoId",
    as: "medicamentoUsoTerapeuticos",
  });

  MedicamentoUsoTerapeutico.belongsTo(UsoTerapeuticoMedicamento, {
    foreignKey: "usoTerapeuticoId",
    as: "usoTerapeutico",
  });

  Medicamento.belongsToMany(UsoTerapeuticoMedicamento, {
    through: { model: MedicamentoUsoTerapeutico, unique: false },
    foreignKey: "medicamentoId",
    otherKey: "usoTerapeuticoId",
    as: "usosTerapeuticos",
  });

  UsoTerapeuticoMedicamento.belongsToMany(Medicamento, {
    through: { model: MedicamentoUsoTerapeutico, unique: false },
    foreignKey: "usoTerapeuticoId",
    otherKey: "medicamentoId",
    as: "medicamentos",
  });

  Usuario.hasMany(Imagem, {
    foreignKey: "usuarioId",
    as: "imagens",
  });

  Imagem.belongsTo(Usuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });

  ReceitaUsuario.hasMany(Imagem, {
    foreignKey: "receitaUsuarioId",
    as: "imagens",
  });

  Imagem.belongsTo(ReceitaUsuario, {
    foreignKey: "receitaUsuarioId",
    as: "receitaUsuario",
  });

  MedicamentoFormaFarmaco.hasMany(Imagem, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "imagens",
  });

  Imagem.belongsTo(MedicamentoFormaFarmaco, {
    foreignKey: "medicamentoFormaFarmacoId",
    as: "medicamentoFormaFarmaco",
  });
}
