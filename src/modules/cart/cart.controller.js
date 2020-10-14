import database from "../../database";

export const Cart = async (req, res) => {
  const { userId } = req.session || null;

  try {
    if (!userId) {
      return res.status(401).json({
        error: true,
        msg: "You are not authorize",
        result: {
          products: [],
          total_price: 0,
        },
      });
    }

    const [products] = await database.query(
      `
      SELECT
      t1.quantity,
      t2.*,
      SUM(t2.price * t1.quantity) AS total_price
      FROM (
        SELECT
          *
        FROM
          cart
        WHERE
          user_id = ?) t1
        INNER JOIN (
          SELECT
            id AS product_id, product_name, CONCAT('${process.env.BASE_URL}/uploads/', feature_image) AS feature_image, CASE WHEN sale_price <= 0 THEN
              price
            ELSE
              sale_price
            END AS price
          FROM
            product) t2 ON t1.product_id = t2.product_id
      GROUP BY t2.product_id, t1.quantity
    `,
      [userId]
    );

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: {
        products: products,
        total_price: products.length
          ? products.reduce((acc, current) => {
              return acc + parseInt(current.total_price);
            }, 0)
          : 0,
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

export const InsertCart = async (req, res) => {
  const { userId } = req.session || null;
  const { product_id } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({
        error: true,
        msg: "You are not authorize",
        result: [],
      });
    }

    const [
      product,
    ] = await database.query(
      `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
      [userId, product_id]
    );

    if (product.length) {
      await database.query(
        `UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?`,
        [userId, product_id]
      );
    } else {
      await database.query(
        `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
        [userId, product_id, 1]
      );
    }

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

export const DeleteCart = async (req, res) => {
  const { userId } = req.session || null;
  const { product_id } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({
        error: true,
        msg: "You are not authorize",
        result: [],
      });
    }

    await database.query(
      `
      DELETE FROM cart WHERE user_id = ? AND product_id = ?
    `,
      [userId, product_id]
    );

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
