import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

import api from "../services/api";
import Message from "./Message";
import Loader from "./Loader";

function ChatBox() {

    const [question, setQuestion] = useState("");

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);

    const askQuestion = async () => {

        if (!question.trim()) return;

        setLoading(true);

        try {

            const response = await api.post("/ask", {
                question,
            });

            setMessages((prev) => [
                ...prev,
                {
                    question,
                    answer: response.data.answer,
                },
            ]);

            setQuestion("");

        } catch (error) {

            console.error(error);

            alert("Unable to get AI response.");

        }

        setLoading(false);

    };

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            askQuestion();

        }

    };

    return (

        <div className="chat">

            <h2>Chat with your PDF</h2>

            <div className="messages">

                {messages.map((message, index) => (

                    <Message
                        key={index}
                        question={message.question}
                        answer={message.answer}
                    />

                ))}

                {loading && <Loader />}

                <div ref={messagesEndRef}></div>

            </div>

            <input
                type="text"
                placeholder="Ask anything from your PDF..."
                value={question}
                disabled={loading}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
            />

            <button
                onClick={askQuestion}
                disabled={loading}
            >
                <FaPaperPlane />

                <span style={{marginLeft:"8px"}}>
                    Send
                </span>

            </button>

        </div>

    );

}

export default ChatBox;