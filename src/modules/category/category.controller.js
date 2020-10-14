import database from "../../database";

export const Categories = async (req, res) => {
  try {
    const [category] = await database.query(
      "SELECT id, category_name FROM category ORDER BY id"
    );

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: category,
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

export const InsertCategory = async (req, res) => {
  const { category_name } = req.body;
  try {
    const [
      category,
    ] = await database.query(
      "INSERT INTO category (category_name) VALUES (?)",
      [category_name]
    );

    if (!category.affectedRows) {
      return res.status(500).json({
        error: true,
        msg: "Something wrong please try again.",
        result: [],
      });
    }

    res.status(201).json({
      error: false,
      msg: "OK.",
      result: category.insertId,
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

export const UpdateCategory = async (req, res) => {
  const { category_id, category_name } = req.body;
  try {
    const [
      category,
    ] = await database.query(
      "UPDATE category SET category_name = ? WHERE id = ?",
      [category_name, category_id]
    );

    if (!category.affectedRows) {
      return res.status(404).json({
        error: true,
        msg: "Category is not exists.",
        result: [],
      });
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

export const DeleteCategory = async (req, res) => {
  const { category_id } = req.body;
  try {
    const [category] = await database.query(
      "DELETE FROM category WHERE id = ?",
      [category_id]
    );

    if (!category.affectedRows) {
      return res.status(404).json({
        error: true,
        msg: "Category is not exists.",
        result: [],
      });
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
