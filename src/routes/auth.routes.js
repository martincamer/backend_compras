import Router from "express-promise-router";
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  profile,
  signin,
  signout,
  signup,
  signupTwo,
  updateUser,
  updateUserPassword,
  updateUserRole,
} from "../controllers/auth.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { signinSchema, signupSchema } from "../schemas/auth.schema.js";
import { isAdmin } from "../middlewares/compras.middleware.js";

const router = Router();

router.post("/signin", validateSchema(signinSchema), signin);

router.post("/signup", validateSchema(signupSchema), signup);

router.post("/signup-two", validateSchema(signupSchema), signupTwo);

router.put("/users/:id", isAuth, isAdmin, updateUser);

router.get("/users/:id", isAuth, isAdmin, getUserById);

router.delete("/users/:id", isAuth, isAdmin, deleteUserById);

router.put("/users-password/:id", isAuth, isAdmin, updateUserPassword);

router.put("/users-role/:id", isAuth, isAdmin, updateUserRole);

router.post("/signout", signout);

router.get("/profile", isAuth, isAdmin, profile);

router.get("/users", isAuth, isAdmin, getAllUsers);

export default router;
