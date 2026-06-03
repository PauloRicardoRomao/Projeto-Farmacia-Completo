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
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";

class FormaFarmacoMedicamento extends Model<
  InferAttributes<FormaFarmacoMedicamento>,
  InferCreationAttributes<FormaFarmacoMedicamento>
> {
  declare id: CreationOptional<number>;
  declare forma: string;
  declare embalagem: string;
  declare ativo: CreationOptional<boolean>;

  declare medicamentos?: NonAttribute<Medicamento[]>;
  declare medicamentoFormaFarmacos?: NonAttribute<MedicamentoFormaFarmaco[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FormaFarmacoMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    forma: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    embalagem: {
      type: DataTypes.STRING(50),
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
    tableName: "forma_farmaco_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default FormaFarmacoMedicamento;
