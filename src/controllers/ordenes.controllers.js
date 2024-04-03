import { pool } from "../db.js";

export const getOrdenes = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM orden");
  return res.json(result.rows);
};

export const getOrden = async (req, res) => {
  const result = await pool.query("SELECT * FROM orden WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearOrden = async (req, res, next) => {
  const {
    proveedor,
    numero_factura,
    detalle,
    fecha_factura,
    precio_final,
    localidad,
    provincia,
    datos,
  } = req.body;

  const { username, userRole } = req;

  try {
    // Convert the precio_final array into a string or JSON before inserting it into the database
    const precio_final_string = JSON.stringify(precio_final);

    const result = await pool.query(
      "INSERT INTO orden (proveedor,numero_factura,detalle,fecha_factura,precio_final,localidad,provincia,datos,usuario,role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        proveedor,
        numero_factura,
        detalle,
        fecha_factura,
        precio_final_string, // Use the converted string instead of the array directly
        localidad,
        provincia,
        datos,
        username,
        userRole,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una orden con ese id",
      });
    }
    next(error);
  }
};

export const actualizarOrden = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const {
    proveedor,
    numero_factura,
    fecha_factura,
    localidad,
    provincia,
    detalle,
    datos_json,
  } = req.body;

  const result = await pool.query(
    "UPDATE orden SET proveedor = $1, numero_factura = $2, fecha_factura = $3, localidad = $4, provincia = $5, detalle = $6, datos_json = $7, usuario = $8, role_id = $9 WHERE id = $10",
    [
      proveedor,
      numero_factura,
      fecha_factura,
      localidad,
      provincia,
      detalle,
      datos_json,
      username,
      userRole,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una orden con ese id",
    });
  }

  return res.json({
    message: "Orden actualizada",
  });
};

export const eliminarOrden = async (req, res) => {
  const result = await pool.query("DELETE FROM orden WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.sendStatus(204);
};

export const getOrdenesMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orden WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getOrdenesPorRangoDeFechas = async (req, res, next) => {
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
      "SELECT * FROM orden WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerValorUnico = async (req, res) => {
  const productId = req.params.id;

  try {
    // Obtener los datos JSON actuales de la base de datos
    const result = await pool.query(
      "SELECT datos FROM orden WHERE (datos->'productoSeleccionado')::jsonb @> $1",
      [`[{"id": ${productId}}]`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No existe ningún producto con ese id",
      });
    }

    const existingJson = result.rows[0].datos;

    // Find the product with the specified id in the productoSeleccionado array
    const product = existingJson.productoSeleccionado.find(
      (item) => item.id === parseInt(productId, 10)
    );

    if (!product) {
      return res.status(404).json({
        message: "No existe ningún producto con ese id",
      });
    }

    // Devolver el objeto completo del producto
    return res.json({
      producto: product,
    });
  } catch (error) {
    console.error("Error durante la operación de obtención del valor:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const editarProductoUnico = async (req, res) => {
  const productIdToEdit = req.params.id;
  const updatedProductData = req.body; // Suponiendo que recibes los nuevos datos del producto en el cuerpo de la solicitud

  try {
    // Obtener los datos JSONB actuales de la base de datos
    const result = await pool.query(
      "SELECT datos FROM orden WHERE (datos->'productoSeleccionado')::jsonb @> $1",
      [`[{"id": ${productIdToEdit}}]`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No existe ningún producto con ese id",
      });
    }

    const existingJson = result.rows[0].datos;

    // Actualizar el elemento con el id especificado en el array con los nuevos datos
    const updatedProductos = existingJson.productoSeleccionado.map((item) => {
      if (item.id === parseInt(productIdToEdit)) {
        return { ...item, ...updatedProductData };
      }
      return item;
    });

    // Actualizar la base de datos con el JSON modificado
    await pool.query(
      "UPDATE orden SET datos = $1 WHERE (datos->'productoSeleccionado')::jsonb @> $2",
      [
        { productoSeleccionado: updatedProductos },
        `[{ "id": ${productIdToEdit} }]`,
      ]
    );

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error durante la operación de edición:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
