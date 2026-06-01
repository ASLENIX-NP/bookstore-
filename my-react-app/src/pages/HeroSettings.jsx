import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HeroSettings() {
  const [images, setImages] = useState({
    backgroundImage: null,
    slider1: null,
    slider2: null,
    slider3: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/admin/hero"
        );
  
        setImages({
          backgroundImage: data.backgroundImage || null,
          slider1: data.sliderImages?.[0] || null,
          slider2: data.sliderImages?.[1] || null,
          slider3: data.sliderImages?.[2] || null,
        });
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchHeroImages();
  }, []);

  // 2. SAVE: Sends the file to your backend to be saved permanently
  const saveHero = async () => {
    setLoading(true);
    const formData = new FormData();
    
    // Only append if the user selected a new file
    Object.keys(images).forEach((key) => {
      if (images[key] instanceof File) {
        formData.append(key, images[key]);
      }
    });

    try {
      await axios.put("http://localhost:5000/api/admin/hero", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Hero section saved successfully!");
    } catch (error) {
      toast.error("Failed to save images");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ title, imgKey }) => (
    <div className="space-y-2">
      <label className="font-bold text-gray-700">{title}</label>
      <label className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer overflow-hidden relative">
        {images[imgKey] ? (
          <img 
            // If it's a new file, use URL.createObjectURL. If it's saved data, use the server path.
            src={
                images[imgKey] instanceof File
                  ? URL.createObjectURL(images[imgKey])
                  : images[imgKey]
              }
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Click to Upload</span>
        )}
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => setImages({ ...images, [imgKey]: e.target.files[0] })} 
        />
      </label>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-5xl">
        <h2 className="text-2xl font-bold mb-6">Hero Settings</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <UploadBox title="Background Image" imgKey="backgroundImage" />
          <UploadBox title="Slider Image 1" imgKey="slider1" />
          <UploadBox title="Slider Image 2" imgKey="slider2" />
          <UploadBox title="Slider Image 3" imgKey="slider3" />
        </div>

        <button 
          onClick={saveHero} 
          disabled={loading}
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold w-full md:w-auto"
        >
          {loading ? "Saving..." : "Save Hero Section"}
        </button>
      </div>
    </div>
  );
}