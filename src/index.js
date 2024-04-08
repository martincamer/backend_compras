// Importa el servidor de Express desde tu archivo app.js
import app from "./app.js";
import { ORIGIN, PORT } from "./config.js";

// Importa createServer y Server de http y socket.io respectivamente
import { createServer } from "http";
import { Server } from "socket.io";

// Crea el servidor HTTP utilizando Express
const httpServer = createServer(app);

// app.use(express.static(resolve("frontend/dist")));

// Crea el servidor de Socket.io y adjúntalo al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

// Maneja eventos de Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Maneja el evento "nueva-salida"
  socket.on("crear-producto", (datosSalida) => {
    console.log("Nuevo producto:", datosSalida);
    io.emit("crear-producto", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("editar-producto", (editarSalida) => {
    console.log("Editar producto:", editarSalida);
    io.emit("editar-producto", editarSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  // Maneja el evento "nueva-salida"
  socket.on("nuevo-producto", (datosSalida) => {
    console.log("Nuevo productos:", datosSalida);
    io.emit("nuevo-producto", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("nueva-categoria", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("nueva-categoria", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("editar-categoria", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("editar-categoria", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("eliminar-categoria", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("eliminar-categoria", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("eliminar-producto", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("eliminar-producto", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("crear-orden", (datosSalida) => {
    console.log("Nuevo orden dos:", datosSalida);
    io.emit("crear-orden", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("crear-orden-dos", (datosSalida) => {
    console.log("Nuevo orden dos:", datosSalida);
    io.emit("crear-orden-dos", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("eliminar-orden", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("eliminar-orden", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("nuevo-proveedor", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("nuevo-proveedor", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("editar-proveedor", (datosSalida) => {
    console.log("Nuevo categoria:", datosSalida);
    io.emit("editar-proveedor", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
