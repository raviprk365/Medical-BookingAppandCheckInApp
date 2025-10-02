'use client';

import { useState, useEffect } from 'react';

// Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'staff' | 'patient' | 'system';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'reminder' | 'reply' | 'request' | 'notification';
}

export interface Conversation {
  id: string;
  patientId: string | null;
  staffId: string;
  type: 'patient' | 'system';
  lastMessageId: string;
  lastActivity: string;
  unread: boolean;
  subject: string;
  status: 'active' | 'archived';
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'reminder' | 'confirmation' | 'notification' | 'instruction';
  variables: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// Base API URL
const API_BASE = 'http://localhost:3001';

// Custom hook for fetching conversations with messages
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [conversationsRes, messagesRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE}/conversations`),
        fetch(`${API_BASE}/messages`),
        fetch(`${API_BASE}/patients`)
      ]);

      if (!conversationsRes.ok || !messagesRes.ok || !patientsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [conversationsData, messagesData, patientsData] = await Promise.all([
        conversationsRes.json(),
        messagesRes.json(),
        patientsRes.json()
      ]);

      setConversations(conversationsData);
      setMessages(messagesData);
      setPatients(patientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get enriched conversations with patient data and last message
  const enrichedConversations = conversations.map(conversation => {
    const patient = patients.find(p => p.id === conversation.patientId);
    const lastMessage = messages.find(m => m.id === conversation.lastMessageId);
    
    return {
      ...conversation,
      patientName: conversation.type === 'system' ? 'System' : 
                  patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
      patientPhone: patient?.phone,
      patientEmail: patient?.email,
      lastMessage: lastMessage?.content || 'No messages',
      timestamp: new Date(conversation.lastActivity)
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent

  // Get messages for a specific conversation
  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const newMessage = {
        conversationId,
        senderId: 'staff-1', // In real app, this would come from auth
        senderType: 'staff' as const,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent' as const,
        messageType: 'reply' as const
      };

      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const savedMessage = await response.json();

      // Update conversation last activity
      await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastMessageId: savedMessage.id,
          lastActivity: new Date().toISOString(),
          unread: false
        }),
      });

      // Refresh data
      fetchData();
      return savedMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unread: false }),
      });

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  return {
    conversations: enrichedConversations,
    messages,
    patients,
    loading,
    error,
    refetch: fetchData,
    getConversationMessages,
    sendMessage,
    markAsRead
  };
}

// Custom hook for message templates
export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/messageTemplates`);
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const templatesData = await response.json();
        setTemplates(templatesData.filter((t: MessageTemplate) => t.isActive));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
}

// Custom hook for message analytics
export function useMessageAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    unreadCount: 0,
    todaysMessages: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [conversationsRes, messagesRes] = await Promise.all([
          fetch(`${API_BASE}/conversations`),
          fetch(`${API_BASE}/messages`)
        ]);

        if (!conversationsRes.ok || !messagesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [conversations, messages] = await Promise.all([
          conversationsRes.json(),
          messagesRes.json()
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaysMessages = messages.filter((msg: Message) => 
          msg.timestamp.startsWith(today)
        ).length;

        const unreadCount = conversations.filter((conv: Conversation) => 
          conv.unread && conv.type === 'patient'
        ).length;

        // Calculate response rate (messages replied to within 24 hours)
        const patientMessages = messages.filter((msg: Message) => 
          msg.senderType === 'patient'
        );
        const respondedMessages = patientMessages.filter((msg: Message) => {
          const replies = messages.filter((reply: Message) => 
            reply.conversationId === msg.conversationId &&
            reply.senderType === 'staff' &&
            new Date(reply.timestamp).getTime() > new Date(msg.timestamp).getTime() &&
            new Date(reply.timestamp).getTime() - new Date(msg.timestamp).getTime() <= 24 * 60 * 60 * 1000
          );
          return replies.length > 0;
        });

        const responseRate = patientMessages.length > 0 
          ? Math.round((respondedMessages.length / patientMessages.length) * 100)
          : 0;

        setAnalytics({
          totalConversations: conversations.length,
          unreadCount,
          todaysMessages,
          responseRate
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { analytics, loading, error };
}
