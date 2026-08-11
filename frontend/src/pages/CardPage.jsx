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

  const [isSharing, setIsSharing] =
    useState(false);

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
      <main className="card-page">
        <div className="card-page-container">
          <h1>No Card Data Found</h1>

          <button
            type="button"
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
      alert(
        "Card image is not ready yet."
      );
      return;
    }

    // Open immediately from the button click
    // so the browser does not block the popup.
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
      // 1. Convert canvas to PNG
      // ==========================================

      const imageBlob =
        await new Promise(
          (resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(
                    new Error(
                      "Could not create image"
                    )
                  );
                }
              },
              "image/png"
            );
          }
        );

      // ==========================================
      // 2. Prepare Cloudinary upload
      // ==========================================

      const formData =
        new FormData();

      formData.append(
        "file",
        imageBlob,
        "id-card.png"
      );

      formData.append(
        "upload_preset",
        "hh_id_card"
      );

      // ==========================================
      // 3. Upload generated CARD to Cloudinary
      // ==========================================

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
        "Uploaded image:",
        imageURL
      );

      // ==========================================
      // 4. Create share link in backend
      // ==========================================

      const shareResponse =
        await fetch(
          "https://id-generator-sfys.onrender.com/api/share",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              imageURL,
            }),
          }
        );

      const shareData =
        await shareResponse.json();

      if (!shareResponse.ok) {
        throw new Error(
          shareData.message ||
            "Could not create share link"
        );
      }

      const shareURL =
        shareData.shareURL;

      console.log(
        "Share URL:",
        shareURL
      );

      // ==========================================
      // 5. Create X share URL
      // ==========================================

    const shareText =
  `Check out my ID card! 🚀 #FrameInGoa\n${shareURL}`;

const xShareURL =
  `https://twitter.com/intent/post?text=${encodeURIComponent(
    shareText
  )}`;

      // ==========================================
      // 6. Navigate popup to X
      // ==========================================

      xWindow.location.href =
        xShareURL;

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
    <main className="card-page">

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
            selectedStacks={
              selectedStacks
            }
            xHandle={xHandle}
            builderClass={
              builderClass
            }
            externalCanvasRef={
              canvasRef
            }
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
            onClick={
              handleDownload
            }
          >
            Download
          </button>

          <button
            type="button"
            onClick={
              handleShareOnX
            }
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