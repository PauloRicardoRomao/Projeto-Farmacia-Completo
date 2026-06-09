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
import type Doacao from "./doacao.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";
import type TriagemDoacao from "./triagem-doacao.model";

class MedicamentoDoacao extends Model<
  InferAttributes<MedicamentoDoacao>,
  InferCreationAttributes<MedicamentoDoacao>
> {
  declare id: CreationOptional<number>;
  declare doacaoId: ForeignKey<Doacao["id"]>;
  declare medicamentoFormaFarmacoId:
  ForeignKey<MedicamentoFormaFarmaco["id"]> | null;
  declare quantidade: number;
  declare ativo: CreationOptional<boolean>;

  declare doacao?: NonAttribute<Doacao>;
  declare medicamentoFormaFarmaco?: NonAttribute<MedicamentoFormaFarmaco>;
  declare triagemDoacao?: NonAttribute<TriagemDoacao>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare nomeMedicamento: string;
  declare descricaoMedicamento: string | null;
}

MedicamentoDoacao.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeMedicamento: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "nome_medicamento",
    },

    descricaoMedicamento: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "descricao_medicamento",
    },
    doacaoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "doacao_id",
      references: {
        model: "doacao",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    medicamentoFormaFarmacoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
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
    tableName: "medicamento_doacao",
    freezeTableName: true,
    timestamps: true,
  },
);

export default MedicamentoDoacao;
