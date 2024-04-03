import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/compras.middleware.js";
import {
  actualizarOrden,
  crearOrden,
  editarProductoUnico,
  eliminarOrden,
  getOrden,
  getOrdenes,
  getOrdenesMensual,
  getOrdenesPorRangoDeFechas,
  obtenerValorUnico,
} from "../controllers/ordenes.controllers.js";

const router = Router();

router.get("/ordenes", isAuth, isAdmin, getOrdenes);

router.get("/ordenes-mensuales", isAuth, isAdmin, getOrdenesMensual);

router.get("/orden/:id", isAuth, isAdmin, getOrden);

router.put("/editar-orden/:id", isAuth, isAdmin, actualizarOrden);

router.delete("/eliminar-orden/:id", isAuth, isAdmin, eliminarOrden);

router.post("/crear-orden-nueva", isAuth, isAdmin, crearOrden);

router.get("/orden-unico/:id", isAuth, isAdmin, obtenerValorUnico);

router.put("/editar-producto-orden/:id", isAuth, isAdmin, editarProductoUnico);

router.post(
  "/ordenes-rango-fechas",
  isAuth,
  isAdmin,
  getOrdenesPorRangoDeFechas
);

export default router;
