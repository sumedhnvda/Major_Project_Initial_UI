

const ChatInterface = () => {
    return (
        <div className="flex flex-col h-[800px] w-full max-w-[1000px] mx-auto bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <iframe
                src="https://sumedhn-saraswati-llm.hf.space?__theme=light"
                frameBorder="0"
                width="100%"
                height="100%"
                title="Saraswati LLM Chat"
            ></iframe>
        </div>
    );
};

export default ChatInterface;
