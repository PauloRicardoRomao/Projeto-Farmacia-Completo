import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  DataTypes,
} from "sequelize";

import sequelize from "../config/config";
import type Usuario from "./usuario.model";
import type Empresa from "./empresa.model";
import type ReceitaMedicamento from "./receita-medicamento.model";

import type Imagem from "./imagem.model";

class ReceitaUsuario extends Model<
  InferAttributes<ReceitaUsuario>,
  InferCreationAttributes<ReceitaUsuario>
> {
  declare id: CreationOptional<number>;
  declare usuarioId: ForeignKey<Usuario["id"]>;
  declare empresaId: CreationOptional<ForeignKey<Empresa["id"]> | null>;
  declare status: CreationOptional<"pendente" | "aprovada" | "rejeitada" | "dispensada">;
  declare crmMedico: CreationOptional<string | null>;
  declare dataEmissao: Date;
  declare dataVencimento: CreationOptional<Date | null>;
  declare observacao: CreationOptional<string | null>;
  declare ativo: CreationOptional<boolean>;

  declare usuario?: NonAttribute<Usuario>;
  declare empresa?: NonAttribute<Empresa>;
  declare receitasMedicamentos?: NonAttribute<ReceitaMedicamento[]>;
  declare imagens?: NonAttribute<Imagem[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ReceitaUsuario.init(
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
      allowNull: true,
      field: "empresa_id",
      references: {
        model: "empresa",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovada", "rejeitada", "dispensada"),
      allowNull: false,
      defaultValue: "pendente",
    },
    crmMedico: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: "crm_medico",
    },
    dataEmissao: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "data_emissao",
    },
    dataVencimento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "data_vencimento",
    },
    observacao: {
      type: DataTypes.STRING(200),
      allowNull: true,
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
    tableName: "receita_usuario",
    freezeTableName: true,
    timestamps: true,
  },
);

export default ReceitaUsuario;
