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
import type Empresa from "./empresa.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";
import type ItemEstoqueMedicamento from "./item-estoque-medicamento.model";

class EstoqueMedicamento extends Model<
  InferAttributes<EstoqueMedicamento>,
  InferCreationAttributes<EstoqueMedicamento>
> {
  declare id: CreationOptional<number>;
  declare empresaId: ForeignKey<Empresa["id"]>;
  declare medicamentoFormaFarmacoId: ForeignKey<MedicamentoFormaFarmaco["id"]>;
  declare quantidadeMinima: CreationOptional<number>;
  declare quantidadeAtual: CreationOptional<number>;
  declare ativo: CreationOptional<boolean>;

  declare empresa?: NonAttribute<Empresa>;
  declare medicamentoFormaFarmaco?: NonAttribute<MedicamentoFormaFarmaco>;
  declare itensEstoqueMedicamento?: NonAttribute<ItemEstoqueMedicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EstoqueMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    empresaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "empresa_id",
      references: {
        model: "empresa",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    medicamentoFormaFarmacoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "medicamento_forma_farmaco_id",
      references: {
        model: "medicamento_forma_farmaco",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    quantidadeMinima: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "quantidade_minima",
      validate: {
        min: 0,
      },
    },
    quantidadeAtual: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "quantidade_atual",
      validate: {
        min: 0,
      },
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
    tableName: "estoque_medicamento",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["empresa_id", "medicamento_forma_farmaco_id"],
      },
    ],
  },
);

export default EstoqueMedicamento;
