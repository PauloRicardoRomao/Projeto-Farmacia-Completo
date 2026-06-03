import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import sequelize from "../config/config";
import type MedicamentoDoacao from "./medicamento-doacao.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";

class Doacao extends Model<
  InferAttributes<Doacao>,
  InferCreationAttributes<Doacao>
> {
  declare id: CreationOptional<number>;
  declare cpf: string;
  declare ativo: CreationOptional<boolean>;

  declare medicamentoDoacoes?: NonAttribute<MedicamentoDoacao[]>;
  declare medicamentosFormaFarmaco?: NonAttribute<MedicamentoFormaFarmaco[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Doacao.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    cpf: {
      type: DataTypes.STRING(14),
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
    tableName: "doacao",
    freezeTableName: true,
    timestamps: true,
  },
);

export default Doacao;
