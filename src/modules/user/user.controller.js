import argon from "argon2";
import { COOKIE_NAME } from "../../constant";
import database from "../../database";

export const Me = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(200).json({
        error: true,
        msg: "OK.",
        result: null,
      });
    }

    const [
      user,
    ] = await database.query("SELECT id, name FROM user WHERE id = ?", [
      userId,
    ]);

    if (!user.length) {
      return res.status(200).json({
        error: true,
        msg: "OK.",
        result: null,
      });
    }

    res.status(200).json({
      error: false,
      msg: "OK.",
      result: user[0].name,
    });
  } catch (err) {
    if (err) console.log(err);
    res.status(500);
  }
};

export const Register = async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    const [
      users,
    ] = await database.query(
      "SELECT * FROM user WHERE username = ? OR email = ?",
      [username, email]
    );

    if (users.length) {
      return res.status(500).json({
        error: true,
        msg: "Email or username is exists.",
        result: [],
      });
    }

    const hashedPassword = await argon.hash(password);

    const [
      user,
    ] = await database.query(
      "INSERT INTO user (name, email, username, password) VALUES (?, ?, ?, ?)",
      [name, email, username, hashedPassword]
    );

    req.session.userId = user.insertId;

    res.status(201).json({
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

export const Login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await database.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (!user.length) {
      return res.status(404).json({
        error: true,
        msg: "user not exists.",
        result: [],
      });
    }

    if (user.length) {
      const isValid = await argon.verify(user[0].password, password);
      if (!isValid) {
        return res.status(404).json({
          error: true,
          msg: "password is not correct.",
          result: [],
        });
      }

      req.session.userId = user[0].id;

      return res.status(200).json({
        error: false,
        msg: "OK.",
        result: {
          id: user[0].id,
          name: user[0].name,
        },
      });
    }

    res.status(500).json({
      error: true,
      msg: "Something wrong.",
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

export const Logout = async (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie(COOKIE_NAME);
      res.send({ success: true });
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

export const DeleteUser = async (req, res) => {
  const { user_id } = req.body;

  try {
    const [user] = await database.query("DELETE FROM user WHERE id = ?", [
      user_id,
    ]);

    if (!user.affectedRows) {
      return res.status(404).json({
        error: true,
        msg: "User is not exists.",
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
