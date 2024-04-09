import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import ordenesRoutes from "./routes/ordenes.routes.js";
import ordenesFinalRoutes from "./routes/ordenesfinal.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { pool } from "./db.js";
import { ORIGIN } from "./config.js";
import multer from "multer";

const app = express();

// const upload = multer({ dest: "comprobantes/" }); // Configura multer con el destino adecuado

// // Ruta para manejar la subida de archivos
// app.post("/comprobantes", upload.single("imagen"), (req, res) => {
//   // El archivo subido estará disponible en req.file
//   console.log(req.file);
// });

// Middlewares
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => res.json({ message: "welcome to my API" }));
app.get("/api/ping", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
});

app.use("/api", authRoutes);
app.use("/api", productosRoutes);
app.use("/api", ordenesRoutes);
app.use("/api", ordenesFinalRoutes);
app.use("/api", proveedoresRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
