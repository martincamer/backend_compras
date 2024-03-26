import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  getProducto,
  getProductosMensuales,
  getProductosPorRangoDeFechas,
  getProductos,
  getCategorias,
  crearCategorias,
  actualizarCategorias,
} from "../controllers/productos.controllers.js";
import { isAdmin } from "../middlewares/compras.middleware.js";

const router = Router();

router.get("/productos", isAuth, isAdmin, getProductos);

router.get("/productos-mes", isAuth, isAdmin, getProductosMensuales);

router.get("/categorias", isAuth, isAdmin, getCategorias);

router.post("/crear-categoria", isAuth, isAdmin, crearCategorias);

router.post("/categorias/:id", isAuth, isAdmin, actualizarCategorias);

router.post(
  "/productos/rango-fechas",
  isAuth,
  isAdmin,
  getProductosPorRangoDeFechas
);

router.get("/productos/:id", isAuth, isAdmin, getProducto);

router.post("/crear-producto", isAuth, isAdmin, crearProducto);

router.put("/productos/:id", isAuth, isAdmin, actualizarProducto);

router.delete("/productos/:id", isAuth, isAdmin, eliminarProducto);

router.post(
  "/productos-rango-fechas",
  isAuth,
  isAdmin,
  getProductosPorRangoDeFechas
);

export default router;
