
import { supabase } from '@/integrations/supabase/client';

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
  updated_at: string;
}

export const submitContactMessage = async (messageData: ContactMessageData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: messageData.name,
        email: messageData.email,
        subject: messageData.subject,
        message: messageData.message,
        status: 'unread'
      });

    if (error) {
      console.error('Error submitting contact message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in submitContactMessage:', error);
    throw new Error('Failed to submit contact message');
  }
};

export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }

    // Type assertion to ensure status is properly typed
    return (data || []).map(message => ({
      ...message,
      status: message.status as 'unread' | 'read'
    }));
  } catch (error) {
    console.error('Error in getAllContactMessages:', error);
    throw new Error('Failed to fetch contact messages');
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .update({ 
        status: 'read',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    throw new Error('Failed to mark message as read');
  }
};
