import React, { useState, useEffect, useRef } from 'react';
import { Subject, Message } from '../types';
import { getChatResponse, funnyGreetings } from '../services/geminiService';
import { ArrowUturnLeftIcon } from './Icons';
import { parseAndRenderText } from './CodeBlock';

interface ChatInterfaceProps {
  subject: Subject;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ subject, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define a saudação inicial de forma síncrona, sem chamada de API.
    const greeting = funnyGreetings[Math.floor(Math.random() * funnyGreetings.length)];
    setMessages([{ sender: 'ai', text: greeting }]);
    setIsLoading(false);
    setUserInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const history = newMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    const aiResponse = await getChatResponse(history, userInput, subject);
    
    setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 animate-fade-in">
       <button onClick={onBack} className="flex items-center gap-2 mb-4 text-purple-400 hover:text-purple-300 transition-colors self-start">
        <ArrowUturnLeftIcon className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <div className="prose prose-invert prose-sm text-white">{parseAndRenderText(msg.text)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-lg px-4 py-3 rounded-lg bg-gray-700 text-gray-200 flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400"></span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-purple-500">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Pergunte sobre ${subject.name}...`}
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-purple-600 text-white p-2 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;