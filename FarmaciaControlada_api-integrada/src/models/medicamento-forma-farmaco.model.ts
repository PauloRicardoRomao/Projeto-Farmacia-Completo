import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  ForeignKey,
} from "sequelize";

import sequelize from "../config/config";
import type Doacao from "./doacao.model";
import type EstoqueMedicamento from "./estoque-medicamento.model";
import type FormaFarmacoMedicamento from "./forma-farmaco-medicamento.model";
import type Medicamento from "./medicamento.model";
import type MedicamentoDoacao from "./medicamento-doacao.model";
import type ReceitaMedicamento from "./receita-medicamento.model";
import type ReceitaUsuario from "./receita-usuario.model";

import type Imagem from "./imagem.model";

class MedicamentoFormaFarmaco extends Model<
  InferAttributes<MedicamentoFormaFarmaco>,
  InferCreationAttributes<MedicamentoFormaFarmaco>
> {
  declare id: CreationOptional<number>;
  declare medicamentoId: ForeignKey<Medicamento["id"]>;
  declare formaFarmacoId: ForeignKey<FormaFarmacoMedicamento["id"]>;
  declare ativo: CreationOptional<boolean>;

  declare medicamento?: NonAttribute<Medicamento>;
  declare formaFarmaco?: NonAttribute<FormaFarmacoMedicamento>;
  declare estoquesMedicamentos?: NonAttribute<EstoqueMedicamento[]>;
  declare medicamentoDoacoes?: NonAttribute<MedicamentoDoacao[]>;
  declare receitasMedicamentos?: NonAttribute<ReceitaMedicamento[]>;
  declare receitasUsuarios?: NonAttribute<ReceitaUsuario[]>;
  declare doacoes?: NonAttribute<Doacao[]>;
  declare imagens?: NonAttribute<Imagem[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MedicamentoFormaFarmaco.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    medicamentoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "medicamento_id",
      references: {
        model: "medicamento",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    formaFarmacoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "forma_farmaco_id",
      references: {
        model: "forma_farmaco_medicamento",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "medicamento_forma_farmaco",
    freezeTableName: true,
    timestamps: true,
  },
);

export default MedicamentoFormaFarmaco;
