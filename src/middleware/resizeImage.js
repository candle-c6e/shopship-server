import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export const resizeImage = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];
  req.body.featureImages = [];
  await Promise.all(
    req.files.map(async (file) => {
      const randomHex = crypto.randomBytes(10).toString("hex");
      const date = new Date();
      const day =
        date.getDate().length > 1 ? date.getDate() : `0${date.getDate()}`;
      const month =
        (date.getMonth() + 1).length > 1
          ? date.getMonth() + 1
          : `0${date.getMonth()}`;
      const newFilename = `image_${day}${month}${date.getFullYear()}${randomHex}${path.extname(
        file.originalname
      )}`;

      await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/${newFilename}`);

      if (file.fieldname === "feature_image") {
        req.body.featureImages.push(newFilename);
      } else {
        req.body.images.push(newFilename);
      }
    })
  );

  next();
};
