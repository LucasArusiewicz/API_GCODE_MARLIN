const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

class SerialConnection {
  // Estancia conexao com arduino
  constructor(pathDevice, configConnection, timeout) {
    this.port = new SerialPort(pathDevice, configConnection);
    this.parser = new Readline();

    this.port.pipe(this.parser);
    this.parser.on("data", line => console.log(`> ${line}`));
  }

  // Executa "sleep" conforme tempo fornecido para aguardar o carregando do codigo no arduino
  async startConnection(timeout) {
    await new Promise(resolve => setTimeout(resolve, timeout));
    this.sendGcode("M121");
    console.log("Conexão estabelecida !");
  }

  sendGcode(data) {
    console.log(`GCODE[${data}]`);
    this.port.write(`${data}\n`);
  }
}

const InitializeConnection = async function(Connection, timeout) {
  await Connection.startConnection(timeout);
};

module.exports = { SerialConnection, InitializeConnection };
