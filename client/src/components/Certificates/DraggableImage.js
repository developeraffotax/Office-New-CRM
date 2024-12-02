import React, { useRef, useEffect } from "react";
import {
  Image as KonvaImage,
  Transformer as KonvaTransformer,
} from "react-konva";
import useImage from "use-image";

const DraggableImage = ({
  image,
  isSelected,
  onSelect,
  setImages,
  images,
  containerWidth,
  containerHeight,
}) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const [img] = useImage(image.src);

  // Fit the image to cover the canvas dimensions initially
  useEffect(() => {
    if (img && shapeRef.current) {
      const node = shapeRef.current;

      // Calculate scale to cover the canvas while maintaining aspect ratio
      const scale = Math.max(
        containerWidth / img.width,
        containerHeight / img.height
      );

      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      // Calculate position to center the image on the canvas
      const x = (containerWidth - newWidth) / 2;
      const y = (containerHeight - newHeight) / 2;

      const updatedImages = images.map((imgEl) =>
        imgEl.id === image.id
          ? {
              ...imgEl,
              width: newWidth,
              height: newHeight,
              x: x,
              y: y,
            }
          : imgEl
      );

      setImages(updatedImages);
    }
  }, [img, containerWidth, containerHeight]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach the transformer to the selected image
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const newImages = images.map((imgEl) =>
      imgEl.id === image.id
        ? {
            ...imgEl,
            x: e.target.x(),
            y: e.target.y(),
          }
        : imgEl
    );
    setImages(newImages);
  };

  const handleTransformEnd = () => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Update the image dimensions
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;

      // Restrict the image from being minimized below minimum dimensions
      const minWidth = 50; // Set your minimum width
      const minHeight = 50; // Set your minimum height

      const finalWidth = Math.max(newWidth, minWidth);
      const finalHeight = Math.max(newHeight, minHeight);

      const newImages = images.map((imgEl) =>
        imgEl.id === image.id
          ? {
              ...imgEl,
              x: node.x(),
              y: node.y(),
              width: finalWidth,
              height: finalHeight,
            }
          : imgEl
      );

      setImages(newImages);

      // Reset the scale to 1
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  return (
    <>
      <KonvaImage
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        draggable
        onClick={() => onSelect(image.id)}
        onTap={() => onSelect(image.id)}
        ref={shapeRef}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <KonvaTransformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Restrict minimizing below minimum size
            const minWidth = 50; // Set your minimum width
            const minHeight = 50; // Set your minimum height

            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            // No maximum size restriction
            return newBox;
          }}
          // Allow resizing from all anchors
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "top-center",
            "bottom-center",
            "middle-left",
            "middle-right",
          ]}
        />
      )}
    </>
  );
};

export default DraggableImage;
