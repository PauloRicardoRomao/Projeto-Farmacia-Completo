import "dotenv/config";

import bcrypt from "bcrypt";
import sequelize from "./config";
import {
  ClasseFarmacologicaMedicamento,
  Doacao,
  Empresa,
  EnderecoEmpresa,
  EstoqueMedicamento,
  FormaFarmacoMedicamento,
  Medicamento,
  MedicamentoDoacao,
  MedicamentoFormaFarmaco,
  MedicamentoUsoTerapeutico,
  ReceitaMedicamento,
  ReceitaUsuario,
  TarjaMedicamento,
  TriagemDoacao,
  UsoTerapeuticoMedicamento,
  Usuario,
  UsuarioEmpresa,
} from "../models";

async function seed() {
  const reset = process.argv.includes("--reset");

  await sequelize.authenticate();
  await sequelize.sync({ force: reset, alter: !reset });

  const senhaHash = await bcrypt.hash("123456", 10);

  const [empresa1] = await Empresa.findOrCreate({
    where: { cnpj: "12345678000195" },
    defaults: {
      cnpj: "12345678000195",
      senhaHash,
      razaoSocial: "Drogaria Sao Lucas LTDA",
      ativo: true,
    },
  });

  const [empresa2] = await Empresa.findOrCreate({
    where: { cnpj: "98765432000110" },
    defaults: {
      cnpj: "98765432000110",
      senhaHash,
      razaoSocial: "Farmacia Vida Plena SA",
      ativo: true,
    },
  });

  await EnderecoEmpresa.findOrCreate({
    where: { empresaId: empresa1.id, endereco: "Rua das Flores", numero: 120 },
    defaults: {
      empresaId: empresa1.id,
      endereco: "Rua das Flores",
      bairro: "Centro",
      numero: 120,
      cidade: "Sao Paulo",
      estado: "SP",
      ativo: true,
    },
  });

  await EnderecoEmpresa.findOrCreate({
    where: { empresaId: empresa2.id, endereco: "Avenida Brasil", numero: 455 },
    defaults: {
      empresaId: empresa2.id,
      endereco: "Avenida Brasil",
      bairro: "Jardim America",
      numero: 455,
      cidade: "Campinas",
      estado: "SP",
      ativo: true,
    },
  });

  const [usuarioAdmin] = await Usuario.findOrCreate({
    where: { email: "admin@farmacia.com" },
    defaults: {
      nome: "Ana Oliveira",
      email: "admin@farmacia.com",
      cpf: "12345678901",
      senhaHash,
      ativo: true,
    },
  });

  const [usuarioPaciente] = await Usuario.findOrCreate({
    where: { email: "usuario@farmacia.com" },
    defaults: {
      nome: "Joao Silva",
      email: "usuario@farmacia.com",
      cpf: "11122233344",
      senhaHash,
      ativo: true,
    },
  });

  await UsuarioEmpresa.findOrCreate({
    where: { usuarioId: usuarioAdmin.id, empresaId: empresa1.id },
    defaults: {
      usuarioId: usuarioAdmin.id,
      empresaId: empresa1.id,
      tipo: "admin",
      ativo: true,
    },
  });

  const formasSeed = [
    { forma: "Comprimido", embalagem: "Cartela com 10 comprimidos" },
    { forma: "Capsula", embalagem: "Blister com 12 capsulas" },
    { forma: "Solucao oral", embalagem: "Frasco 100 ml" },
    { forma: "Xarope", embalagem: "Frasco 120 ml" },
    { forma: "Pomada", embalagem: "Bisnaga 30 g" },
  ];

  const formas: Record<string, FormaFarmacoMedicamento> = {};

  for (const forma of formasSeed) {
    const [registro] = await FormaFarmacoMedicamento.findOrCreate({
      where: { forma: forma.forma, embalagem: forma.embalagem },
      defaults: { ...forma, ativo: true },
    });

    formas[forma.forma] = registro;
  }

  const [semTarja] = await TarjaMedicamento.findOrCreate({
    where: { cor: "Sem tarja" },
    defaults: {
      cor: "Sem tarja",
      descricao: "Venda livre, sem exigencia de receita.",
      ativo: true,
    },
  });

  const [tarjaVermelha] = await TarjaMedicamento.findOrCreate({
    where: { cor: "Tarja vermelha" },
    defaults: {
      cor: "Tarja vermelha",
      descricao: "Venda mediante apresentacao de receita.",
      ativo: true,
    },
  });

  const [tarjaPreta] = await TarjaMedicamento.findOrCreate({
    where: { cor: "Tarja preta" },
    defaults: {
      cor: "Tarja preta",
      descricao: "Controle especial, com retencao de receita.",
      ativo: true,
    },
  });

  const classeSeed = [
    "Analgesico",
    "Antiinflamatorio",
    "Antibiotico",
    "Antialergico",
    "Antihipertensivo",
    "Ansiolitico",
  ];

  const classes: Record<string, ClasseFarmacologicaMedicamento> = {};

  for (const classe of classeSeed) {
    const [registro] = await ClasseFarmacologicaMedicamento.findOrCreate({
      where: { classe },
      defaults: { classe, ativo: true },
    });

    classes[classe] = registro;
  }

  const medicamentosSeed = [
    {
      nome: "Dipirona",
      descricao: "Analgesico e antitermico indicado para dor e febre.",
      classeId: classes.Analgesico.id,
      tarjaId: semTarja.id,
      forma: "Comprimido",
    },
    {
      nome: "Paracetamol",
      descricao: "Analgesico e antitermico usado no alivio de dores leves.",
      classeId: classes.Analgesico.id,
      tarjaId: semTarja.id,
      forma: "Comprimido",
    },
    {
      nome: "Ibuprofeno",
      descricao: "Antiinflamatorio nao esteroidal usado para dor e inflamacao.",
      classeId: classes.Antiinflamatorio.id,
      tarjaId: tarjaVermelha.id,
      forma: "Capsula",
    },
    {
      nome: "Amoxicilina",
      descricao: "Antibiotico usado em infeccoes bacterianas.",
      classeId: classes.Antibiotico.id,
      tarjaId: tarjaVermelha.id,
      forma: "Capsula",
    },
    {
      nome: "Loratadina",
      descricao: "Antialergico usado para sintomas de rinite e urticaria.",
      classeId: classes.Antialergico.id,
      tarjaId: semTarja.id,
      forma: "Comprimido",
    },
    {
      nome: "Losartana",
      descricao: "Antihipertensivo usado no controle da pressao arterial.",
      classeId: classes.Antihipertensivo.id,
      tarjaId: tarjaVermelha.id,
      forma: "Comprimido",
    },
    {
      nome: "Diazepam",
      descricao: "Ansiolitico benzodiazepinico sujeito a controle especial.",
      classeId: classes.Ansiolitico.id,
      tarjaId: tarjaPreta.id,
      forma: "Comprimido",
    },
  ];

  const medicamentos: Record<string, Medicamento> = {};
  const medicamentosForma: Record<string, MedicamentoFormaFarmaco> = {};

  for (const item of medicamentosSeed) {
    const [medicamento] = await Medicamento.findOrCreate({
      where: { nome: item.nome },
      defaults: {
        nome: item.nome,
        descricao: item.descricao,
        classeId: item.classeId,
        tarjaId: item.tarjaId,
        ativo: true,
      },
    });

    medicamentos[item.nome] = medicamento;

    const [medicamentoForma] = await MedicamentoFormaFarmaco.findOrCreate({
      where: {
        medicamentoId: medicamento.id,
        formaFarmacoId: formas[item.forma].id,
      },
      defaults: {
        medicamentoId: medicamento.id,
        formaFarmacoId: formas[item.forma].id,
        ativo: true,
      },
    });

    medicamentosForma[item.nome] = medicamentoForma;
  }

  const usoSeed = [
    {
      propriedadeTerapeutica: "Dor e febre",
      descricao: "Auxilia no alivio de dores e na reducao da febre.",
      medicamentos: ["Dipirona", "Paracetamol", "Ibuprofeno"],
    },
    {
      propriedadeTerapeutica: "Infeccao bacteriana",
      descricao: "Tratamento de infeccoes causadas por bacterias.",
      medicamentos: ["Amoxicilina"],
    },
    {
      propriedadeTerapeutica: "Alergia",
      descricao: "Controle de sintomas alergicos.",
      medicamentos: ["Loratadina"],
    },
    {
      propriedadeTerapeutica: "Hipertensao",
      descricao: "Controle da pressao arterial.",
      medicamentos: ["Losartana"],
    },
    {
      propriedadeTerapeutica: "Ansiedade",
      descricao: "Tratamento de sintomas ansiosos.",
      medicamentos: ["Diazepam"],
    },
  ];

  for (const uso of usoSeed) {
    const [usoRegistro] = await UsoTerapeuticoMedicamento.findOrCreate({
      where: { propriedadeTerapeutica: uso.propriedadeTerapeutica },
      defaults: {
        propriedadeTerapeutica: uso.propriedadeTerapeutica,
        descricao: uso.descricao,
        ativo: true,
      },
    });

    for (const medicamentoNome of uso.medicamentos) {
      await MedicamentoUsoTerapeutico.findOrCreate({
        where: {
          medicamentoId: medicamentos[medicamentoNome].id,
          usoTerapeuticoId: usoRegistro.id,
        },
        defaults: {
          medicamentoId: medicamentos[medicamentoNome].id,
          usoTerapeuticoId: usoRegistro.id,
          ativo: true,
        },
      });
    }
  }

  const estoqueSeed = [
    { medicamento: "Dipirona", quantidadeAtual: 12, quantidadeMinima: 3 },
    { medicamento: "Paracetamol", quantidadeAtual: 8, quantidadeMinima: 2 },
    { medicamento: "Ibuprofeno", quantidadeAtual: 4, quantidadeMinima: 2 },
  ];

  for (const item of estoqueSeed) {
    const medicamentoFormaFarmacoId = medicamentosForma[item.medicamento].id;
    const [estoque] = await EstoqueMedicamento.findOrCreate({
      where: {
        empresaId: empresa1.id,
        medicamentoFormaFarmacoId,
      },
      defaults: {
        empresaId: empresa1.id,
        medicamentoFormaFarmacoId,
        quantidadeAtual: item.quantidadeAtual,
        quantidadeMinima: item.quantidadeMinima,
        ativo: true,
      },
    });

    await estoque.update({
      quantidadeAtual: item.quantidadeAtual,
      quantidadeMinima: item.quantidadeMinima,
      ativo: true,
    });
  }

  const [receitaDemo] = await ReceitaUsuario.findOrCreate({
    where: { usuarioId: usuarioPaciente.id, crmMedico: "123456/SP" },
    defaults: {
      usuarioId: usuarioPaciente.id,
      empresaId: null,
      status: "pendente",
      crmMedico: "123456/SP",
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      observacao: "Receita demo para apresentacao: Dipirona 1 unidade.",
      ativo: true,
    },
  });

  await ReceitaMedicamento.findOrCreate({
    where: {
      receitaUsuarioId: receitaDemo.id,
      medicamentoFormaFarmacoId: medicamentosForma.Dipirona.id,
    },
    defaults: {
      receitaUsuarioId: receitaDemo.id,
      medicamentoFormaFarmacoId: medicamentosForma.Dipirona.id,
      quantidade: 1,
      posologia: "Tomar conforme orientacao medica.",
      continuo: false,
      ativo: true,
    },
  });

  const [doacaoDemo] = await Doacao.findOrCreate({
    where: { cpf: usuarioPaciente.cpf ?? "11122233344" },
    defaults: {
      cpf: usuarioPaciente.cpf ?? "11122233344",
      ativo: true,
    },
  });

  const [medicamentoDoacao] = await MedicamentoDoacao.findOrCreate({
    where: {
      doacaoId: doacaoDemo.id,
      nomeMedicamento: "Paracetamol",
    },
    defaults: {
      doacaoId: doacaoDemo.id,
      medicamentoFormaFarmacoId: medicamentosForma.Paracetamol.id,
      nomeMedicamento: "Paracetamol",
      descricaoMedicamento: "Doacao demo para triagem e entrada em estoque.",
      quantidade: 3,
      ativo: true,
    },
  });

  await TriagemDoacao.findOrCreate({
    where: { medicamentoDoacaoId: medicamentoDoacao.id },
    defaults: {
      medicamentoDoacaoId: medicamentoDoacao.id,
      validade: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      status: "pendente",
      aprovado: false,
      ativo: true,
    },
  });

  console.log("Seeds executados com sucesso.");
  console.log("Usuario: usuario@farmacia.com / 123456");
  console.log("Empresa: 12345678000195 / 123456");
}

seed()
  .catch((error) => {
    console.error("Erro ao executar seeds:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
