import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarProveedor,
  actualizarProveedorCompra,
  crearProveedor,
  eliminarProveedor,
  getProveedor,
  getProveedores,
  agregarComprobante,
} from "../controllers/proveedores.controllers.js";
import { isAdmin } from "../middlewares/compras.middleware.js";

const router = Router();

router.get("/proveedores", isAuth, isAdmin, getProveedores);

router.get("/proveedor/:id", isAuth, isAdmin, getProveedor);

router.post("/crear-proveedor", isAuth, isAdmin, crearProveedor);

router.put("/editar-proveedor/:id", isAuth, isAdmin, actualizarProveedor);

router.put("/actualizar-proveedor-compra", isAuth, actualizarProveedorCompra);

router.delete("/eliminar-proveedor/:id", isAuth, isAdmin, eliminarProveedor);

router.post("/crear-comprobante", agregarComprobante);

export default router;
