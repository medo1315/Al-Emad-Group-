import { Award, Leaf, Heart, Globe, TreePine } from "lucide-react";
import { OliveBranchDecor } from "../components/OliveBranchDecor";
import { useLanguage } from "../context/LanguageContext";

export function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Leaf,
      title: t("aboutVal1Title"),
      description: t("aboutVal1Desc"),
    },
    {
      icon: Award,
      title: t("aboutVal2Title"),
      description: t("aboutVal2Desc"),
    },
    {
      icon: Heart,
      title: t("aboutVal3Title"),
      description: t("aboutVal3Desc"),
    },
    {
      icon: Globe,
      title: t("aboutVal4Title"),
      description: t("aboutVal4Desc"),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-dark-olive to-petroleum-dark">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-green/10 via-petroleum-dark/30 to-sage-green/10"></div>
        <OliveBranchDecor className="absolute top-10 left-10 w-40 h-40 text-olive-green opacity-10 hidden lg:block" />
        <OliveBranchDecor className="absolute bottom-10 right-10 w-48 h-48 text-sage-green opacity-10 hidden lg:block rotate-45" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-petroleum-blue/30 backdrop-blur-md rounded-full border border-olive-green/20 mb-6">
            <TreePine className="w-4 h-4 text-olive-green" />
            <span className="text-sm text-olive-green">{t("aboutBadge")}</span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl text-white mb-6">
            {t("aboutTitle")}
          </h1>
          <p className="text-xl text-sage-green-light max-w-3xl mx-auto leading-relaxed">
            {t("aboutSubtitle")}
          </p>
        </div>
      </section>

      {/* Image & Text Section */}
      <section className="py-20 bg-petroleum-blue/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-sage-green/20 rounded-full blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1591122523233-22037c1dec9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                alt="Olive Grove"
                className="relative z-10 rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-display text-4xl lg:text-5xl text-white">
                {t("aboutSecTitle")}
              </h2>
              <p className="text-lg text-sage-green-light leading-relaxed">
                {t("aboutSecDesc1")}
              </p>
              <p className="text-lg text-sage-green-light leading-relaxed">
                {t("aboutSecDesc2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-4">
              {t("aboutValuesTitle")}
            </h2>
            <p className="text-lg text-sage-green-light max-w-2xl mx-auto">
              {t("aboutValuesSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-8 border border-border hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-olive-green to-sage-green rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sage-green-light leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}


      {/* Team Section */}

    </div>
  );
}
