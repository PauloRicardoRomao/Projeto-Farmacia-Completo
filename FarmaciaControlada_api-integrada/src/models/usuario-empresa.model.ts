import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";

import sequelize from "../config/config";
import type Usuario from "./usuario.model";
import type Empresa from "./empresa.model";

class UsuarioEmpresa extends Model<
  InferAttributes<UsuarioEmpresa>,
  InferCreationAttributes<UsuarioEmpresa>
> {
  declare id: CreationOptional<number>;
  declare usuarioId: ForeignKey<Usuario["id"]>;
  declare empresaId: ForeignKey<Empresa["id"]>;
  declare tipo: CreationOptional<"admin" | "funcionario">;
  declare ativo: CreationOptional<boolean>;

  declare usuario?: NonAttribute<Usuario>;
  declare empresa?: NonAttribute<Empresa>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UsuarioEmpresa.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "usuario_id",
      references: {
        model: "usuario",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    tipo: {
      type: DataTypes.ENUM("admin", "funcionario"),
      allowNull: false,
      defaultValue: "funcionario",
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
    tableName: "usuario_empresa",
    freezeTableName: true,
    timestamps: true,
  },
);

export default UsuarioEmpresa;
