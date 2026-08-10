import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useRef, useState } from "react";

import CardCanvas from "./CardCanvas";

import "./CardPage.css";

function CardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Reference to the actual canvas
  const canvasRef = useRef(null);

  const [isSharing, setIsSharing] = useState(false);
const [uploadedImageURL, setUploadedImageURL] = useState(null);

  const {
    photo,
    name,
    selectedStacks,
    xHandle,
    builderClass,
  } = location.state || {};

  // ==================================================
  // NO CARD DATA
  // ==================================================

  if (!location.state) {
    return (
      <main>
        <div>
          <h1>No Card Data Found</h1>

          <button
            onClick={() => navigate("/create")}
          >
            Create Card
          </button>
        </div>
      </main>
    );
  }

  // ==================================================
  // DOWNLOAD CARD
  // ==================================================

  function handleDownload() {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const imageURL =
      canvas.toDataURL("image/png");

    const downloadLink =
      document.createElement("a");

    downloadLink.href = imageURL;

    downloadLink.download =
      "my-id-card.png";

    document.body.appendChild(
      downloadLink
    );

    downloadLink.click();

    document.body.removeChild(
      downloadLink
    );
  }

  // ==================================================
  // SHARE ON X
  // ==================================================

async function handleShareOnX() {
  const canvas = canvasRef.current;

  if (!canvas) {
    alert("Card image is not ready yet.");
    return;
  }

  // Open X window immediately
  const xWindow = window.open(
    "about:blank",
    "_blank",
    "width=600,height=600"
  );

  if (!xWindow) {
    alert(
      "Your browser blocked the X window. Please allow pop-ups for this site."
    );
    return;
  }

  try {
    setIsSharing(true);

    // ==========================================
    // 1. CONVERT CANVAS TO PNG
    // ==========================================

    const imageBlob = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error("Could not create image")
              );
            }
          },
          "image/png"
        );
      }
    );

    // ==========================================
    // 2. UPLOAD IMAGE TO CLOUDINARY
    // ==========================================

    const formData = new FormData();

    formData.append(
      "file",
      imageBlob,
      "id-card.png"
    );

    formData.append(
      "upload_preset",
      "hh_id_card"
    );

    const cloudinaryResponse =
      await fetch(
        "https://api.cloudinary.com/v1_1/amsybsli/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    if (!cloudinaryResponse.ok) {
      throw new Error(
        "Cloudinary upload failed"
      );
    }

    const cloudinaryData =
      await cloudinaryResponse.json();

    const imageURL =
      cloudinaryData.secure_url;

    if (!imageURL) {
      throw new Error(
        "Cloudinary did not return an image URL"
      );
    }

    console.log(
      "Cloudinary image:",
      imageURL
    );

    // ==========================================
    // 3. SEND IMAGE URL TO OUR BACKEND
    // ==========================================

    const shareResponse = await fetch(
      "https://id-generator-sfys.onrender.com/api/share",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          imageURL: imageURL,
        }),
      }
    );

    if (!shareResponse.ok) {
      throw new Error(
        "Could not create share link"
      );
    }

    const shareData =
      await shareResponse.json();

    console.log(
      "Share URL:",
      shareData.shareURL
    );

    // ==========================================
    // 4. CREATE X SHARE URL
    // ==========================================

    const shareText =
      "Check out my ID card! 🚀 #FrameInGoa";

    const xShareURL =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(
        shareData.shareURL
      )}`;

    // ==========================================
    // 5. OPEN X
    // ==========================================

    xWindow.location.href = xShareURL;

  } catch (error) {
    console.error(
      "Error sharing card:",
      error
    );

    xWindow.close();

    alert(
      "Could not prepare your card for sharing. Please try again."
    );

  } finally {
    setIsSharing(false);
  }
}

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main>
      <div className="card-page-container">

        <h1 className="card-page-title">
          Your ID Card
        </h1>

        {/* ================================
            CARD
        ================================= */}

        <div className="card-preview">

          <CardCanvas
            photo={photo}
            name={name}
            selectedStacks={selectedStacks}
            xHandle={xHandle}
            builderClass={builderClass}
            externalCanvasRef={canvasRef}
          />

        </div>

        {/* ================================
            ACTION BUTTONS
        ================================= */}

        <div className="card-actions">

          <button
            type="button"
            onClick={() =>
              navigate("/create")
            }
          >
            Edit
          </button>

          <button
            type="button"
            onClick={handleDownload}
          >
            Download
          </button>

          <button
            type="button"
            onClick={handleShareOnX}
            disabled={isSharing}
          >
            {isSharing
              ? "Preparing..."
              : "Share on X"}
          </button>

        </div>

      </div>
    </main>
  );
}

export default CardPage;