import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getBuilderClass from "../utils/builderClass";
import "./CreateCard.css";

function CreateCard() {
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [customStack, setCustomStack] = useState("");

  // ================================
  // PHOTO CROPPER STATE
  // ================================

  const [cropperImage, setCropperImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState(null);

  const stacks = [
    "Java",
    "React",
    "Node.js",
    "Python",
    "C++",
    "AI/ML",
    "AWS",
    "MongoDB",
    "Flutter",
  ];

  // ================================
  // STACK SELECTION
  // ================================

  function handleStackClick(stack) {
    setSelectedStacks((currentStacks) => {
      if (currentStacks.includes(stack)) {
        return currentStacks.filter(
          (item) => item !== stack
        );
      }

      return [...currentStacks, stack];
    });
  }

  // ================================
  // PHOTO SELECTION
  // ================================

  function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCropperImage({
      url: imageUrl,
      file: file,
    });

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
    setRotation(0);
    setShowCropper(true);

    // Allows selecting the same file again later
    event.target.value = "";
  }

  // ================================
  // CROP COMPLETE
  // ================================

  function handleCropComplete(
    croppedArea,
    croppedAreaPixels
  ) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  // ================================
  // APPLY CROP
  // ================================

  async function handleApplyCrop() {
    if (!cropperImage || !croppedAreaPixels) {
      return;
    }

    try {
      const croppedFile = await getCroppedImage(
        cropperImage.url,
        croppedAreaPixels,
        rotation,
        cropperImage.file.type,
        cropperImage.file.name
      );

      setPhoto(croppedFile);

      URL.revokeObjectURL(cropperImage.url);

      setCropperImage(null);
      setShowCropper(false);
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  }

  // ================================
  // CANCEL CROP
  // ================================

  function handleCancelCrop() {
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage.url);
    }

    setCropperImage(null);
    setShowCropper(false);
  }

  // ================================
  // CUSTOM STACK
  // ================================

  function handleAddCustomStack() {
    const trimmedStack = customStack.trim();

    if (!trimmedStack) {
      return;
    }

    if (!selectedStacks.includes(trimmedStack)) {
      setSelectedStacks((currentStacks) => [
        ...currentStacks,
        trimmedStack,
      ]);
    }

    setCustomStack("");
  }

  // ================================
  // GENERATE CARD
  // ================================

  async function handleGenerate() {
    const generatedClass =
      getBuilderClass(selectedStacks);

    try {
      // IMPORTANT:
      // Generate Card saves the card data.
      // It does NOT create the share link.
      // The share link is created later from CardPage
      // after the actual card canvas has been generated.
      const response = await fetch(
        "https://id-generator-sfys.onrender.com/api/cards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            xHandle,
            selectedStacks,
            builderClass: generatedClass,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save card"
        );
      }

      console.log(
        "Card saved to MongoDB:",
        data
      );

      // Go to the actual card page.
      navigate("/card", {
        state: {
          photo,
          name,
          selectedStacks,
          xHandle,
          builderClass: generatedClass,
          cardId: data.cardId,
        },
      });
    } catch (error) {
      console.error("Error saving card:", error);

      alert(
        "Could not save your card. Please try again."
      );
    }
  }

  return (
    <div className="create-page">
      <div className="create-card-container">

        <h1>Build Your Card</h1>

        {/* ================================
            PHOTO
        ================================ */}

        <div className="form-section">
          <label className="section-label">
            Photo
          </label>

          <label className="upload-box">
            {photo ? (
              <div className="photo-selected-content">
                <span>{photo.name}</span>

                <span className="change-photo-text">
                  Click to change / crop
                </span>
              </div>
            ) : (
              <span>Upload Photo</span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        {/* ================================
            NAME
        ================================ */}

        <div className="form-section">
          <label
            className="section-label"
            htmlFor="name"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />
        </div>

        {/* ================================
            STACK
        ================================ */}

        <div className="form-section">
          <label className="section-label">
            Stack / Tech
          </label>

          <div className="stack-chips">
            {stacks.map((stack) => (
              <button
                key={stack}
                type="button"
                className={
                  selectedStacks.includes(stack)
                    ? "stack-chip selected"
                    : "stack-chip"
                }
                onClick={() =>
                  handleStackClick(stack)
                }
              >
                {stack}
              </button>
            ))}
          </div>

          {/* CUSTOM STACK */}

          <div className="custom-stack">
            <input
              type="text"
              placeholder="Add custom technology"
              value={customStack}
              onChange={(event) =>
                setCustomStack(event.target.value)
              }
            />

            <button
              type="button"
              onClick={handleAddCustomStack}
            >
              + Add
            </button>
          </div>
        </div>

        {/* ================================
            X HANDLE
        ================================ */}

        <div className="form-section">
          <label
            className="section-label"
            htmlFor="xHandle"
          >
            X Handle
          </label>

          <input
            id="xHandle"
            type="text"
            placeholder="@yourhandle"
            value={xHandle}
            onChange={(event) =>
              setXHandle(event.target.value)
            }
          />
        </div>

        {/* ================================
            GENERATE
        ================================ */}

        <div className="generate-section">
          <button
            type="button"
            className="generate-card-button"
            onClick={handleGenerate}
          >
            Generate Card
          </button>
        </div>

      </div>

      {/* ==================================================
          PHOTO CROPPER MODAL
      ================================================== */}

      {showCropper && cropperImage && (
        <div className="crop-modal-overlay">

          <div className="crop-modal">

            <div className="crop-modal-header">
              <h2>Edit Your Photo</h2>

              <button
                type="button"
                className="crop-close-button"
                onClick={handleCancelCrop}
              >
                ×
              </button>
            </div>

            {/* CROP AREA */}

            <div className="crop-container">
              <Cropper
                image={cropperImage.url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={444 / 413}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={
                  handleCropComplete
                }
                cropShape="rect"
                showGrid={true}
                objectFit="contain"
              />
            </div>

            {/* CONTROLS */}

            <div className="crop-controls">

              <div className="crop-control">
                <label>
                  Zoom
                </label>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(event) =>
                    setZoom(
                      Number(event.target.value)
                    )
                  }
                />
              </div>

              <div className="crop-control">
                <label>
                  Rotation
                </label>

                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(event) =>
                    setRotation(
                      Number(event.target.value)
                    )
                  }
                />
              </div>

            </div>

            {/* BUTTONS */}

            <div className="crop-modal-buttons">

              <button
                type="button"
                className="crop-cancel-button"
                onClick={handleCancelCrop}
              >
                Cancel
              </button>

              <button
                type="button"
                className="crop-apply-button"
                onClick={handleApplyCrop}
              >
                Apply Photo
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

// ==================================================
// CREATE CROPPED IMAGE
// ==================================================

function getCroppedImage(
  imageSrc,
  pixelCrop,
  rotation,
  mimeType,
  originalName
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(
          new Error(
            "Could not create canvas context"
          )
        );
        return;
      }

      const radians =
        (rotation * Math.PI) / 180;

      const sin = Math.abs(
        Math.sin(radians)
      );

      const cos = Math.abs(
        Math.cos(radians)
      );

      const rotatedWidth =
        image.width * cos +
        image.height * sin;

      const rotatedHeight =
        image.width * sin +
        image.height * cos;

      const rotatedCanvas =
        document.createElement("canvas");

      rotatedCanvas.width = rotatedWidth;
      rotatedCanvas.height = rotatedHeight;

      const rotatedCtx =
        rotatedCanvas.getContext("2d");

      if (!rotatedCtx) {
        reject(
          new Error(
            "Could not create rotated canvas context"
          )
        );
        return;
      }

      rotatedCtx.translate(
        rotatedWidth / 2,
        rotatedHeight / 2
      );

      rotatedCtx.rotate(radians);

      rotatedCtx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2
      );

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        rotatedCanvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Could not create cropped image"
              )
            );
            return;
          }

          const fileExtension =
            mimeType === "image/png"
              ? "png"
              : "jpg";

          const baseName =
            originalName
              ? originalName.replace(
                  /\.[^/.]+$/,
                  ""
                )
              : "cropped-photo";

          const file = new File(
            [blob],
            `${baseName}-cropped.${fileExtension}`,
            {
              type:
                mimeType === "image/png"
                  ? "image/png"
                  : "image/jpeg",
            }
          );

          resolve(file);
        },
        mimeType === "image/png"
          ? "image/png"
          : "image/jpeg",
        0.95
      );
    };

    image.onerror = () => {
      reject(
        new Error("Could not load image")
      );
    };

    image.src = imageSrc;
  });
}

export default CreateCard;