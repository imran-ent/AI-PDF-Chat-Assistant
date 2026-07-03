import { useState } from "react";
import axios from "axios";

function UploadPDF({ setUploaded }) {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {

        if (!file) {
            alert("Please select a PDF file.");
            return;
        }

        const formData = new FormData();

        formData.append("file", file);

        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:8000/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(response.data.status);

            setUploaded(true);

        } catch (error) {

            console.error(error);

            alert("Failed to upload PDF.");

        }

        setLoading(false);

    };

    return (

        <div className="upload">

            <h2>Upload PDF</h2>

            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <br />

            <button
                onClick={handleUpload}
                disabled={loading}
            >
                {loading ? "Uploading..." : "Upload PDF"}
            </button>

        </div>

    );

}

export default UploadPDF;