import { Router } from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController";
import { adminOnly, protect } from "../middleware/authMiddleware";
import validate from "../middleware/validateMiddleware";
import { updateUserValidation, userIdParam } from "../validations/userValidation";
const router = Router(); router.use(protect, adminOnly); router.get("/", getUsers); router.get("/:id", userIdParam, validate, getUserById); router.put("/:id", userIdParam, updateUserValidation, validate, updateUser); router.delete("/:id", userIdParam, validate, deleteUser); export default router;
