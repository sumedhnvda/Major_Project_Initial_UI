import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface TextInputProps {
  onSendMessage: (message: string) => void;
}

const TextInput = ({ onSendMessage }: TextInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-cream-50 rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-gray-700 font-medium mb-3">Or type your message</h3>
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full border border-cream-300 focus:border-light-red-300 focus:ring focus:ring-light-red-100 focus:ring-opacity-50 outline-none transition-all"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <button 
          type="submit"
          className="w-10 h-10 bg-light-red-500 hover:bg-light-red-600 rounded-full flex items-center justify-center transition-colors"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>
    </div>
  );
};

export default TextInput;