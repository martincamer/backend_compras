import { pool } from "../db.js";

///////////////////ADMIN/////////////////////

////////////////////////////////////////////

export const getProductos = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM producto WHERE user_id = $1", [
    req.userId,
  ]);
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
  const { detalle, categoria, precio_und } = req.body;
  const { username, userRole } = req;

  try {
    // Insertar el nuevo producto en la base de datos
    const result = await pool.query(
      "INSERT INTO producto (detalle, categoria, precio_und, usuario, role_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [detalle, categoria, precio_und, username, userRole, req.userId]
    );

    // // Obtener todos los productos después de la inserción
    // const selectQuery = `
    //   SELECT *
    //   FROM producto`;

    // const selectResult = await pool.query(selectQuery);

    // // Devolver todos los productos en formato JSON
    // res.json(selectResult.rows);

    const selectQuery = `
      SELECT *
      FROM producto
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un producto con ese id",
      });
    }
    next(error);
  }
};

// export const actualizarProducto = async (req, res) => {
//   const id = req.params.id;

//   const { username, userRole } = req;

//   const { detalle, categoria, precio_und } = req.body;

//   const result = await pool.query(
//     "UPDATE producto SET detalle = $1, categoria = $2, precio_und = $3, usuario = $4, role_id = $5 WHERE id = $6",
//     [detalle, categoria, precio_und, username, userRole, id]
//   );

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe un producto con ese id",
//     });
//   }

//   return res.json({
//     message: "Producto actualizado",
//   });
// };

export const actualizarProducto = async (req, res) => {
  const id = req.params.id;
  const { username, userRole } = req;
  const { detalle, categoria, precio_und } = req.body;

  try {
    // Actualizar el producto en la base de datos
    const result = await pool.query(
      "UPDATE producto SET detalle = $1, categoria = $2, precio_und = $3, usuario = $4, role_id = $5 WHERE id = $6",
      [detalle, categoria, precio_und, username, userRole, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un producto con ese id",
      });
    }

    const selectQuery = `
      SELECT *
      FROM producto
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const actualizarPrecioProducto = async (req, res) => {
  let result;
  const { id, detalle } = req.params;
  const { precio_und } = req.body;

  console.log(detalle);

  if (id) {
    // Actualizar precio por ID
    result = await pool.query(
      "UPDATE producto SET precio_und = $1 WHERE id = $2",
      [precio_und, id]
    );
  } else if (detalle) {
    // Actualizar precio por detalle
    result = await pool.query(
      "UPDATE producto SET precio_und = $1 WHERE detalle = $2",
      [precio_und, detalle]
    );
  } else {
    return res.status(400).json({
      message:
        "Se requiere un ID o un detalle para actualizar el precio del producto",
    });
  }

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No se encontró ningún producto para actualizar el precio",
    });
  }

  const selectQuery = `
      SELECT *
      FROM producto
      WHERE user_id = $1`;

  const selectResult = await pool.query(selectQuery, [req.userId]);

  // Devolver todas las órdenes como respuesta
  return res.json(selectResult.rows);
};

export const eliminarProducto = async (req, res) => {
  try {
    // Eliminar el producto según el id proporcionado en los parámetros de la solicitud
    const deleteResult = await pool.query(
      "DELETE FROM producto WHERE id = $1",
      [req.params.id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún producto con ese id",
      });
    }

    const selectQuery = `
      SELECT *
      FROM producto
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
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
  //obtener perfiles
  const result = await pool.query(
    "SELECT * FROM categorias WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

export const crearCategorias = async (req, res, next) => {
  const { detalle } = req.body;
  const { username, userRole } = req;

  try {
    // Insertar la nueva categoría en la base de datos
    const result = await pool.query(
      "INSERT INTO categorias (detalle, usuario, role_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [detalle, username, userRole, req.userId]
    );

    // Obtener todas las categorías después de la inserción
    const selectQuery = `
      SELECT *
      FROM categorias`;

    const selectResult = await pool.query(selectQuery);

    // Devolver todas las categorías en formato JSON
    res.json(selectResult.rows);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese detalle",
      });
    }
    next(error); // Pasar el error al middleware de manejo de errores global
  }
};

export const actualizarCategorias = async (req, res) => {
  const id = req.params.id;
  const { username, userRole } = req;
  const { detalle } = req.body;

  try {
    // Actualizar la categoría en la base de datos
    const result = await pool.query(
      "UPDATE categorias SET detalle = $1, usuario = $2, role_id = $3 WHERE id = $4",
      [detalle, username, userRole, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe una categoría con ese id",
      });
    }

    // Obtener todas las categorías después de la actualización
    const selectQuery = `
      SELECT *
      FROM categorias`;

    const selectResult = await pool.query(selectQuery);

    // Devolver todas las categorías en formato JSON
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getCategoria = async (req, res) => {
  const result = await pool.query("SELECT * FROM categorias WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún categorias con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const eliminarCategoria = async (req, res) => {
  try {
    // Eliminar la categoría según el id proporcionado en los parámetros de la solicitud
    const deleteResult = await pool.query(
      "DELETE FROM categorias WHERE id = $1",
      [req.params.id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna categoría con ese id",
      });
    }

    // Obtener todas las categorías restantes después de la eliminación
    const selectQuery = `
      SELECT *
      FROM categorias`;

    const selectResult = await pool.query(selectQuery);

    // Devolver todas las categorías en formato JSON
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
