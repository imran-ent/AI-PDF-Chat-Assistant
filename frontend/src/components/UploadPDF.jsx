import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import api from "../services/api";

function UploadPDF({ setUploaded }) {

    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);

    const uploadPDF = async () => {

        if (!file) {

            alert("Choose a PDF");

            return;

        }

        const formData = new FormData();

        formData.append("file", file);

        try {

            setLoading(true);

            await api.post("/upload", formData, {

                headers: {

                    "Content-Type": "multipart/form-data"

                }

            });

            setUploaded(true);

        }

        catch (err) {

            console.log(err);

            alert("Upload Failed");

        }

        setLoading(false);

    };

    return (

        <div className="upload-card">

            <FaFilePdf className="pdf-icon"/>

            <h2>Upload PDF</h2>

            <p>

                Upload your document and ask AI anything.

            </p>

            <input

                type="file"

                accept=".pdf"

                onChange={(e)=>setFile(e.target.files[0])}

            />

            {

                file &&

                <p className="filename">

                    📄{file.name}

                </p>

            }

            <button onClick={uploadPDF}>

                {

                    loading

                    ?

                    "Uploading..."

                    :

                    "Upload PDF"

                }

            </button>

        </div>

    );

}

export default UploadPDF;