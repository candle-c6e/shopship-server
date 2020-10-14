import fs from "fs";
import path from "path";
import slug from "slug";
import database from "../../database";

export const Products = async (req, res) => {
  const { is_limit, page = 1 } = req.body;

  try {
    const limit = 6;
    const skip = (page - 1) * limit;

    const resultProducts = [];

    const query = `
    SELECT t1.*, t2.category_name FROM (
      SELECT id, product_name, slug, 'except', description, 
      CONCAT('${
        process.env.BASE_URL
      }/uploads/', feature_image) as feature_image, category_id, price, sale_price, created_at 
      FROM product
    ) t1
    INNER JOIN (
      SELECT id, category_name FROM category
    ) t2 ON t1.category_id = t2.id
    ${is_limit ? "ORDER BY RAND()" : "ORDER BY t1.id DESC"}
    ${is_limit ? `LIMIT 3` : `LIMIT ${skip}, ${limit}`}
  `;

    const [products] = await database.query(query);

    const [totalRows] = await database.query(
      `SELECT COUNT(*) as total FROM product`
    );

    let totalPage = 1;

    if (totalRows.length) {
      totalPage = Math.ceil(totalRows[0].total / limit);
    }

    if (products.length) {
      for (let product of products) {
        const [
          featureProduct,
        ] = await database.query(
          `SELECT feature, product_id FROM feature_product WHERE product_id = ?`,
          [product.id]
        );

        resultProducts.push({
          ...product,
          features: featureProduct.map((item) => item.feature),
        });
      }
    } else {
      return res.status(200).json({
        error: true,
        msg: "Product not exists.",
        result: [],
      });
    }

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: {
        products: resultProducts,
        total_page: totalPage,
      },
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};

export const Product = async (req, res) => {
  const { slug } = req.params;

  try {
    const resultProducts = [];

    const [products] = await database.query(
      `
      SELECT t1.*, t2.category_name FROM (
        SELECT id, product_name, slug, 'except', description, 
        CONCAT('${process.env.BASE_URL}/uploads/', feature_image) as feature_image, category_id, price, sale_price, created_at 
        FROM product WHERE slug = ?
      ) t1
      INNER JOIN (
        SELECT id, category_name FROM category
      ) t2 ON t1.category_id = t2.id
    `,
      [slug]
    );

    if (products.length) {
      for (let product of products) {
        const [
          featureProduct,
        ] = await database.query(
          `SELECT feature, product_id FROM feature_product WHERE product_id = ?`,
          [product.id]
        );

        resultProducts.push({
          ...product,
          features: featureProduct.map((item) => item.feature),
        });
      }
    } else {
      return res.status(200).json({
        error: true,
        msg: "Product not exists.",
        result: [],
      });
    }

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: resultProducts,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};

export const SearchProduct = async (req, res) => {
  const { text_search } = req.body;

  try {
    const [rows] = await database.query(`
      SELECT product_name, CONCAT('${process.env.BASE_URL}/uploads/', feature_image) as feature_image, slug FROM product WHERE product_name LIKE '%${text_search}%'
    `);

    if (!rows.length) {
      return res.status(200).json({
        error: true,
        msg: "Product not found.",
        result: [],
      });
    }

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: rows,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};

export const InsertProduct = async (req, res) => {
  const {
    product_name,
    category_id,
    description,
    price,
    sale_price,
    featureImages,
    features,
  } = req.body;

  try {
    const except = description.slice(0, 100);

    const [
      product,
    ] = await database.query(
      "INSERT INTO product (product_name, slug, category_id, `except`, description, feature_image, price, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        product_name,
        slug(product_name),
        category_id,
        except,
        description,
        featureImages[0],
        price,
        sale_price,
      ]
    );

    if (!product.affectedRows) {
      fs.unlink(path.resolve(`uploads/${featureImages[0]}`), (err) => {
        if (err) console.log(err);
      });
      return res.status(500).json({
        error: true,
        msg: "Something wrong please try again later.",
        result: [],
      });
    }

    if (features && features.length) {
      for (let feature of features) {
        await database.query(
          "INSERT INTO feature_product (feature, product_id) VALUES (?, ?)",
          [feature, product.insertId]
        );
      }
    }

    res.status(201).json({
      error: false,
      msg: "OK.",
      result: { id: product.insertId, slug: slug(product_name) },
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};

export const UpdateProduct = async (req, res) => {
  const {
    product_id,
    product_name,
    category_id,
    description,
    price,
    sale_price,
    featureImages,
    features,
  } = req.body;

  try {
    const except = description.slice(0, 100);

    let product;

    if (featureImages.length) {
      const [
        resultProduct,
      ] = await database.query(
        "SELECT id, feature_image FROM product WHERE id = ?",
        [product_id]
      );
      fs.unlink(
        path.resolve(`uploads/${resultProduct[0].feature_image}`),
        (err) => {
          if (err) console.log(err);
        }
      );

      product = await database.query(
        "UPDATE product SET product_name = ?, slug = ?, category_id = ?, `except` = ?, description = ?, feature_image = ?, price = ?, sale_price = ? WHERE id = ?",
        [
          product_name,
          slug(product_name),
          category_id,
          except,
          description,
          featureImages[0],
          price,
          sale_price,
          product_id,
        ]
      );
    } else {
      product = await database.query(
        "UPDATE product SET product_name = ?, slug = ?, category_id = ?, `except` = ?, description = ?, price = ?, sale_price = ? WHERE id = ?",
        [
          product_name,
          slug(product_name),
          category_id,
          except,
          description,
          price,
          sale_price,
          product_id,
        ]
      );
    }

    if (!product[0].affectedRows) {
      if (featureImages.length) {
        fs.unlink(path.resolve(`uploads/${featureImages[0]}`), (err) => {
          if (err) console.log(err);
        });
      }

      return res.status(500).json({
        error: true,
        msg: "Something wrong please try again later.",
        result: [],
      });
    }

    if (features && features.length) {
      await database.query("DELETE FROM feature_product WHERE product_id = ?", [
        product_id,
      ]);

      for (let feature of features) {
        await database.query(
          "INSERT INTO feature_product (feature, product_id) VALUES (?, ?)",
          [feature, product_id]
        );
      }
    }

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: product_id,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};

export const DeleteProduct = async (req, res) => {
  const { product_id } = req.body;

  try {
    const [
      product,
    ] = await database.query(
      "SELECT id, feature_image FROM product WHERE id = ?",
      [product_id]
    );

    if (!product.length) {
      res.status(200).json({
        error: true,
        msg: "Product is not exists.",
        result: [],
      });
    }

    fs.unlink(path.resolve(`uploads/${product[0].feature_image}`), (err) => {
      if (err) console.log(err);
    });

    await database.query("DELETE FROM feature_product WHERE product_id = ?", [
      product_id,
    ]);

    await database.query("DELETE FROM product WHERE id = ?", [product_id]);

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: [],
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500).json({
      error: true,
      msg: "Something wrong.",
      result: [],
    });
  }
};
