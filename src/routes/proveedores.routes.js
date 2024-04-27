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
  getComprobantes,
  getComprobante,
  actualizarTotalProveedor,
  getComprobantesMensual,
  getComprobantesDelDia,
  getProveedoresAdmin,
  getComprobantesMensualAdmin,
} from "../controllers/proveedores.controllers.js";
import { isAdmin } from "../middlewares/compras.middleware.js";

const router = Router();

router.get("/proveedores", isAuth, isAdmin, getProveedores);

router.get("/proveedores-admin", isAuth, isAdmin, getProveedoresAdmin);

router.get("/proveedor/:id", isAuth, isAdmin, getProveedor);

router.post("/crear-proveedor", isAuth, isAdmin, crearProveedor);

router.put("/editar-proveedor/:id", isAuth, isAdmin, actualizarProveedor);

router.put("/actualizar-proveedor-compra", isAuth, actualizarProveedorCompra);

router.delete("/eliminar-proveedor/:id", isAuth, isAdmin, eliminarProveedor);

router.post("/crear-comprobante", isAuth, agregarComprobante);

router.get("/comprobantes", isAuth, getComprobantes);

router.get("/comprobantes-mes", isAuth, getComprobantesMensual);

router.get("/comprobantes-mes-admin", isAuth, getComprobantesMensualAdmin);

router.get("/comprobantes-dia", isAuth, getComprobantesDelDia);

router.get("/comprobantes/:id", isAuth, isAdmin, getComprobante);

router.put("/proveedores/:id/total", isAuth, actualizarTotalProveedor);

export default router;
