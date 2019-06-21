// Carrega dependencias
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");

const SerialConnect = require("./SerialPort").SerialConnection;
const InitializeConnection = require("./SerialPort").InitializeConnection;
const Connection = new SerialConnect("/dev/ttyUSB0", {
  baudRate: 115200
});

const Commands = require("./Commands");

// Inicia comunicacao seria com arduino
InitializeConnection(Connection, 5000);

// Define formatacao de saida no console
app.use(morgan("dev"));

// Define formas de entrada
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// Define cabecalho de forma explicita
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // Define quais metodos serao permitidos
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Define Rotas para atender requisicoes
app.use("/", (req, res, next) => {
  // Estancia Novo Comando
  let command = new Commands(Connection);
  command.push(req.body);
  let result = command.send();

  // Retorna resposta
  res.status(result.code);
  res.json(result.body);
});

// Define erro de requisicao na api
app.use((req, res, next) => {
  const error = new Error("Erro de requisição, verifique a URL.");
  error.status = 404;
  next(error);
});

// Define retorno para erros no servidor
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// Exporta modulo
module.exports = app;
