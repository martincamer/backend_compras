import { pool } from "../db.js";

export const getOrdenesAdmin = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM orden");
  return res.json(result.rows);
};

export const getOrdenes = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM orden WHERE user_id = $1", [
    req.userId,
  ]);
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
    iva,
  } = req.body;

  const { username, userRole } = req;

  try {
    // Convert the precio_final array into a string or JSON before inserting it into the database
    const precio_final_string = JSON.stringify(precio_final);

    const result = await pool.query(
      "INSERT INTO orden (proveedor,numero_factura,detalle,fecha_factura,precio_final,localidad,provincia,datos,iva,usuario,role_id,fabrica, localidad_usuario, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
      [
        proveedor,
        numero_factura,
        detalle,
        fecha_factura,
        precio_final_string, // Use the converted string instead of the array directly
        localidad,
        provincia,
        datos,
        iva,
        username,
        userRole,
        req.fabrica,
        req.localidad,
        req.userId,
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

export const guardarOrden = async (req, res, next) => {
  const { id } = req.params; // IDs de la orden y el producto
  const {
    proveedor,
    numero_factura,
    detalle,
    fecha_factura,
    precio_final,
    localidad,
    provincia,
    datos,
    iva,
  } = req.body;

  const { username, userRole } = req;

  try {
    // Retrieve the previous precio_final from the database
    const previousOrder = await pool.query(
      "SELECT precio_final FROM orden WHERE id = $1",
      [id]
    );

    if (previousOrder.rows.length === 0) {
      // Si no se encuentra una orden con el ID proporcionado, devolver un error
      return res.status(404).json({ message: "La orden no existe" });
    }

    const previousPrecioFinal = previousOrder.rows[0].precio_final;

    // Convert the precio_final array into a string or JSON before inserting it into the database
    const precio_final_string = JSON.stringify(precio_final);

    // Actualizar la orden existente
    const result = await pool.query(
      "UPDATE orden SET proveedor=$1, numero_factura=$2, detalle=$3, fecha_factura=$4, precio_final=$5, localidad=$6, provincia=$7, datos=$8, iva=$9, usuario=$10, role_id=$11 WHERE id=$12 RETURNING *",
      [
        proveedor,
        numero_factura,
        detalle,
        fecha_factura,
        precio_final_string, // Use the converted string instead of the array directly
        localidad,
        provincia,
        datos,
        iva,
        username,
        userRole,
        id,
      ]
    );

    // Calcular la diferencia en precio_final
    // const precio_final_diff = precio_final - previousPrecioFinal;

    // Actualizar el total en la tabla proveedor para el proveedor asociado
    await pool.query(
      "UPDATE proveedor SET total = total - $1 + $2 WHERE proveedor = $3",
      [previousPrecioFinal, precio_final, proveedor]
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

export const obtenerProductoOrden = async (req, res, next) => {
  const { idOrden, idProducto } = req.params; // Suponiendo que estás pasando los IDs como parámetros en la URL

  try {
    // Obtener la orden de la base de datos
    const orden = await pool.query("SELECT datos FROM orden WHERE id = $1", [
      idOrden,
    ]);

    // Verificar si se encontró la orden
    if (orden.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró la orden con el ID proporcionado",
      });
    }

    // Parsear la columna datos para obtener el arreglo de productos
    const productosOrden = orden.rows[0].datos.productoSeleccionado;

    // Filtrar el arreglo de productos para encontrar el producto deseado por su ID
    const productoDeseado = productosOrden.find(
      (producto) => parseInt(producto.id) === parseInt(idProducto)
    );

    // Verificar si se encontró el producto
    if (!productoDeseado) {
      return res.status(404).json({
        message:
          "No se encontró el producto con el ID proporcionado en la orden",
      });
    }

    // Si se encuentra el producto, devolverlo en la respuesta
    res.json(productoDeseado);
  } catch (error) {
    next(error);
  }
};

export const editarProductoOrden = async (req, res, next) => {
  const { idOrden, idProducto } = req.params; // IDs de la orden y el producto
  const { detalle, categoria, precio_und, cantidad, totalFinal } = req.body; // Nuevos detalles del producto

  try {
    // Obtener la orden de la base de datos
    const ordenQuery = await pool.query(
      "SELECT datos, precio_final, proveedor FROM orden WHERE id = $1",
      [idOrden]
    );

    // Verificar si se encontró la orden
    if (ordenQuery.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró la orden con el ID proporcionado",
      });
    }

    const orden = ordenQuery.rows[0];

    console.log(orden);
    let productosOrden = orden.datos.productoSeleccionado;

    // Encontrar el índice del producto a editar en el arreglo de productos
    const indexProducto = productosOrden.findIndex(
      (producto) => producto.id === parseInt(idProducto)
    );

    // Verificar si se encontró el producto
    if (indexProducto === -1) {
      return res.status(404).json({
        message:
          "No se encontró el producto con el ID proporcionado en la orden",
      });
    }

    // Obtener el precio final anterior del producto
    const precioFinalAnterior = productosOrden[indexProducto].totalFinal;

    // Actualizar los detalles del producto en el arreglo de productos
    productosOrden[indexProducto] = {
      ...productosOrden[indexProducto],
      detalle,
      categoria,
      precio_und,
      cantidad,
      totalFinal,
    };

    // Calcular el cambio en el precio final de la orden
    const cambioPrecioFinal =
      orden.precio_final - precioFinalAnterior + totalFinal;

    // Actualizar el precio final de la orden en la base de datos
    const nuevoPrecioFinal = cambioPrecioFinal;

    // Obtener el proveedor de la orden
    const { proveedor } = orden;

    // Obtener el total actual del proveedor
    const proveedorQuery = await pool.query(
      "SELECT total FROM proveedor WHERE proveedor = $1",
      [proveedor]
    );

    if (proveedorQuery.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró el proveedor asociado a la orden",
      });
    }

    const proveedorEnviado = proveedorQuery.rows[0];
    const totalProveedorAnterior = proveedorEnviado.total;

    // Calcular el nuevo total del proveedor
    const nuevoTotalProveedor =
      totalProveedorAnterior - precioFinalAnterior + totalFinal;

    // Actualizar el total del proveedor en la base de datos
    await pool.query("UPDATE proveedor SET total = $1 WHERE proveedor = $2", [
      nuevoTotalProveedor,
      proveedor,
    ]);

    // Actualizar la orden en la base de datos
    await pool.query(
      "UPDATE orden SET datos = $1, precio_final = $2 WHERE id = $3",
      [
        JSON.stringify({ productoSeleccionado: productosOrden }),
        nuevoPrecioFinal,
        idOrden,
      ]
    );

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const eliminarProductoOrden = async (req, res, next) => {
  const { idOrden, idProducto } = req.params; // IDs de la orden y el producto

  try {
    // Obtener la orden de la base de datos
    const ordenQuery = await pool.query(
      "SELECT datos, precio_final, proveedor FROM orden WHERE id = $1",
      [idOrden]
    );

    // Verificar si se encontró la orden
    if (ordenQuery.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró la orden con el ID proporcionado",
      });
    }

    const orden = ordenQuery.rows[0];

    // Obtener el proveedor de la orden
    const { proveedor } = orden;

    // Obtener el producto a eliminar de la orden
    const productosOrden = orden.datos.productoSeleccionado;
    const productoAEliminar = productosOrden.find(
      (producto) => producto.id === parseInt(idProducto)
    );

    // Verificar si se encontró el producto
    if (!productoAEliminar) {
      return res.status(404).json({
        message:
          "No se encontró el producto con el ID proporcionado en la orden",
      });
    }

    // Obtener el precio final anterior del producto
    const precioFinalAnterior = productoAEliminar.totalFinal;

    // Calcular el cambio en el precio final de la orden
    const cambioPrecioFinal = orden.precio_final - precioFinalAnterior;

    // Calcular el cambio en el total del proveedor
    const cambioTotalProveedor = -precioFinalAnterior;

    // Actualizar el total del proveedor en la base de datos
    await pool.query(
      "UPDATE proveedor SET total = total + $1 WHERE proveedor = $2",
      [cambioTotalProveedor, proveedor]
    );

    // Actualizar el precio final de la orden en la base de datos
    await pool.query(
      "UPDATE orden SET precio_final = precio_final + $1 WHERE id = $2",
      [cambioPrecioFinal, idOrden]
    );

    // Eliminar el producto de la orden en la base de datos
    await pool.query("UPDATE orden SET datos = $1 WHERE id = $2", [
      JSON.stringify({
        productoSeleccionado: productosOrden.filter(
          (producto) => producto.id !== parseInt(idProducto)
        ),
      }),
      idOrden,
    ]);

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
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

//ADMIN ORDENES MENSUALES
export const getOrdenesMensualAdmin = async (req, res, next) => {
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

export const getOrdenesMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orden WHERE user_id = $1 " +
        "AND created_at >= DATE_TRUNC('month', CURRENT_DATE) " + // Primer día del mes actual
        "AND created_at < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')", // Primer día del siguiente mes
      [req.userId]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas mensuales:", error);
    return next(error); // Pasa el error al middleware de manejo de errores
  }
};

export const getOrdenesPorRangoDeFechasAdmin = async (req, res, next) => {
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

    // Validación de zona horaria y ajuste UTC
    const result = await pool.query(
      "SELECT * FROM orden WHERE user_id = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.userId, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones:", error);
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
