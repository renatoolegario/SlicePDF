import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const uploadDir = path.join(process.cwd(), "input");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        multiples: false,
    });

    const { fileName, error } = await new Promise((resolve) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Erro no formidable:", err);
                return resolve({ error: err });
            }

            let file = files.file;
            if (Array.isArray(file)) file = file[0];

            const filepath = file.filepath;
            const name = path.basename(filepath);

            resolve({ fileName: name });
        });
    });

    if (error) {
        return res.status(500).json({ error: "Erro ao fazer upload" });
    }

    return res.status(200).json({ fileName });
}
