import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";

const Home = () => {
  const navigate = useNavigate(); // moved here

  return (
    <div>
      <Navbar />

      <Hero />
    </div>
  );
};

export default Home;
