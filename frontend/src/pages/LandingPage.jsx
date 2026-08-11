import { useNavigate } from "react-router-dom";
import "../App.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <div className="hero">

        <picture>
          <source
            media="(max-width: 600px)"
            srcSet="/landing-mobile.png"
          />

          <img
            src="/landing-bg.png"
            alt="Hacker House Goa"
            className="hero-image"
          />
        </picture>

        <div className="hero-content">

          <h1>Generate your ID Card</h1>

          <button
            className="generate-button"
            onClick={() => navigate("/create")}
          >
            Generate
          </button>

        </div>

      </div>
    </main>
  );
}

export default LandingPage;