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

app.use("/demo", (req, res, next) => {
  console.log("demo");
  Connection.sendGcode("G1 X100.00 Y80.00 Z60.00");
  Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  Connection.sendGcode("G1 X10.00 Y10.00");
  Connection.sendGcode("G1 Y0.00 Z50.00");
  Connection.sendGcode("G1 X80.00 Z0.00");
  Connection.sendGcode("G1 X0.00");
  Connection.sendGcode("G1 X5.00 Y5.00 Z5.00");
  Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  Connection.sendGcode("G1 X5.00 Y10.00 Z5.00");
  Connection.sendGcode("G1 X0.00 Y20.00 Z0.00");
  Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");

  for (let i = 0; i < 3; i++) {
    Connection.sendGcode("G1 X2.00 Y2.00 Z2.00");
    Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  }

  for (let i = 0; i < 10; i++) {
    Connection.sendGcode("G1 X0.10 Y0.10 Z0.10");
    Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  }

  for (let i = 0; i < 5; i++) {
    Connection.sendGcode("G1 X1.00 Y1.00 Z1.00");
    Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  }

  for (let i = 0; i < 10; i++) {
    Connection.sendGcode("G1 X0.50 Y0.50 Z0.50");
    Connection.sendGcode("G1 X0.00 Y0.00 Z0.00");
  }

  // Retorna resposta
  res.status(200);
  res.json({});
});

app.use("/exec", (req, res, next) => {
  Connection.sendGcode(req.body.data.start);
  if (req.body.data.end) {
    Connection.sendGcode(req.body.data.end);
  }

  // Retorna resposta
  res.status(200);
  res.json({});
});

// Define Rotas para atender requisicoes
app.use("/", (req, res, next) => {
  // Estancia Novo Comando
  let command = new Commands(Connection);
  command.push(req.body.data);
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
