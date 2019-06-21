// Carrega modulos
const http = require("http");
const app = require("./app");

// Define porta
const porta = process.env.PORT || 3000;

// Incializa o servidor
const server = http.createServer(app).listen(porta);
