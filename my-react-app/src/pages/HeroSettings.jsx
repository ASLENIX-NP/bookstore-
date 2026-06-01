import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HeroSettings() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);
  const [slider3, setSlider3] = useState(null);

  const [loading, setLoading] = useState(false);

  const saveHero = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      if (backgroundImage)
        formData.append(
          "backgroundImage",
          backgroundImage
        );

      if (slider1)
        formData.append("slider1", slider1);

      if (slider2)
        formData.append("slider2", slider2);

      if (slider3)
        formData.append("slider3", slider3);

      await axios.put(
        "http://localhost:5000/api/admin/hero",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success("Hero Updated");
    } catch (error) {
      console.log(error);
      toast.error("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({
    title,
    onChange,
    file,
  }) => (
    <div>
      <label className="block mb-2 font-medium">
        {title}
      </label>

      <label className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">
            Click to Upload
          </span>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            onChange(e.target.files[0])
          }
        />
      </label>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-md p-6 max-w-5xl">

        <h2 className="text-2xl font-bold mb-6">
          Hero Settings
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <UploadBox
            title="Background Image"
            file={backgroundImage}
            onChange={setBackgroundImage}
          />

          <UploadBox
            title="Slider Image 1"
            file={slider1}
            onChange={setSlider1}
          />

          <UploadBox
            title="Slider Image 2"
            file={slider2}
            onChange={setSlider2}
          />

          <UploadBox
            title="Slider Image 3"
            file={slider3}
            onChange={setSlider3}
          />

        </div>

        <button
          onClick={saveHero}
          disabled={loading}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          {loading
            ? "Saving..."
            : "Save Hero Section"}
        </button>
      </div>
    </div>
  );
}