function Message({ question, answer }) {

    return (

        <div className="message">

            <div className="user-message">

                <strong>You:</strong>

                <p>{question}</p>

            </div>

            <div className="ai-message">

                <strong>AI:</strong>

                <p>{answer}</p>

            </div>

            <hr />

        </div>

    );

}

export default Message;