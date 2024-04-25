import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";
import bcrypts from "bcryptjs";

// signin
export const signin = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rowCount === 0) {
    return res.status(400).json({
      message: "El correo no está registrado",
    });
  }

  const validPassword = await bcrypts.compare(
    password,
    result.rows[0].password
  );
  if (!validPassword) {
    return res.status(400).json({
      message: "La contraseña es incorrecta",
    });
  }
  const token = await createAccessToken({
    id: result.rows[0].id,
    role: result.rows[0].role_id,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json(result.rows[0]);
};

// signup
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypts.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(username,password,email,role_id) VALUES($1,$2,$3,$4) RETURNING *",
      [username, hashedPassword, email, 2] // Assuming 'user' role has an id of 2
    );

    const token = await createAccessToken({
      id: result.rows[0].id,
      role: result.rows[0].role_id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

// signup
export const signupTwo = async (req, res, next) => {
  const { username, email, password, role_id } = req.body;

  try {
    const hashedPassword = await bcrypts.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(username,password,email,role_id) VALUES($1,$2,$3,$4) RETURNING *",
      [username, hashedPassword, email, 2] // Assuming 'user' role has an id of 2
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

//logout
export const signout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  res.sendStatus(200);
};

//profile user
export const profile = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

//profile user
export const passwordReset = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, role_id } = req.body;

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypts.hash(password, 10);

    // Actualizar los datos del usuario, incluyendo la contraseña hash
    const updateResult = await pool.query(
      "UPDATE users SET username = $1, email = $2, password = $3, role_id = $4 WHERE id = $5 RETURNING *",
      [username, email, hashedPassword, role_id, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
