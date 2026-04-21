import api from './api';

/**
 * Send a message to the AI ChatBot
 * @param {string} message - The user message
 * @returns {Promise<Object>} - The response from the chatbot
 */
export const sendChatMessage = async (message) => {
    try {
        const response = await api.post('/chatbot/chat', { message });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default {
    sendChatMessage
};
