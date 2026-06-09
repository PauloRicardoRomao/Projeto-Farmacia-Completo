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
import type ItemEstoqueMedicamento from "./item-estoque-medicamento.model";
import type MedicamentoDoacao from "./medicamento-doacao.model";

class TriagemDoacao extends Model<
  InferAttributes<TriagemDoacao>,
  InferCreationAttributes<TriagemDoacao>
> {
  declare id: CreationOptional<number>;
  declare medicamentoDoacaoId: ForeignKey<MedicamentoDoacao["id"]>;
  declare validade: Date;
  declare status: CreationOptional<"pendente" | "aprovada" | "reprovada">;
  declare aprovado: CreationOptional<boolean>;
  declare ativo: CreationOptional<boolean>;

  declare medicamentoDoacao?: NonAttribute<MedicamentoDoacao>;
  declare itensEstoqueMedicamento?: NonAttribute<ItemEstoqueMedicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TriagemDoacao.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    medicamentoDoacaoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "medicamento_doacao_id",
      references: {
        model: "medicamento_doacao",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    validade: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovada", "reprovada"),
      allowNull: false,
      defaultValue: "pendente",
    },
    aprovado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "triagem_doacao",
    freezeTableName: true,
    timestamps: true,
  },
);

export default TriagemDoacao;
