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

import type Usuario from "./usuario.model";
import type ReceitaUsuario from "./receita-usuario.model";
import type MedicamentoFormaFarmaco from "./medicamento-forma-farmaco.model";

class Imagem extends Model<
  InferAttributes<Imagem>,
  InferCreationAttributes<Imagem>
> {
  declare id: CreationOptional<number>;

  declare tipo: "perfil_usuario" | "receita_usuario" | "medicamento";

  declare usuarioId: ForeignKey<Usuario["id"]> | null;
  declare receitaUsuarioId: ForeignKey<ReceitaUsuario["id"]> | null;
  declare medicamentoFormaFarmacoId: ForeignKey<
    MedicamentoFormaFarmaco["id"]
  > | null;

  declare nomeOriginal: string;
  declare mimeType: string;
  declare tamanhoBytes: number;
  declare dados: Buffer;

  declare ativo: CreationOptional<boolean>;

  declare usuario?: NonAttribute<Usuario>;
  declare receitaUsuario?: NonAttribute<ReceitaUsuario>;
  declare medicamentoFormaFarmaco?: NonAttribute<MedicamentoFormaFarmaco>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Imagem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    tipo: {
      type: DataTypes.ENUM("perfil_usuario", "receita_usuario", "medicamento"),
      allowNull: false,
    },

    usuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "usuario_id",
      references: {
        model: "usuario",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    receitaUsuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "receita_usuario_id",
      references: {
        model: "receita_usuario",
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

    nomeOriginal: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "nome_original",
    },

    mimeType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "mime_type",
    },

    tamanhoBytes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "tamanho_bytes",
    },

    dados: {
      type: DataTypes.BLOB("long"),
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
    tableName: "imagem",
    freezeTableName: true,
    timestamps: true,
  },
);

export default Imagem;
