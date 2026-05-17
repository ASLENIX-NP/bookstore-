import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Location from "./pages/Location";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* All layout components go inside here */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="location" element={<Location />} />
        </Route>

        {/* The Login component stays completely on its own outside the Layout route block */}
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}