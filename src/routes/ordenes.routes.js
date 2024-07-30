import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/compras.middleware.js";
import {
  actualizarOrdenEstado,
  crearOrden,
  editarProductoOrden,
  editarProductoUnico,
  eliminarOrden,
  eliminarProductoOrden,
  getOrden,
  getOrdenes,
  getOrdenesMensual,
  getOrdenesMensualAdmin,
  getOrdenesPorRangoDeFechas,
  getOrdenesPorRangoDeFechasAdmin,
  guardarOrden,
  obtenerProductoOrden,
  obtenerValorUnico,
} from "../controllers/ordenes.controllers.js";

const router = Router();

router.get("/ordenes", isAuth, getOrdenes);

router.get("/ordenes-mensuales", isAuth, getOrdenesMensual);

router.get("/ordenes-mensuales-admin", isAuth, getOrdenesMensualAdmin);

router.get("/orden/:id", isAuth, isAdmin, getOrden);

router.put("/editar-orden/:id", isAuth, isAdmin, guardarOrden);

router.delete("/eliminar-orden/:id", isAuth, isAdmin, eliminarOrden);

router.post("/crear-orden-nueva", isAuth, isAdmin, crearOrden);

router.get("/orden-unico/:id", isAuth, isAdmin, obtenerValorUnico);

router.put("/editar-producto-orden/:id", isAuth, isAdmin, editarProductoUnico);

router.get("/orden/:idOrden/producto/:idProducto", obtenerProductoOrden);

router.put("/orden/:idOrden/producto/:idProducto", editarProductoOrden);

router.put("/orden/estado/:id", isAuth, isAdmin, actualizarOrdenEstado);

router.delete("/orden/:idOrden/producto/:idProducto", eliminarProductoOrden);

router.post(
  "/ordenes-rango-fechas",
  isAuth,
  isAdmin,
  getOrdenesPorRangoDeFechas
);

router.post(
  "/ordenes-rango-fechas-admin",
  isAuth,
  isAdmin,
  getOrdenesPorRangoDeFechasAdmin
);

export default router;
