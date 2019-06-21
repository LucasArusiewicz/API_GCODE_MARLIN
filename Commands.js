class Commands {
  constructor(connection) {
    this.connection = connection;
    this.queue = [];
  }

  push(body) {
    let { command, action } = body;
    switch (command) {
      case "eixo":
        let { eixo, valor } = action;
        this.queue.push(`G1 ${eixo}${valor}.00`);
        break;
      case "garra":
        this.queue.push(action ? `G1 Z100.00` : `G1 Z0.00`);
        break;
    }
  }

  send() {
    this.queue.forEach(command => {
      this.connection.sendGcode(command);
    });
    return {
      code: 200,
      body: {
        message: "Comandos executados.",
        commands: this.queue
      }
    };
  }
}

module.exports = Commands;
