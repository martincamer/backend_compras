import { pool } from "../db.js";

export const getProveedoresAdmin = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM proveedor");
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProveedores = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query(
    "SELECT * FROM proveedor WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
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
    // Verifica si total está definido, de lo contrario, asigna un valor vacío
    const totalValue = total !== undefined ? total : 0;

    const result = await pool.query(
      "INSERT INTO proveedor (proveedor, total, localidad, provincia, fabrica, localidad_usuario, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        proveedor,
        totalValue,
        localidad,
        provincia,
        req.fabrica,
        req.localidad,
        req.userId,
      ]
    );

    const selectQuery = `
      SELECT *
      FROM proveedor
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    next(error); // Pasar el error al middleware de manejo de errores global
  }
};

export const actualizarProveedor = async (req, res, next) => {
  const id = req.params.id;
  const { proveedor, localidad, provincia, total } = req.body;

  try {
    // Actualizar solo los campos 'proveedor', 'localidad' y 'provincia'
    const updateQuery = `
      UPDATE proveedor
      SET proveedor = $1, localidad = $2, provincia = $3, total = $4 WHERE id = $5`;

    await pool.query(updateQuery, [proveedor, localidad, provincia, total, id]);

    // Obtener todas las filas actualizadas de la tabla 'proveedor'
    const selectQuery = `
      SELECT *
      FROM proveedor
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    next(error); // Pasar el error al middleware de manejo de errores global
  }
};

