import { pool } from "../db.js";

export const getProductos = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM producto");
  return res.json(result.rows);
};

export const getProducto = async (req, res) => {
  const result = await pool.query("SELECT * FROM producto WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún producto con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearProducto = async (req, res, next) => {
  const { producto } = req.body;

  const { username, userRole } = req;

  try {
    const result = await pool.query(
      "INSERT INTO producto (producto,usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [producto, username, userRole]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un producto con ese id",
      });
    }
    next(error);
  }
};

export const actualizarProducto = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const { producto } = req.body;

  const result = await pool.query(
    "UPDATE producto = $1, usuario = $2, role_id = $3 WHERE id = $4",
    [producto, username, userRole, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un producto con ese id",
    });
  }

  return res.json({
    message: "Producto actualizado",
  });
};

export const eliminarProducto = async (req, res) => {
  const result = await pool.query("DELETE FROM producto WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún producto con ese id",
    });
  }

  return res.sendStatus(204);
};

export const getProductosMensuales = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM producto WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProductosPorRangoDeFechas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    // Validación de fechas
    if (
      !fechaInicio ||
      !fechaFin ||
      !isValidDate(fechaInicio) ||
      !isValidDate(fechaFin)
    ) {
      return res.status(400).json({ message: "Fechas inválidas" });
    }

    // Función de validación de fecha
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return dateString.match(regex) !== null;
    }

    // Ajuste de zona horaria UTC
    const result = await pool.query(
      "SELECT * FROM producto WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getCategorias = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM categorias");
  return res.json(result.rows);
};

export const crearCategorias = async (req, res, next) => {
  const { detalle } = req.body;

  const { username, userRole } = req;

  try {
    const result = await pool.query(
      "INSERT INTO categorias (detalle,usuario, role_id) VALUES ($1, $2, $3) RETURNING *",
      [detalle, username, userRole]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un producto con ese id",
      });
    }
    next(error);
  }
};

export const actualizarCategorias = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const { detalle } = req.body;

  const result = await pool.query(
    "UPDATE categorias = $1, usuario = $2, role_id = $3 WHERE id = $4",
    [detalle, username, userRole, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un producto con ese id",
    });
  }

  return res.json({
    message: "Producto actualizado",
  });
};
