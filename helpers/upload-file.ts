import fs from "fs";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_URL,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ID!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

type CustomFile = {
  lastModifiedDate?: Date;
  filepath?: string;
  newFilename?: string;
  originalFilename?: string;
  mimetype?: string;
  hashAlgorithm?: boolean;
  size?: number;
};

type Uploads = {
  errors: Error[];
  success: any[];
};

async function uploadFile(files: CustomFile[], folder = ""): Promise<Uploads> {
  const rootEnvFolder =
    process.env.NODE_ENV === "production" ? "production/" : "development/";
  folder = rootEnvFolder + folder;
  // creamos uuna promesa ya que vamos a ejecutar un callback varias veces
  return new Promise((resolve) => {
    s3.createBucket(() => {
      // definimos la variable que va a tener la respuesta
      var awsUpload: Uploads = {
        errors: [],
        success: [],
      };

      let times = 0;
      // recorremos el arreglo de archivos que debemos subir
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const config = {
          Key: folder + Date.now() + file.originalFilename!,
          Bucket: process.env.DO_SPACES_BUCKET!,
          Body: fs.createReadStream(file.filepath!),
          ACL: "public-read",
        };

        // subimos el archivo con la configuracion, si hay error lo annadimos al arreglo y si si no tambien
        s3.upload(config, (err: Error, data: any) => {
          if (err) {
            awsUpload.errors.push(err);
          } else {
            awsUpload.success.push(data);
          }

          times++;
          // si ya se recorrio todo el arreglo entonces devuelva el resultado
          if (times === files.length) {
            resolve(awsUpload);
          }
        });
      }
    });
  });
}

export default uploadFile;
