import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
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
import { bodyErrors } from "./middleware/bodyErrors";

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
  .post(
    "/register",
    [
      body("email").notEmpty(),
      body("username").notEmpty(),
      body("password").notEmpty(),
      body("name").notEmpty(),
    ],
    bodyErrors,
    Register
  )
  .post(
    "/login",
    [body("username").notEmpty(), body("password").notEmpty()],
    bodyErrors,
    Login
  )
  .post("/logout", Logout)
  .delete(
    "/user",
    [body("user_id").notEmpty()],
    bodyErrors,
    authorize,
    DeleteUser
  );

router
  .get("/category", Categories)
  .post(
    "/category",
    [body("category_name").notEmpty()],
    bodyErrors,
    authorize,
    InsertCategory
  )
  .patch(
    "/category",
    [body("category_id").notEmpty(), body("category_name").notEmpty()],
    bodyErrors,
    authorize,
    UpdateCategory
  )
  .delete(
    "/category",
    [body("category_id").notEmpty()],
    bodyErrors,
    authorize,
    DeleteCategory
  );

router
  .post("/products", Products)
  .get("/product/:slug", Product)
  .post(
    "/product",
    authorize,
    upload.any(),
    [
      body("category_id").notEmpty(),
      body("product_name").notEmpty(),
      body("description").notEmpty(),
      body("price").notEmpty(),
      body("sale_price").notEmpty(),
    ],
    bodyErrors,
    resizeImage,
    InsertProduct
  )
  .patch(
    "/product",
    authorize,
    upload.any(),
    [
      body("category_id").notEmpty(),
      body("product_name").notEmpty(),
      body("description").notEmpty(),
      body("price").notEmpty(),
      body("sale_price").notEmpty(),
    ],
    bodyErrors,
    resizeImage,
    UpdateProduct
  )
  .delete(
    "/product",
    [body("product_id").notEmpty()],
    bodyErrors,
    authorize,
    DeleteProduct
  )
  .post("/search", SearchProduct);

router
  .get("/cart", Cart)
  .post("/addCart", [body("product_id").notEmpty()], bodyErrors, InsertCart)
  .delete(
    "/deleteCart",
    [body("product_id").notEmpty()],
    bodyErrors,
    DeleteCart
  );

export default router;
