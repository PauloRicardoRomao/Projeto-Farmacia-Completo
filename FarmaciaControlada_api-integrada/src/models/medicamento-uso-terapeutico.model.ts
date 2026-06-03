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
import type Medicamento from "./medicamento.model";
import type UsoTerapeuticoMedicamento from "./uso-terapeutico-medicamento.model";

class MedicamentoUsoTerapeutico extends Model<
  InferAttributes<MedicamentoUsoTerapeutico>,
  InferCreationAttributes<MedicamentoUsoTerapeutico>
> {
  declare id: CreationOptional<number>;
  declare medicamentoId: ForeignKey<Medicamento["id"]>;
  declare usoTerapeuticoId: ForeignKey<UsoTerapeuticoMedicamento["id"]>;
  declare ativo: CreationOptional<boolean>;

  declare medicamento?: NonAttribute<Medicamento>;
  declare usoTerapeutico?: NonAttribute<UsoTerapeuticoMedicamento>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MedicamentoUsoTerapeutico.init(
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
    usoTerapeuticoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "uso_terapeutico_id",
      references: {
        model: "uso_terapeutico_medicamento",
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
    tableName: "medicamento_uso_terapeutico",
    freezeTableName: true,
    timestamps: true,
  },
);

export default MedicamentoUsoTerapeutico;
