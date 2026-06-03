import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import sequelize from "../config/config";
import type Empresa from "./empresa.model";
import type UsuarioEmpresa from "./usuario-empresa.model";
import type ReceitaUsuario from "./receita-usuario.model";

import type Imagem from "./imagem.model";

class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: CreationOptional<number>;
  declare nome: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  declare cpf: CreationOptional<string | null>;
  declare senhaHash: string;
  declare ativo: CreationOptional<boolean>;

  declare usuariosEmpresas?: NonAttribute<UsuarioEmpresa[]>;
  declare empresas?: NonAttribute<Empresa[]>;
  declare receitasUsuarios?: NonAttribute<ReceitaUsuario[]>;
  declare imagens?: NonAttribute<Imagem[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },
    senhaHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "senha_hash",
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
    tableName: "usuario",
    timestamps: true,
    freezeTableName: true,
  },
);

export default Usuario;
