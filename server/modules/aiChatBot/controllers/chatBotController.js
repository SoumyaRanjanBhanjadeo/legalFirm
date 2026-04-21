const chatResponses = {
    "hours": "We are open Monday to Friday, 9:00 AM to 6:00 PM. We are closed on weekends and public holidays.",
    "location": "Our office is located at Buxi Bazar, Cuttack, Odisha, India.",
    "services": "We provide expert legal services in Corporate Law, Family Law, Criminal Defense, Real Estate, and Intellectual Property.",
    "appointment": "To book an appointment, please call us at +91 9876543210 or use the 'Contact Us' section on our website.",
    "cost": "Consultation fees vary depending on the case type. Our initial 30-minute consultation starts at ₹1000.",
    "documents": "For your first meeting, please bring any relevant identification, contracts, or court documents related to your case.",
    "emergency": "For urgent legal matters outside of office hours, please leave a message on our emergency line at +91 9876543210.",
    "hello": "Hello! I am your Legal Firm AI Assistant. How can I help you today?",
    "hi": "Hi there! How can I assist you with your legal inquiries today?",
    "thanks": "You're very welcome! Is there anything else I can help you with?",
    "thank you": "My pleasure! I'm here if you need anything else."
};

const dynamicResponses = [
    "That's a very interesting point! While I'm still learning about specific case details, I'm sure our legal team would love to discuss this with you. Would you like our contact info?",
    "I appreciate you sharing that with me. It sounds important! For a detailed analysis, I recommend speaking directly with one of our specialized attorneys.",
    "I'm here to help as best as I can! For this specific inquiry, our human experts are better equipped to provide the precise legal advice you need.",
    "That's a great question! I'm currently optimized for firm-related information, but I can certainly help you get in touch with the right person to answer that.",
    "I'm glad you asked! Helping you feel informed is my top priority. For matters like this, a direct consultation would be the most beneficial next step."
];

/**
 * @desc    Process chatbot message
 * @route   POST /api/v1/chatbot/chat
 * @access  Private
 */
const processChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please provide a message."
            });
        }

        const normalizedMessage = message.toLowerCase().trim();
        let botResponse = "";

        // Check for static matches
        for (const [key, response] of Object.entries(chatResponses)) {
            if (normalizedMessage.includes(key)) {
                botResponse = response;
                break;
            }
        }

        // Fallback to dynamic "good-feeling" response
        if (!botResponse) {
            const randomIndex = Math.floor(Math.random() * dynamicResponses.length);
            botResponse = dynamicResponses[randomIndex];
        }

        res.status(200).json({
            success: true,
            data: {
                message: botResponse,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error("ChatBot Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your message."
        });
    }
};

module.exports = {
    processChatMessage
};
