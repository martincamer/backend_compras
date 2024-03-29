import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/compras.middleware.js";
import {
  actualizarOrdenFinal,
  crearOrdenFinal,
  eliminarOrdenFinal,
  getOrdenFinal,
  getOrdenesFinal,
  getOrdenesFinalMensual,
} from "../controllers/ordenesfinal.controllers.js";

const router = Router();

router.get("/ordenes-dos", isAuth, isAdmin, getOrdenesFinal);

router.get("/ordenes-dos-mensual", isAuth, isAdmin, getOrdenesFinalMensual);

router.get("/orden-dos/:id", isAuth, isAdmin, getOrdenFinal);

router.put("/editar-orden-dos/:id", isAuth, isAdmin, actualizarOrdenFinal);

router.delete("/eliminar-orden-dos/:id", isAuth, isAdmin, eliminarOrdenFinal);

router.post("/crear-orden-nueva-dos", isAuth, isAdmin, crearOrdenFinal);

export default router;
