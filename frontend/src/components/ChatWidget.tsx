import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: '¡Hola! ¿En qué puedo ayudarte? Puedes preguntarme sobre precios, horarios o servicios.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Lógica simple de bot
    setTimeout(() => {
      let botResponse = "No entiendo tu consulta. Puedes preguntarme sobre 'precios', 'horarios', 'servicios' o 'ubicación'.";
      const lowerInput = userMsg.toLowerCase();
      
      if (lowerInput.includes('precio') || lowerInput.includes('cuanto') || lowerInput.includes('costo')) {
        botResponse = "Los precios varían según el servicio. Por ejemplo, el corte clásico cuesta $15. Puedes ver todos al presionar 'Pedir Turno'.";
      } else if (lowerInput.includes('horario') || lowerInput.includes('abierto')) {
        botResponse = "Atiendo de Lunes a Sábado, de 9:00 AM a 7:00 PM.";
      } else if (lowerInput.includes('servicio') || lowerInput.includes('hacen')) {
        botResponse = "Ofrecemos Cortes, Perfilado de Barba, Tinte y más.";
      } else if (lowerInput.includes('ubicacion') || lowerInput.includes('donde')) {
        botResponse = "Nos encontramos en el centro de la ciudad, en la Calle Principal 123.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-dark-paper border border-gray-700 w-80 h-96 rounded-lg shadow-xl flex flex-col">
          <div className="bg-primary p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-bold text-white">Consultas</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg max-w-[85%] ${m.sender === 'user' ? 'bg-gray-700 self-end text-white' : 'bg-gray-800 self-start text-gray-200'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-700 flex">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-dark text-white rounded-l px-3 py-2 outline-none focus:border focus:border-primary"
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={handleSend} className="bg-primary px-4 py-2 rounded-r text-white font-bold">
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
