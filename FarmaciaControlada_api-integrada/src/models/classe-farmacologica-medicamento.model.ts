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

class ClasseFarmacologicaMedicamento extends Model<
  InferAttributes<ClasseFarmacologicaMedicamento>,
  InferCreationAttributes<ClasseFarmacologicaMedicamento>
> {
  declare id: CreationOptional<number>;
  declare classe: string;
  declare ativo: CreationOptional<boolean>;

  declare medicamentos?: NonAttribute<Medicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ClasseFarmacologicaMedicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    classe: {
      type: DataTypes.STRING(75),
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
    tableName: "classe_farmacologica_medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default ClasseFarmacologicaMedicamento;
