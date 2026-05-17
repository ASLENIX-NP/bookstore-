import React from 'react';
import { Heart, Users, Award, BookOpen } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";

const About = () => {
  const stats = [
    { label: "Books Sold", value: "50k+", icon: <BookOpen className="text-indigo-600" /> },
    { label: "Happy Readers", value: "12k+", icon: <Users className="text-indigo-600" /> },
    { label: "Years Experience", value: "15+", icon: <Award className="text-indigo-600" /> },
    { label: "Community Events", value: "200+", icon: <Heart className="text-indigo-600" /> },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Story Section */}
      <section className="py-20 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-[#6366F1] font-bold tracking-wider uppercase text-sm">Our Story</h2>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Bringing the Joy of Reading to Our Community Since 2011
            </h1>
            <p className="text-gray-600 leading-relaxed">
              BookHaven started as a small shelf in a local cafe. Today, we are the city's 
              premier destination for book lovers, writers, and stationery enthusiasts. 
              Our mission has always been simple: to curate a collection that inspires 
              creativity and fosters a lifelong love for literature.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that every book has a reader and every reader has a story. 
              Whether you are looking for a rare first edition or a simple journal 
              to start your morning thoughts, we are here to help you find it.
            </p>
          </div>
          <div className="relative">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800" 
              className="rounded-2xl shadow-2xl object-cover h-[400px] w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg hidden lg:block">
              <p className="text-[#6366F1] font-bold text-2xl">15+</p>
              <p className="text-gray-500 text-sm font-medium">Years of Passion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-10 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Our Core Mission</h2>
        <p className="text-gray-600 text-lg italic">
          "To provide a sanctuary for the curious mind and a home for every story 
          written, ensuring that quality literature and fine stationery are 
          accessible to everyone in our community."
        </p>
        <div className="w-20 h-1 bg-[#6366F1] mx-auto rounded-full"></div>
      </section>
    </div>
  );
};

export default About;