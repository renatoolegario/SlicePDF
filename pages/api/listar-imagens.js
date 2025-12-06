import fs from "fs";
import path from "path";

export default function handler(req, res) {
    const dir = path.join(process.cwd(), "public", "output", "square"); // listar a pasta square
    // Se quiser listar /raw, troque "square" por "raw"

    if (!fs.existsSync(dir)) {
        return res.status(200).json({ files: [] });
    }

    const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".png"))
        .map((f) => `/output/square/${f}`);

    return res.status(200).json({ files });
}
