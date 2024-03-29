import { pool } from "../db.js";

export const getOrdenesFinal = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM ordenes_final");
  return res.json(result.rows);
};

export const getOrdenFinal = async (req, res) => {
  const result = await pool.query("SELECT * FROM ordenes_final WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearOrdenFinal = async (req, res, next) => {
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
      "INSERT INTO ordenes_final (proveedor,numero_factura,detalle,fecha_factura,precio_final,localidad,provincia,datos,usuario,role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
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

export const actualizarOrdenFinal = async (req, res) => {
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
    "UPDATE ordenes_final SET proveedor = $1, numero_factura = $2, fecha_factura = $3, localidad = $4, provincia = $5, detalle = $6, datos_json = $7, usuario = $8, role_id = $9 WHERE id = $10",
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

export const eliminarOrdenFinal = async (req, res) => {
  const result = await pool.query("DELETE FROM ordenes_final WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.sendStatus(204);
};

export const getOrdenesFinalMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ordenes_final WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
