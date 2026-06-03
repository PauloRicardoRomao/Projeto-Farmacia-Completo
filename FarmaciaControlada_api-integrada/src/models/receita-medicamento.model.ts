import {
  Model,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  DataTypes,
} from "sequelize";

import sequelize from "../config/config";
import type ReceitaUsuario from "./receita-usuario.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";

class ReceitaMedicamento extends Model<
  InferAttributes<ReceitaMedicamento>,
  InferCreationAttributes<ReceitaMedicamento>
> {
  declare id: CreationOptional<number>;
  declare receitaUsuarioId: ForeignKey<ReceitaUsuario["id"]>;
  declare medicamentoFormaFarmacoId: ForeignKey<MedicamentoFormaFarmaco["id"]>;
  declare quantidade: number;
  declare posologia: CreationOptional<string | null>;
  declare continuo: CreationOptional<boolean>;
  declare ativo: CreationOptional<boolean>;

  declare receitaUsuario?: NonAttribute<ReceitaUsuario>;
  declare medicamentoFormaFarmaco?: NonAttribute<MedicamentoFormaFarmaco>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ReceitaMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    receitaUsuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "receita_usuario_id",
      references: {
        model: "receita_usuario",
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
    quantidade: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    posologia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    continuo: {
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
    tableName: "receita_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default ReceitaMedicamento;
