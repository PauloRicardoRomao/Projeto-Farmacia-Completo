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
import type MedicamentoUsoTerapeutico from "./medicamento-uso-terapeutico.model";

class UsoTerapeuticoMedicamento extends Model<
  InferAttributes<UsoTerapeuticoMedicamento>,
  InferCreationAttributes<UsoTerapeuticoMedicamento>
> {
  declare id: CreationOptional<number>;
  declare propriedadeTerapeutica: string;
  declare descricao: string;
  declare ativo: CreationOptional<boolean>;

  declare medicamentos?: NonAttribute<Medicamento[]>;
  declare medicamentoUsoTerapeuticos?: NonAttribute<MedicamentoUsoTerapeutico[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UsoTerapeuticoMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    propriedadeTerapeutica: {
      type: DataTypes.STRING(75),
      allowNull: false,
      field: "propriedade_terapeutica",
    },
    descricao: {
      type: DataTypes.STRING(100),
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
    tableName: "uso_terapeutico_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default UsoTerapeuticoMedicamento;
