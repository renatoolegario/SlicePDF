import { fromPath } from "pdf2pic";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Método não permitido" });

    const { fileName } = req.body;

    const INPUT_PDF = path.join(process.cwd(), "input", fileName);
    const RAW_DIR = path.join(process.cwd(), "public", "output", "raw");
    const SQUARE_DIR = path.join(process.cwd(), "public", "output", "square");

    for (const dir of [RAW_DIR, SQUARE_DIR]) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    async function pdfParaImagens() {
        const converter = fromPath(INPUT_PDF, {
            density: 300,
            savePath: RAW_DIR,
            saveFilename: "page",
            format: "png",
            width: 1920,
            height: 1080,
        });

        await converter.bulk(-1);
    }

    async function deixarQuadrado() {
        const files = fs
            .readdirSync(RAW_DIR)
            .filter((f) => f.endsWith(".png"))
            .sort();

        const size = 1080;

        for (const file of files) {
            const inputPath = path.join(RAW_DIR, file);
            const outputPath = path.join(SQUARE_DIR, file);

            const img = sharp(inputPath);
            const meta = await img.metadata();

            const scale = size / Math.max(meta.width, meta.height);
            const newWidth = Math.round(meta.width * scale);
            const newHeight = Math.round(meta.height * scale);

            const resized = await img.resize(newWidth, newHeight).png().toBuffer();

            await sharp({
                create: {
                    width: size,
                    height: size,
                    channels: 3,
                    background: "#ffffff",
                },
            })
                .composite([{ input: resized, gravity: "center" }])
                .png()
                .toFile(outputPath);
        }
    }

    try {
        await pdfParaImagens();
        await deixarQuadrado();
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Erro ao processar PDF", details: err });
    }
}
