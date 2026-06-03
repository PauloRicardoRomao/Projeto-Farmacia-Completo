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
import type ClasseFarmacologicaMedicamento from "./classe-farmacologica-medicamento.model";
import type FormaFarmacoMedicamento from "./forma-farmaco-medicamento.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";
import type MedicamentoUsoTerapeutico from "./medicamento-uso-terapeutico.model";
import type TarjaMedicamento from "./tarja-medicamento.model";
import type UsoTerapeuticoMedicamento from "./uso-terapeutico-medicamento.model";

class Medicamento extends Model<
  InferAttributes<Medicamento>,
  InferCreationAttributes<Medicamento>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare descricao: string;
  declare classeId: ForeignKey<ClasseFarmacologicaMedicamento["id"]>;
  declare tarjaId: ForeignKey<TarjaMedicamento["id"]>;
  declare ativo: CreationOptional<boolean>;

  declare classeFarmacologica?: NonAttribute<ClasseFarmacologicaMedicamento>;
  declare tarjaMedicamento?: NonAttribute<TarjaMedicamento>;
  declare medicamentoFormaFarmacos?: NonAttribute<MedicamentoFormaFarmaco[]>;
  declare medicamentoUsoTerapeuticos?: NonAttribute<MedicamentoUsoTerapeutico[]>;
  declare formasFarmaco?: NonAttribute<FormaFarmacoMedicamento[]>;
  declare usosTerapeuticos?: NonAttribute<UsoTerapeuticoMedicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Medicamento.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    classeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "classe_id",
      references: {
        model: "classe_farmacologica_medicamento",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    tarjaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "tarja_id",
      references: {
        model: "tarja_medicamento",
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
    tableName: "medicamento",
    freezeTableName: true,
    timestamps: true,
  },
);

export default Medicamento;
