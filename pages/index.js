import { useState } from "react";

export default function Home() {
    const [pdf, setPdf] = useState(null);
    const [status, setStatus] = useState("");
    const [imagens, setImagens] = useState([]);

    const enviar = async () => {
        if (!pdf) return alert("Selecione um PDF!");

        const formData = new FormData();
        formData.append("file", pdf);

        // upload
        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const { fileName } = await uploadRes.json();

        setStatus("Processando...");

        // processamento
        await fetch("/api/processar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName }),
        });

        setStatus("Buscando imagens...");

        // buscar lista de imagens
        const res = await fetch("/api/listar-imagens");

        const data = await res.json();
        console.log(data);
        setImagens(data.files);
        setStatus("✔️ Finalizado!");
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Processar PDF</h1>

            <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />

            <button onClick={enviar}>Enviar</button>

            <p>{status}</p>

            {/* Exibir imagens */}
            <div style={{ marginTop: 20 }}>
                {imagens.map((src, index) => (
                    <div key={index} style={{ marginBottom: 20 }}>
                        <img src={src} alt={`Imagem ${index}`} style={{ width: 300, border: "1px solid #ccc" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
