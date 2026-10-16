'use client';
import React, { useState } from 'react';

// Sample message data.
// Typically, this would come from an API or a real-time database.
const initialMessages = [
  { id: 1, text: "សូមស្វាគមន៍! តើខ្ញុំអាចជួយអ្វីបាន?", time: "11:00", sender: "other" },
  { id: 2, text: "ខ្ញុំចង់សួរអំពីតម្លៃសេវាកម្ម។", time: "11:10", sender: "self" },
  { id: 3, text: "បាទ, សេវាកម្មរបស់យើងមានបីប្រភេទ...", time: "11:15", sender: "other" },
  { id: 4, text: "តើប្រភេទទី២ មានអត្ថប្រយោជន៍អ្វីខ្លះ?", time: "11:20", sender: "self" },
];

export default function ChatWindow() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Create the new message object
    const msgToAdd = {
      id: Date.now(),
      text: newMessage,
      // Get current time in HH:MM format
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      sender: "self", // Messages sent by this form are from the user
    };

    // Add the new message to the list
    setMessages([...messages, msgToAdd]);

    // Send message logic (for API, etc.) would go here
    console.log('Sending message:', newMessage);

    // Clear the input field
    setNewMessage('');
  };

  return (
    // MAIN CONTAINER (The full blue window, now Royal Blue)
    <div className="bg-[#1D4ED8] border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md mx-auto flex flex-col h-[600px] overflow-hidden transition-all duration-300">
      
      {/* 1. BLUE HEADER SECTION */}
      <div className="p-5 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-inner">
            <span className="text-2xl font-bold text-[#1D4ED8]">JD</span>
          </div>
          
          {/* User Info */}
          <div>
            <h2 className="text-lg font-bold">Jane Doe, manager</h2>
            <p className="text-sm font-medium opacity-80">online</p>
          </div>
        </div>
        
        {/* Close Button */}
        <button className="p-2 opacity-70 hover:opacity-100 transition-opacity">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      {/* 2. MESSAGES AREA (White scrollable area) */}
      <div className="bg-white flex-1 p-6 space-y-6 overflow-y-auto rounded-t-[32px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'self' ? 'justify-end' : ''}`}>
            
            {/* OTHER SENDER MESSAGES (Left, Light Grey) */}
            {msg.sender === 'other' && (
              <>
                <div className="relative bg-[#E8E8E8] text-slate-800 p-4 rounded-2xl rounded-bl-none max-w-[70%] text-sm font-medium shadow-sm">
                  {/* Speech Bubble Pointer */}
                  <div className="absolute -left-2 bottom-0 w-3 h-3 bg-[#E8E8E8] rounded-bl-full transform rotate-45"></div>
                  {msg.text}
                </div>
                <span className="text-xs font-bold text-slate-300 pb-1">{msg.time}</span>
              </>
            )}

            {/* SELF MESSAGES (Right, Deep Blue) */}
            {msg.sender === 'self' && (
              <>
                <span className="text-xs font-bold text-[#1D4ED8] pb-1">{msg.time}</span>
                <div className="relative bg-[#1D4ED8] text-white p-4 rounded-2xl rounded-br-none max-w-[70%] text-sm font-medium shadow-sm">
                  {/* Speech Bubble Pointer */}
                  <div className="absolute -right-2 bottom-0 w-3 h-3 bg-[#1D4ED8] rounded-br-full transform rotate-45"></div>
                  {msg.text}
                </div>
              </>
            )}
            
          </div>
        ))}
      </div>

      {/* 3. INPUT FORM */}
      <div className="bg-white p-4 border-t border-slate-100 mt-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          
          {/* Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="វាយបញ្ចូលសាររបស់អ្នកទីនេះ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-[#1D4ED8] transition"
            />
          </div>

          {/* Send Button (Now Deep Blue) */}
          <button
            type="submit"
            className="inline-flex items-center justify-center bg-[#1D4ED8] hover:bg-[#1A56D1] text-white font-medium px-6 py-3 rounded-full transition shadow-sm hover:shadow active:scale-95"
          >
            <span>បញ្ជូន</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-4 h-4 ml-1.5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.93.75.75 0 0 0 0-1.614A60.521 60.521 0 0 0 3.478 2.404Z" />
            </svg>
          </button>

        </form>
      </div>

    </div>
  );
}