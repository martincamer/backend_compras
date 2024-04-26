import { pool } from "../db.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../config/multerConfig.js";
import multer from "multer";

export const getProveedores = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM proveedor");
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProveedor = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proveedor WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún proveedores con ese id",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const crearProveedor = async (req, res, next) => {
  const { proveedor, total, localidad, provincia } = req.body;

  try {
    // Verifica si total está definido, de lo contrario, asigna un valor vacío//
    const totalValue = total !== undefined ? total : 0;

    const result = await pool.query(
      "INSERT INTO proveedor (proveedor, total,localidad, provincia) VALUES ($1, $2, $3, $4) RETURNING *",
      [proveedor, totalValue, localidad, provincia]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    next(error);
  }
};

export const actualizarProveedor = async (req, res) => {
  const id = req.params.id;

  const { proveedor, total } = req.body;

  try {
    const result = await pool.query(
      "UPDATE proveedor SET proveedor = $1, total = $2 WHERE id = $3",
      [proveedor, total, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un proveedores con ese id",
      });
    }

    return res.json({
      message: "Proveedor actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar proveedores:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const actualizarTotalProveedor = async (req, res) => {
  const id = req.params.id;

  const { total } = req.body;

  try {
    const result = await pool.query(
      "UPDATE proveedor SET total = $1 WHERE id = $2",
      [total, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un proveedor con ese id",
      });
    }

    return res.json({
      message: "Total del proveedor actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar el total del proveedor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const eliminarProveedor = async (req, res) => {
  const result = await pool.query("DELETE FROM proveedor WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún proveedores con ese id",
    });
  }

  return res.sendStatus(204);
};

export const actualizarProveedorCompra = async (req, res) => {
  const { proveedor, total } = req.body; // Obtener el proveedor y el total de la orden de compra

  try {
    // Obtener el total actual del proveedor asociado con el nombre del proveedor de la orden de compra
    const resultProveedor = await pool.query(
      "SELECT total FROM proveedor WHERE proveedor = $1",
      [proveedor]
    );

    // Verificar si se encontró el proveedor
    if (resultProveedor.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un proveedor con ese nombre",
      });
    }

    // Obtener el total actual del proveedor
    const totalActualProveedor = resultProveedor.rows[0].total;

    // Calcular el nuevo total sumando el total de la orden de compra al total actual del proveedor
    const nuevoTotalProveedor = Number(totalActualProveedor) + Number(total);

    // Actualizar el campo total del proveedor con el nuevo total calculado
    const resultUpdate = await pool.query(
      "UPDATE proveedor SET total = $1 WHERE proveedor = $2",
      [nuevoTotalProveedor, proveedor]
    );

    // Verificar si se actualizó correctamente el proveedor
    if (resultUpdate.rowCount === 0) {
      return res.status(404).json({
        message: "No se pudo actualizar el proveedor",
      });
    }

    return res.json({
      message: "Proveedor actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const agregarComprobante = async (req, res, next) => {
  const { proveedor, params, total, imagen } = req.body;

  try {
    // Insertar el comprobante en la base de datos con la URL de la imagen
    const queryResult = await pool.query(
      "INSERT INTO comprobantes (proveedor, params, total, imagen) VALUES ($1, $2, $3, $4) RETURNING *",
      [proveedor, params, total, imagen]
    );

    // Restar el total del comprobante del total del proveedor
    await pool.query("UPDATE proveedor SET total = total - $1 WHERE id = $2", [
      total,
      params,
    ]);

    res.json(queryResult.rows[0]);
    // });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    next(error);
  }
};

export const getComprobantes = async (req, res, next) => {
  const { params } = req.query;

  try {
    let query = "SELECT * FROM comprobantes";

    // Si se proporciona el parámetro "params", agregar filtro a la consulta
    if (params) {
      query += " WHERE params = $1";
      const result = await pool.query(query, [params]);
      return res.json(result.rows);
    } else {
      const result = await pool.query(query);
      return res.json(result.rows);
    }
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getComprobante = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comprobantes WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún comprobantes con ese id",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getComprobantesMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comprobantes WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
