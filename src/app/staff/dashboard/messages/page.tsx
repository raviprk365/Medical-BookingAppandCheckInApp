'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Filter,
  MoreVertical,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: 'patient-1',
    lastMessage: 'Thank you for the reminder about my appointment tomorrow.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unread: false,
    type: 'patient' as const,
    phone: '+61234567890',
    email: 'john.doe@example.com'
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    patientId: 'patient-2',
    lastMessage: 'I need to reschedule my appointment for next week.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: true,
    type: 'patient' as const,
    phone: '+61234567892',
    email: 'sarah.johnson@example.com'
  },
  {
    id: '3',
    patientName: 'System',
    patientId: 'system',
    lastMessage: 'Appointment reminder sent to 15 patients for tomorrow.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    unread: false,
    type: 'system' as const
  }
];

const mockMessages = [
  {
    id: '1',
    conversationId: '1',
    sender: 'staff',
    content: 'Hi John, this is a reminder about your appointment tomorrow at 9:00 AM with Dr. Sarah Chen.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'delivered'
  },
  {
    id: '2',
    conversationId: '1',
    sender: 'patient',
    content: 'Thank you for the reminder about my appointment tomorrow.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'read'
  }
];

const messageTemplates = [
  {
    id: '1',
    name: 'Appointment Reminder',
    content: 'Hi {patientName}, this is a reminder about your appointment on {date} at {time} with {doctor}. Please arrive 15 minutes early.'
  },
  {
    id: '2',
    name: 'Appointment Confirmation',
    content: 'Your appointment has been confirmed for {date} at {time} with {doctor}. If you need to reschedule, please call us at least 24 hours in advance.'
  },
  {
    id: '3',
    name: 'Delay Notification',
    content: 'We apologize for the delay. Your appointment with {doctor} is running approximately {delay} minutes behind schedule. Thank you for your patience.'
  },
  {
    id: '4',
    name: 'Follow-up Required',
    content: 'Please bring your Medicare card and any recent test results to your appointment. If you have any questions, please don\'t hesitate to contact us.'
  }
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredConversations = mockConversations.filter(conversation => {
    const matchesSearch = conversation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = messageFilter === 'all' ||
                         (messageFilter === 'unread' && conversation.unread) ||
                         (messageFilter === 'patients' && conversation.type === 'patient') ||
                         (messageFilter === 'system' && conversation.type === 'system');
    
    return matchesSearch && matchesFilter;
  });

  const conversationMessages = mockMessages.filter(msg => msg.conversationId === selectedConversation.id);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    console.log('Sending message:', newMessage);
    // Implement message sending logic
    setNewMessage('');
  };

  const handleUseTemplate = (template: any) => {
    setNewMessage(template.content);
    setShowTemplates(false);
  };

  const unreadCount = mockConversations.filter(c => c.unread).length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Messages
                {unreadCount > 0 && (
                  <Badge className="bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Patient communications and notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Send Bulk
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter messages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="patients">Patient Messages</SelectItem>
                  <SelectItem value="system">System Notifications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-1">
                        <AvatarFallback>
                          {conversation.type === 'system' ? 'SYS' : 
                           conversation.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium text-sm truncate ${
                            conversation.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {conversation.patientName}
                          </h3>
                          <div className="flex items-center gap-1">
                            {conversation.unread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {format(conversation.timestamp, 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        
                        <p className={`text-xs truncate ${
                          conversation.unread ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={conversation.type === 'system' ? 'secondary' : 'outline'} className="text-xs">
                            {conversation.type}
                          </Badge>
                          {conversation.type === 'patient' && (
                            <div className="flex gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <Mail className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {/* Conversation Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedConversation.type === 'system' ? 'SYS' : 
                       selectedConversation.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation.patientName}</h2>
                    {selectedConversation.type === 'patient' && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedConversation.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedConversation.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedConversation.type === 'patient' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No messages in this conversation</p>
                </div>
              ) : (
                conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'staff'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.sender === 'staff' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{format(message.timestamp, 'h:mm a')}</span>
                        {message.sender === 'staff' && (
                          <div className="flex items-center gap-1">
                            {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                            {message.status === 'read' && <CheckCircle className="h-3 w-3 text-green-300" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            {selectedConversation.type === 'patient' && (
              <div className="bg-white border-t border-gray-200 p-4">
                {showTemplates && (
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Message Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {messageTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            size="sm"
                            className="h-auto p-3 text-left justify-start"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <div>
                              <div className="font-medium text-xs">{template.name}</div>
                              <div className="text-xs text-gray-600 mt-1 truncate">
                                {template.content.substring(0, 50)}...
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                    >
                      Templates
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
