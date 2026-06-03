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
import type Empresa from "./empresa.model";

class EnderecoEmpresa extends Model<
  InferAttributes<EnderecoEmpresa>,
  InferCreationAttributes<EnderecoEmpresa>
> {
  declare id: CreationOptional<number>;
  declare empresaId: ForeignKey<Empresa["id"]>;
  declare endereco: string;
  declare bairro: string;
  declare numero: number;
  declare cidade: string;
  declare estado: string;
  declare ativo: CreationOptional<boolean>;

  declare empresa?: NonAttribute<Empresa>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

EnderecoEmpresa.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    empresaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "empresa_id",
      references: {
        model: "empresa",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    endereco: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bairro: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(2),
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
    tableName: "endereco_empresa",
    freezeTableName: true,
    timestamps: true,
  },
);

export default EnderecoEmpresa;
