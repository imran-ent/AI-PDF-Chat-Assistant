function Message({ question, answer }) {

    return (

        <>

           <div className="user-message">
    <strong>You</strong>
    <p>{question}</p>
</div>

<div className="ai-message">
    <strong>AI Assistant</strong>
    <p>{answer}</p>
</div>

        </>

    );

}

export default Message;