import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Ban, CheckCircle, ShieldAlert, X, MessageSquareOff } from 'lucide-react';
import { Message, UserAccount } from '../types';
import { sendMessage, subscribeToMessages, blockUser, unblockUser, subscribeToBlocks } from '../lib/db';

interface ChatBoxProps {
  currentUser: UserAccount;
  partnerId: string;
  partnerName: string;
  partnerRole: 'escort' | 'client';
  onClose: () => void;
}

export default function ChatBox({ currentUser, partnerId, partnerName, partnerRole, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false); // Am I blocked by them or have I blocked them?
  const [hasIBlockedThem, setHasIBlockedThem] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUser.id || !partnerId) return;

    const unsubscribe = subscribeToMessages(currentUser.id, partnerId, (fetched) => {
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [currentUser.id, partnerId]);

  // Subscribe to block lists to see if anyone blocked anyone
  useEffect(() => {
    const unsubscribe = subscribeToBlocks((blocks) => {
      // If I am escort: did I block this client?
      const blockedByMe = blocks.some(b => b.blockerId === currentUser.id && b.blockedId === partnerId);
      // If I am client: did this escort block me?
      const blockedByThem = blocks.some(b => b.blockerId === partnerId && b.blockedId === currentUser.id);

      setHasIBlockedThem(blockedByMe);
      setIsBlocked(blockedByThem || blockedByMe);
    });

    return () => unsubscribe();
  }, [currentUser.id, partnerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBlocked) return;

    try {
      await sendMessage({
        senderId: currentUser.id,
        receiverId: partnerId,
        senderName: currentUser.name || 'Anonymous',
        receiverName: partnerName,
        text: inputText.trim()
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleBlockToggle = async () => {
    try {
      if (hasIBlockedThem) {
        await unblockUser(currentUser.id, partnerId);
      } else {
        await blockUser(currentUser.id, partnerId);
      }
    } catch (err) {
      console.error('Failed to block/unblock:', err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-black border border-gold/25 rounded-2xl overflow-hidden shadow-2xl flex-1 md:flex-initial">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-mahogany-gloss border-b border-gold/15">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-r from-gold to-gold-bright rounded-full flex items-center justify-center font-serif font-bold text-sm text-black">
              {partnerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gold">{partnerName}</h4>
            <p className="text-[10px] text-leather-dark capitalize">{partnerRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Blocking Button only accessible/visible to Escorts */}
          {currentUser.role === 'escort' && (
            <button
              onClick={handleBlockToggle}
              title={hasIBlockedThem ? 'Unblock client' : 'Block client'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hasIBlockedThem
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  : 'text-leather-dark hover:text-red-400 hover:bg-black/40'
              }`}
            >
              <Ban className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-leather-dark hover:text-gold hover:bg-black/40 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/60">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 bg-black/50 text-gold-dark border border-gold/15 rounded-full flex items-center justify-center mb-2">
              <MessageSquareOff className="w-5 h-5" />
            </div>
            <p className="text-leather text-xs font-medium">No messages yet</p>
            <p className="text-leather-dark text-[10px] mt-1">Start chatting by typing your message below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-md transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-gold to-gold-bright text-black rounded-tr-none font-medium'
                      : 'bg-black/60 text-leather rounded-tl-none border border-gold/15'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <span className={`block text-[8px] text-right mt-1 ${isMe ? 'text-black/70' : 'text-leather-dark'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom controls / Inputs */}
      <div className="p-3 bg-black border-t border-gold/15">
        {isBlocked ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {hasIBlockedThem 
                ? 'You have blocked this client.' 
                : 'Messaging has been disabled by the companion.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message securely..."
              className="flex-1 bg-black border border-gold/20 rounded-xl px-3.5 py-2 text-xs text-leather focus:outline-none focus:border-gold/40"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-gold to-gold-bright text-black rounded-xl hover:shadow-lg hover:shadow-gold/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
