import { useEffect, useRef } from "react";

function CardCanvas({
  photo,
  name,
  selectedStacks,
  xHandle,
  builderClass,
  externalCanvasRef,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    // Give the canvas reference to CardPage
    if (externalCanvasRef) {
      externalCanvasRef.current = canvas;
    }

    const ctx = canvas.getContext("2d");
    const template = new Image();

    template.onload = () => {
      canvas.width = template.naturalWidth;
      canvas.height = template.naturalHeight;

      // Draw the original template
      ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (photo) {
        const photoImage = new Image();

        photoImage.onload = () => {
          drawPhoto(
            ctx,
            photoImage,
            60,
            232,
            444,
            413
          );

          drawValues(ctx);
        };

        photoImage.src = URL.createObjectURL(photo);
      } else {
        drawValues(ctx);
      }

      // ==========================================
      // DRAW USER VALUES
      // ==========================================

      function drawValues(context) {
        context.fillStyle = "#ffffff";

        context.textAlign = "start";
        context.textBaseline = "middle";

        // ------------------------------------------
        // NAME
        // Text box: X=746, Y=275, W=299, H=63
        // ------------------------------------------

        context.font =
          '52px "Barriecito", cursive';

        context.fillText(
          name || "",
          746,
          275 + 63 / 2
        );

        // ------------------------------------------
        // STACK
        // Text box: X=729, Y=374, W=299, H=63
        // ------------------------------------------

        const stackText =
          selectedStacks &&
          selectedStacks.length
            ? selectedStacks.join(" • ")
            : "";

        context.font =
          '46px "Barriecito", cursive';

        context.fillText(
          stackText,
          729,
          374 + 63 / 2
        );

        // ------------------------------------------
        // X HANDLE
        // Text box: X=814, Y=471, W=299, H=63
        // ------------------------------------------

        context.font =
          '50px "Barriecito", cursive';

        context.fillText(
          xHandle || "",
          814,
          471 + 63 / 2
        );

        // ------------------------------------------
        // BUILDER CLASS
        // Text box inside yellow pill:
        // X=554, Y=603, W=485, H=61
        // ------------------------------------------

        context.fillStyle = "#056b3a";

        context.font =
          '38px "Barriecito", cursive';

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText(
          builderClass || "",
          554 + 485 / 2,
          603 + 61 / 2
        );

        // Reset
        context.textAlign = "start";
        context.textBaseline = "alphabetic";
      }
    };

    template.src = "/id-card-template.png";

    // Cleanup canvas reference
    return () => {
      if (
        externalCanvasRef &&
        externalCanvasRef.current === canvas
      ) {
        externalCanvasRef.current = null;
      }
    };
  }, [
    photo,
    name,
    selectedStacks,
    xHandle,
    builderClass,
    externalCanvasRef,
  ]);

 return (
  <canvas
    ref={(element) => {
      canvasRef.current = element;

      if (externalCanvasRef) {
        externalCanvasRef.current = element;
      }
    }}
    style={{
      display: "block",
      width: "100%",
      height: "auto",
    }}
  />
);
}

// ==================================================
// PHOTO CROPPING
// ==================================================

function drawPhoto(
  ctx,
  image,
  x,
  y,
  width,
  height
) {
  const imageRatio =
    image.width / image.height;

  const boxRatio =
    width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;

  let sourceX = 0;
  let sourceY = 0;

  // Crop left/right
  if (imageRatio > boxRatio) {
    sourceWidth =
      image.height * boxRatio;

    sourceX =
      (image.width - sourceWidth) / 2;
  }

  // Crop top/bottom
  else if (imageRatio < boxRatio) {
    sourceHeight =
      image.width / boxRatio;

    sourceY =
      (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
}

export default CardCanvas;