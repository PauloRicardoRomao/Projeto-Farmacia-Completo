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
import type EstoqueMedicamento from "./estoque-medicamento.model";
import type TriagemDoacao from "./triagem-doacao.model";

class ItemEstoqueMedicamento extends Model<
  InferAttributes<ItemEstoqueMedicamento>,
  InferCreationAttributes<ItemEstoqueMedicamento>
> {
  declare id: CreationOptional<number>;
  declare triagemDoacaoId: ForeignKey<TriagemDoacao["id"]> | null;
  declare estoqueMedicamentoId: ForeignKey<EstoqueMedicamento["id"]>;
  declare tipo: "entrada" | "saida" | "ajuste";
  declare quantidade: number;
  declare observacao: CreationOptional<string | null>;
  declare ativo: CreationOptional<boolean>;

  declare triagemDoacao?: NonAttribute<TriagemDoacao>;
  declare estoqueMedicamento?: NonAttribute<EstoqueMedicamento>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ItemEstoqueMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    triagemDoacaoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "triagem_doacao_id",
      references: {
        model: "triagem_doacao",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    estoqueMedicamentoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "estoque_medicamento_id",
      references: {
        model: "estoque_medicamento",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    tipo: {
      type: DataTypes.ENUM("entrada", "saida", "ajuste"),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    observacao: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: "item_estoque_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default ItemEstoqueMedicamento;
