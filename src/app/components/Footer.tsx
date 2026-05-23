import { Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logoImage from "../../imports/logo.png";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-petroleum-dark via-dark-olive to-olive-green-dark text-white mt-20">
      {/* Olive Branch Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-teal-accent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="AL EMAD GROUP"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="font-display text-xl">AL EMAD GROUP</h3>
                <p className="text-xs text-teal-accent">{t("establishedForOlives")}</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-sans">
              {t("heritageDesc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4">{t("footerQuickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-teal-accent transition-colors font-medium">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-white/70 hover:text-teal-accent transition-colors font-medium">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-teal-accent transition-colors font-medium">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-teal-accent transition-colors font-medium">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg mb-4">{t("footerContactUs")}</h4>
            <ul className="space-y-3">

              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 flex-shrink-0 text-teal-accent" />
                <span className="font-sans">{t("contactInfo2Desc")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 flex-shrink-0 text-teal-accent" />
                <span className="font-sans">{t("contactInfo3Desc")}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-teal-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">{t("copyrights")}</p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/share/1FaRk7XJG4/?mibextid=wwXIfr"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-accent flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/alemad_group?igsh=MTM3cXg5NmlzcXltMQ%3D%3D&utm_source=qr"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-accent flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>


          </div>
        </div>
      </div>
    </footer>
  );
}
