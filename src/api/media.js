const MediaService = require("../services/media-service");
const {
  SubscribeMessage,
  GetApiResponse,
  GetPagination,
  GetSortByFromRequest,
  GetUploadFullPath,
} = require("../utils");
const multer = require("multer");
const fetch = require("node-fetch");
const jimp = require("jimp");

// const upload = require("./middlewares/upload");

const uploadFile = require("./middlewares/upload");

const { Validator } = require("node-input-validator");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const AWS = require("aws-sdk");

// Set up AWS SDK configuration
const s3 = new AWS.S3({
  // accessKeyId: "AKIA2LLVEQMWLK43E6WL",
  // secretAccessKey: "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",
});

module.exports = (app) => {
  const service = new MediaService();
  // To listen
  // SubscribeMessage(channel, service);
  app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    console.log(req.body.folder_name);
    const file = req.file;
    const s3Params = {
      Bucket: "sarvusahitya",
      Key: `uploads/${req.body.folder_name}/${path.basename(
        file.originalname
      )}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read", // Adjust the ACL as needed
    };

    // Upload file to S3
    s3.upload(s3Params, async (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("File upload to S3 failed.");
      }

      var url = `https://sarvusahitya.s3.ap-south-1.amazonaws.com/uploads/${
        req.body.folder_name
      }/${path.basename(file.originalname)}`;

      var formdata = {
        media_type: "image",
        media_url: url,
        folder_name: req.body.folder_name,
      };

      var data = await service.AddMedia(formdata);

      // await convertToWebPAndUpload(
      //   data.Location,
      //   `uploads/${req.body.folder_name}/${path.basename(file.originalname)}`
      // );

      // File uploaded successfully to S3
      res.status(200).json({ message: "File uploaded to S3", data: [data] });
    });
  });

  const convertToWebPAndUpload = async (imageUrl, key) => {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      // Load the image buffer with Jimp
      const image = await jimp.read(buffer);

      var imagename = key;
      const fileExtension = imagename.split(".").pop(); // This will give you 'png'
      const filePathWithoutExtension = imagename.slice(
        0,
        imagename.lastIndexOf(".")
      );
      console.log(jimp.MIME_PNG);

      // Convert the image to WebP
      const webpBuffer = await image.getBufferAsync(jimp.MIME_PNG);

      // Upload the WebP buffer to Amazon S3
      const uploadParams = {
        Bucket: "sarvusahitya",
        Key: filePathWithoutExtension + ".webp", // Name for the WebP image in S3
        Body: webpBuffer,
        ContentType: "image/webp",
        // ACL: 'public-read' // Adjust permissions as needed
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error("Error uploading to S3:", err);
        } else {
          console.log(
            "Image converted to WebP and uploaded to S3 successfully:",
            data.Location
          );
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  app.post("/media/create", async (req, res, next) => {
    try {
      // var uploadfile = await uploadFile(req, res);

      // req.body.media_file = req.media_file;
      // req.body.full_path = GetUploadFullPath(req.body.folder_name,req.body.media_file);
      var data = await service.AddMedia(req.body);

      data = await GetApiResponse(data);
      return res.json(data);

      // console.log(update)
      res.json(req.file);
    } catch (error) {
      next(error);
    }
  });

  app.post("/medias", async (req, res, next) => {
    try {
      const { limit, skip } = await GetPagination(req.body.page, req.body.size);
      var sortarray = await GetSortByFromRequest(
        req.body.orderbycolumnname,
        req.body.orderby
      );
      var data = await service.Medias(limit, skip, req.body, sortarray);
      data = await GetApiResponse(data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });
  app.post("/mediagroupby", async (req, res, next) => {
    try {
      const { limit, skip } = await GetPagination(req.body.page, req.body.size);
      var sortarray = await GetSortByFromRequest(
        req.body.orderbycolumnname,
        req.body.orderby
      );
      var data = await service.GroupByMedia(limit, skip, req.body, sortarray);
      data = await GetApiResponse(data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });
  app.post("/media/:id", async (req, res, next) => {
    try {
      var data = await service.mediaById(req.params.id);
      data = await GetApiResponse(data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });
  app.put("/media/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      var uploadfile = await uploadFile(req, res);

      req.body.media_file = req.media_file;
      req.body.full_path = GetUploadFullPath(
        req.body.folder_name,
        req.body.media_file
      );
      var formdata = req.body;
      formdata["id"] = id;
      var data = await service.UpdateMedia(formdata);
      data = await GetApiResponse(data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });
  app.delete("/media/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      var formdata = req.body;
      formdata["id"] = id;
      var data = await service.DeleteMedia(formdata);
      data = await GetApiResponse(data);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });
};
