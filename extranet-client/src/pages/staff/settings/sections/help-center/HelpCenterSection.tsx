import React from 'react';
import { 
    HelpCircle, 
    MessageSquare, 
    Book, 
    Mail, 
    ExternalLink,
    ChevronDown
} from 'lucide-react';

const HelpCenterSection: React.FC = () => {
    const faqs = [
        {
            question: "How do I update my branch information?",
            answer: "You can update branch details by navigating to the Branch Management section or contacting your administrator."
        },
        {
            question: "How do I process a refund?",
            answer: "Refunds can be processed through the Order History section. Select the order and click on the 'Process Refund' button."
        },
        {
            question: "Can I customize the menu display?",
            answer: "Yes, menu customization options are available in the Printer & Menu settings under the Preferences tab."
        }
    ];

    return (
        <div className="settings-section">
            <div className="help-center-header">
                <h2 className="section-title">Help Center</h2>
                <p className="section-description">Find answers to common questions and get support.</p>
            </div>

            <div className="settings-sub-section">
                <h3 className="sub-section-title">
                    <Book size={18} className="mr-2" />
                    Frequently Asked Questions
                </h3>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <details>
                                <summary className="faq-question">
                                    {faq.question}
                                    <ChevronDown size={16} className="chevron" />
                                </summary>
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </div>

            <div className="settings-sub-section">
                <h3 className="sub-section-title">
                    <MessageSquare size={18} className="mr-2" />
                    Contact Support
                </h3>
                <div className="contact-cards">
                    <div className="contact-card">
                        <Mail className="card-icon" />
                        <div className="card-content">
                            <h4>Email Support</h4>
                            <p>Get in touch via email</p>
                            <a href="mailto:support@goscanmenu.com" className="contact-link">support@goscanmenu.com</a>
                        </div>
                    </div>
                    <div className="contact-card">
                        <HelpCircle className="card-icon" />
                        <div className="card-content">
                            <h4>Documentation</h4>
                            <p>Read our full guide</p>
                            <a href="#" className="contact-link">
                                Open Docs <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterSection;
