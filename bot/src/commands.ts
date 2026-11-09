/** Menu de comandos que Telegram muestra al escribir "/". */
export const COMMANDS = [
  { command: "nota", description: "Poner nota a una cerveza (buscándola por nombre)" },
  { command: "sinnota", description: "Puntuar las cervezas que aún no tienen nota" },
  { command: "foto", description: "Cambiar la foto de una cerveza" },
  { command: "sinfoto", description: "Ver las cervezas sin foto" },
  { command: "cancelar", description: "Cancelar lo que estaba haciendo" },
  { command: "ayuda", description: "Cómo funciona el bot" },
] as const;