export const actualizarTotalProveedor = async (req, res) => {
  const id = req.params.id;
  const { total } = req.body;

  try {
    // Actualizar el total del proveedor y obtener el proveedor actualizado
    const updateQuery = `
      UPDATE proveedor
      SET total = $1
      WHERE id = $2
      RETURNING *`;

    const result = await pool.query(updateQuery, [total, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un proveedor con ese id",
      });
    }

    // Obtener todos los proveedores después de la actualización
    const selectQuery = `
      SELECT *
      FROM proveedor
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todos los proveedores junto con el mensaje de éxito
    return res.json({
      proveedor: result.rows[0],
      proveedores: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al actualizar el total del proveedor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const eliminarProveedor = async (req, res) => {
  try {
    // Eliminar el proveedor según el id proporcionado en los parámetros de la solicitud
    const deleteResult = await pool.query(
      "DELETE FROM proveedor WHERE id = $1",
      [req.params.id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún proveedor con ese id",
      });
    }

    // Obtener todas las filas actualizadas de la tabla 'proveedor'
    const selectQuery = `
      SELECT *
      FROM proveedor
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
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

    // Obtener todas las filas actualizadas de la tabla 'proveedor'
    const selectQuery = `
      SELECT *
      FROM proveedor
      WHERE user_id = $1`;

    const selectResult = await pool.query(selectQuery, [req.userId]);

    // Devolver todas las órdenes como respuesta
    res.json(selectResult.rows);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const agregarComprobante = async (req, res, next) => {
  const { proveedor, params, total, imagen } = req.body;

  try {
    // Insertar el comprobante en la base de datos con la URL de la imagen
    const insertQuery = `
      INSERT INTO comprobantes (proveedor, params, total, imagen, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const queryResult = await pool.query(insertQuery, [
      proveedor,
      params,
      total,
      imagen,
      req.userId,
    ]);

    // Restar el total del comprobante del total del proveedor
    await pool.query("UPDATE proveedor SET total = total - $1 WHERE id = $2", [
      total,
      params,
    ]);

    // Obtener todas las filas de comprobantes después de la inserción
    const selectQueryComprobantes = `
        SELECT *
  FROM comprobantes
  WHERE user_id = $1`;

    const selectResultComprobantes = await pool.query(selectQueryComprobantes, [
      req.userId,
    ]);

    // Obtener todas las filas de proveedores después de la actualización
    const selectQueryProveedores = `
      SELECT *
      FROM proveedor WHERE user_id = $1`;

    const selectResultProveedores = await pool.query(selectQueryProveedores, [
      req.userId,
    ]);

    // Obtener el proveedor específico actualizado
    const selectQueryProveedorActualizado = `
      SELECT *
      FROM proveedor
      WHERE id = $1`;

    const selectResultProveedorActualizado = await pool.query(
      selectQueryProveedorActualizado,
      [params]
    );

    // Devolver todas las respuestas en una sola respuesta JSON
    res.json({
      comprobantes: selectResultComprobantes.rows,
      proveedores: selectResultProveedores.rows,
      proveedorActualizado: selectResultProveedorActualizado.rows[0], // Se asume que solo habrá una fila de proveedor actualizado
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un proveedor con ese nombre",
      });
    }
    next(error); // Pasar el error al middleware de manejo de errores global
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

export const getComprobantesA = async (req, res, next) => {
  const { params } = req.query;

  try {
    let query = "SELECT * FROM comprobantes WHERE user_id = $1"; // Consulta base con `userId`
    let values = [req.userId]; // Parámetro para la consulta

    // Si se proporciona el parámetro "params", agregar filtro a la consulta
    if (params) {
      query += " AND params = $2"; // Condición adicional
      values.push(params); // Agregar `params` al array de valores
    }

    const result = await pool.query(query, values); // Ejecutar la consulta
    return res.json(result.rows); // Devolver resultados en formato JSON
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

//ADMIN
export const getComprobantesMensualAdmin = async (req, res, next) => {
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

export const getComprobantesMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comprobantes WHERE user_id = $1 " +
        "AND created_at >= DATE_TRUNC('month', CURRENT_DATE) " + // Primer día del mes actual
        "AND created_at < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')", // Primer día del siguiente mes
      [req.userId]
    );

    // Retorna el resultado como JSON
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener comprobantes mensuales:", error);
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

export const getComprobantesDelDia = async (req, res, next) => {
  try {
    // Consulta para obtener todos los comprobantes creados en el día actual
    const result = await pool.query(
      "SELECT * FROM comprobantes WHERE created_at::date = CURRENT_DATE"
    );

    // Devuelve los resultados en formato JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener comprobantes del día:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getComprobantesPorRangoDeFechas = async (req, res, next) => {
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

    // Validación de zona horaria y ajuste UTC
    const result = await pool.query(
      "SELECT * FROM comprobantes WHERE user_id = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.userId, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const eliminarComprobanteActualizarProveedor = async (req, res) => {
  const comprobanteId = req.params.id;

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Retrieve the comprobante amount and proveedor ID
    const comprobanteResult = await pool.query(
      "SELECT total, params FROM comprobantes WHERE id = $1",
      [comprobanteId]
    );

    if (comprobanteResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "No existe ningún comprobante con ese id",
      });
    }

    const { total, params } = comprobanteResult.rows[0];

    // Delete the comprobante
    const deleteResult = await pool.query(
      "DELETE FROM comprobantes WHERE id = $1 RETURNING *",
      [comprobanteId]
    );

    if (deleteResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "Error al eliminar el comprobante",
      });
    }

    // Update the proveedor's total by adding the comprobante amount
    const updateResult = await pool.query(
      "UPDATE proveedor SET total = total + $1 WHERE id = $2 RETURNING *",
      [total, params]
    );

    if (updateResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "Error al actualizar el total del proveedor",
      });
    }

    // Commit the transaction
    await pool.query("COMMIT");

    // Obtener todas las filas de comprobantes después de la inserción
    const selectQueryComprobantes = `
     SELECT *
      FROM comprobantes WHERE user_id = $1`;

    const selectResultComprobantes = await pool.query(selectQueryComprobantes, [
      req.userId,
    ]);

    // Obtener todas las filas de proveedores después de la actualización
    const selectQueryProveedores = `
      SELECT *
      FROM proveedor WHERE user_id = $1`;

    const selectResultProveedores = await pool.query(selectQueryProveedores, [
      req.userId,
    ]);

    return res.json({
      message: "Comprobante eliminado y total del proveedor actualizado",
      deletedComprobante: deleteResult.rows[0],
      updatedProveedor: updateResult.rows[0],
      proveedores: selectResultProveedores.rows,
      comprobantes: selectResultComprobantes.rows,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(
      "Error al eliminar comprobante y actualizar proveedor:",
      error
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
