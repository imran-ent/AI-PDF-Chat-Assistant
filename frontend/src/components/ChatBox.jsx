import { useState } from "react";
import axios from "axios";

import Message from "./Message";
import Loader from "./Loader";

function ChatBox() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const askQuestion = async () => {

        if (!question.trim()) return;

        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:8000/ask",
                {
                    question: question
                }
            );

            setMessages([
                ...messages,
                {
                    question: question,
                    answer: response.data.answer
                }
            ]);

            setQuestion("");

        } catch (error) {

            alert("Failed to get response from server.");

            console.error(error);

        }

        setLoading(false);
    };

    return (

        <div className="chat">

            <h2>Ask Questions</h2>

            <div className="messages">

                {
                    messages.map((message, index) => (

                        <Message
                            key={index}
                            question={message.question}
                            answer={message.answer}
                        />

                    ))
                }

            </div>

            {
                loading && <Loader />
            }

            <input
                type="text"
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />

            <button onClick={askQuestion}>
                Send
            </button>

        </div>

    );
}

export default ChatBox;