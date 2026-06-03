import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import sequelize from "../config/config";
import type Medicamento from "./medicamento.model";

class TarjaMedicamento extends Model<
  InferAttributes<TarjaMedicamento>,
  InferCreationAttributes<TarjaMedicamento>
> {
  declare id: CreationOptional<number>;
  declare cor: string;
  declare descricao: string;
  declare ativo: CreationOptional<boolean>;

  declare medicamentos?: NonAttribute<Medicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TarjaMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    cor: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
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
    tableName: "tarja_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default TarjaMedicamento;
