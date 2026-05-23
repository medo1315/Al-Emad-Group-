import { useLanguage } from "../context/LanguageContext";
import { Mail, Phone, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OliveBranchDecor } from "../components/OliveBranchDecor";

export function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("contactToastSuccess"));
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [

    {
      icon: Phone,
      title: t("contactInfo2Title"),
      content: t("contactInfo2Desc"),
      subContent: t("contactInfo2Sub"),
    },
    {
      icon: Mail,
      title: t("contactInfo3Title"),
      content: t("contactInfo3Desc"),
    },
    {
      icon: Clock,
      title: t("contactInfo4Title"),
      content: t("contactInfo4Desc"),
      subContent: t("contactInfo4Sub"),
    },
  ];

  return (
    <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12 relative overflow-hidden">
      <OliveBranchDecor className="absolute top-20 right-10 w-32 h-32 text-sage-green opacity-10" />
      <OliveBranchDecor className="absolute bottom-20 left-10 w-40 h-40 text-teal-accent opacity-10 rotate-180" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl lg:text-6xl text-white mb-4">
            {t("contact")}
          </h1>
          <p className="text-lg text-sage-green-light max-w-2xl mx-auto">
            {t("contactSubtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-teal-accent/30 shadow-xl">
            <h2 className="font-display text-3xl text-white mb-6">
              {t("contactFormTitle")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">{t("contactYourName")}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50"
                  placeholder={t("contactPlaceholderName")}
                />
              </div>

              <div>
                <label className="block text-white mb-2">{t("contactEmail")}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50"
                  placeholder={t("contactPlaceholderEmail")}
                />
              </div>

              <div>
                <label className="block text-white mb-2">{t("contactSubject")}</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50"
                  placeholder={t("contactPlaceholderSubject")}
                />
              </div>

              <div>
                <label className="block text-white mb-2">{t("contactMessage")}</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 resize-none"
                  placeholder={t("contactPlaceholderMessage")}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                <span>{t("contactSendMessage")}</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/30 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-olive-green to-sage-green rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white mb-2">
                        {info.title}
                      </h3>
                      <p className="text-white/90 mb-1">{info.content}</p>
                      <p className="text-sm text-sage-green-light">{info.subContent}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Section */}

      </div>
    </div>
  );
}
