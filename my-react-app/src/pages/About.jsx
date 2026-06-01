import React, { useEffect, useState } from 'react';
import {
  Heart,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Quote,
  CheckCircle2,
  Library,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";

const defaultAboutContent = {
  title: "A community built around books, learning, and creativity.",
  content: `We bring together quality books, fine stationery, and a friendly local store experience for readers, students, writers, and families.

PatraPatrika Center is dedicated to providing books, magazines, newspapers, educational materials, and stationery items to readers, students, and families.

Our goal is to make reading materials and learning essentials easily available through a simple online shopping experience.`,
};

const About = () => {
  const [aboutContent, setAboutContent] = useState(defaultAboutContent);
  const [contentLoading, setContentLoading] = useState(true);

  const [heroData, setHeroData] = useState({
    backgroundImage: "",
    sliderImages: [],
  });

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/policies/aboutPage"
        );

        const data = await response.json();

        if (data.success && data.policy) {
          setAboutContent({
            title: data.policy.title || defaultAboutContent.title,
            content: data.policy.content || defaultAboutContent.content,
          });
        }
      } catch (error) {
        console.error("About content fetch error:", error);
      } finally {
        setContentLoading(false);
      }
    };

    const fetchHeroBackground = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/hero");
        const data = await response.json();

        setHeroData(data);
      } catch (error) {
        console.error("Hero background fetch error:", error);
      }
    };

    fetchAboutContent();
    fetchHeroBackground();
  }, []);

  const heroBackgroundImage =
    heroData.backgroundImage || heroData.sliderImages?.[0] || "";

  const heroBackgroundStyle = heroBackgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.94), rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.82)), url("${heroBackgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  const stats = [
    {
      label: "Books Sold",
      value: "50k+",
      icon: <BookOpen className="w-7 h-7 text-indigo-600" />,
    },
    {
      label: "Happy Readers",
      value: "12k+",
      icon: <Users className="w-7 h-7 text-indigo-600" />,
    },
    {
      label: "Years Experience",
      value: "15+",
      icon: <Award className="w-7 h-7 text-indigo-600" />,
    },
    {
      label: "Community Events",
      value: "200+",
      icon: <Heart className="w-7 h-7 text-indigo-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 animate-in fade-in duration-700">
      {/* Hero Header */}
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={heroBackgroundStyle}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.25),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-bold text-indigo-100 mb-6">
              <Sparkles className="w-4 h-4 text-orange-300" />
              About Our Bookstore
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              {aboutContent.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mt-5 leading-relaxed">
              We bring together quality books, fine stationery, and a friendly
              local store experience for readers, students, writers, and
              families.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <Library className="w-4 h-4" />
              Our Story
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-950 leading-tight">
              Bringing the Joy of Reading to Our Community Since 2011
            </h1>

            <div className="space-y-5 text-gray-600 leading-relaxed text-base">
              {contentLoading ? (
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading about content...
                </div>
              ) : (
                <div className="whitespace-pre-line">
                  {aboutContent.content}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-gray-900 text-sm">
                    Carefully Selected Items
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Books and stationery chosen for quality and usefulness.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-gray-900 text-sm">
                    Reader-Focused Service
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Helping every customer find the right book or item.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 bg-gradient-to-br from-indigo-200/70 to-orange-200/60 rounded-[2.5rem] blur-2xl" />

            <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-100">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"
                className="rounded-[1.5rem] shadow-sm object-cover h-[440px] w-full"
              />
            </div>

            <div className="absolute -bottom-7 -left-4 sm:-left-7 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden sm:block">
              <p className="text-indigo-600 font-black text-3xl">15+</p>
              <p className="text-gray-500 text-sm font-bold">
                Years of Passion
              </p>
            </div>

            <div className="absolute -top-6 -right-4 sm:-right-6 bg-slate-950 text-white p-5 rounded-2xl shadow-2xl hidden sm:block">
              <BookOpen className="w-7 h-7 text-orange-300 mb-2" />
              <p className="text-sm font-black">Books & Stationery</p>
              <p className="text-xs text-slate-300">All in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden text-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>

                <p className="text-3xl md:text-4xl font-black text-gray-950">
                  {stat.value}
                </p>

                <p className="text-gray-500 text-xs sm:text-sm font-black uppercase tracking-wide mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] p-8 shadow-xl">
            <BookOpen className="w-9 h-9 text-indigo-100 mb-5" />
            <h3 className="text-xl font-black mb-3">For Readers</h3>
            <p className="text-indigo-100 leading-relaxed">
              We support curious minds with books that inspire learning,
              imagination, and personal growth.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all">
            <PenIcon />
            <h3 className="text-xl font-black text-gray-950 mb-3">
              For Students
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Academic materials, notebooks, guides, and stationery essentials
              for everyday study.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all">
            <Heart className="w-9 h-9 text-orange-500 mb-5" />
            <h3 className="text-xl font-black text-gray-950 mb-3">
              For Community
            </h3>
            <p className="text-gray-600 leading-relaxed">
              A friendly local space where stories, learning, and creativity
              come together.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2" />

          <div className="relative">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
              <Quote className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-950">
              Our Core Mission
            </h2>

            <p className="text-gray-600 text-lg md:text-xl italic leading-relaxed mt-6">
              "To provide a sanctuary for the curious mind and a home for every
              story written, ensuring that quality literature and fine
              stationery are accessible to everyone in our community."
            </p>

            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 to-orange-500 mx-auto rounded-full mt-8" />
          </div>
        </div>
      </section>
    </div>
  );
};

const PenIcon = () => (
  <div className="w-9 h-9 text-indigo-600 mb-5">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-9 h-9"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  </div>
);

export default About;