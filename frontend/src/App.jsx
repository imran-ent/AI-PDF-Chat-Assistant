import { useState } from "react";

import Navbar from "./components/Navbar";
import UploadPDF from "./components/UploadPDF";
import ChatBox from "./components/ChatBox";

function App() {

    const [uploaded, setUploaded] = useState(false);

    return (
        <div>

            <Navbar />

            <UploadPDF
                setUploaded={setUploaded}
            />

            {
                uploaded && (
                    <ChatBox />
                )
            }

        </div>
    );

}

export default App;