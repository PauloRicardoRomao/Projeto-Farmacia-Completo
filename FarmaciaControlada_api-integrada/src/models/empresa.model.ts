import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import sequelize from "../config/config";
import type EnderecoEmpresa from "./endereco-empresa.model";
import type EstoqueMedicamento from "./estoque-medicamento.model";
import type Usuario from "./usuario.model";
import type UsuarioEmpresa from "./usuario-empresa.model";

class Empresa extends Model<
  InferAttributes<Empresa>,
  InferCreationAttributes<Empresa>
> {
  declare id: CreationOptional<number>;
  declare cnpj: string;
  declare senhaHash: string;
  declare razaoSocial: string;
  declare ativo: CreationOptional<boolean>;

  declare enderecos?: NonAttribute<EnderecoEmpresa[]>;
  declare usuariosEmpresas?: NonAttribute<UsuarioEmpresa[]>;
  declare usuarios?: NonAttribute<Usuario[]>;
  declare estoquesMedicamentos?: NonAttribute<EstoqueMedicamento[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Empresa.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
    },
    senhaHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "senha_hash",
    },
    razaoSocial: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "razao_social",
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
    tableName: "empresa",
    freezeTableName: true,
    timestamps: true,
  },
);

export default Empresa;
