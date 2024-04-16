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
  getCategoria,
  eliminarCategoria,
  actualizarPrecioProducto,
} from "../controllers/productos.controllers.js";
import { isAdmin } from "../middlewares/compras.middleware.js";

const router = Router();

router.get("/productos", isAuth, isAdmin, getProductos);

router.get("/productos-mes", isAuth, isAdmin, getProductosMensuales);

router.get("/categorias", isAuth, isAdmin, getCategorias);

router.post("/crear-categoria", isAuth, isAdmin, crearCategorias);

router.put("/editar-categoria/:id", isAuth, isAdmin, actualizarCategorias);

router.get("/categoria/:id", isAuth, isAdmin, getCategoria);

router.delete("/eliminar-categoria/:id", isAuth, isAdmin, eliminarCategoria);

router.post(
  "/productos/rango-fechas",
  isAuth,
  isAdmin,
  getProductosPorRangoDeFechas
);

router.get("/producto/:id", isAuth, isAdmin, getProducto);

router.post("/crear-producto", isAuth, isAdmin, crearProducto);

router.put("/editar-producto/:id", isAuth, isAdmin, actualizarProducto);

router.put(
  "/editar-producto/precio/:id",
  isAuth,
  isAdmin,
  actualizarPrecioProducto
);

router.put(
  "/editar-producto/precio-detalle/:detalle",
  isAuth,
  isAdmin,
  actualizarPrecioProducto
);

router.delete("/eliminar-producto/:id", isAuth, isAdmin, eliminarProducto);

router.post(
  "/productos-rango-fechas",
  isAuth,
  isAdmin,
  getProductosPorRangoDeFechas
);

export default router;
