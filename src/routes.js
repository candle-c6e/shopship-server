import { Router } from "express";
import multer from "multer";
import { authorize } from "./middleware/authorize";
import { resizeImage } from "./middleware/resizeImage";
import { Cart, InsertCart, DeleteCart } from "./modules/cart/cart.controller";
import {
  Categories,
  DeleteCategory,
  InsertCategory,
  UpdateCategory,
} from "./modules/category/category.controller";
import {
  DeleteProduct,
  InsertProduct,
  Product,
  Products,
  SearchProduct,
  UpdateProduct,
} from "./modules/product/product.controller";
import {
  DeleteUser,
  Login,
  Logout,
  Me,
  Register,
} from "./modules/user/user.controller";

const router = Router();

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

router
  .get("/me", Me)
  .post("/register", Register)
  .post("/login", Login)
  .post("/logout", Logout)
  .delete("/user", authorize, DeleteUser);

router
  .get("/category", Categories)
  .post("/category", authorize, InsertCategory)
  .patch("/category", authorize, UpdateCategory)
  .delete("/category", authorize, DeleteCategory);

router
  .post("/products", Products)
  .get("/product/:slug", Product)
  .post("/product", authorize, upload.any(), resizeImage, InsertProduct)
  .patch("/product", authorize, upload.any(), resizeImage, UpdateProduct)
  .delete("/product", authorize, DeleteProduct)
  .post("/search", SearchProduct);

router
  .get("/cart", Cart)
  .post("/addCart", InsertCart)
  .delete("/deleteCart", DeleteCart);

export default router;
