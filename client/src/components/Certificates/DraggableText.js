import React, { useRef, useEffect } from "react";
import {
  Text as KonvaText,
  Transformer as KonvaTransformer,
} from "react-konva";

const DraggableText = ({ text, isSelected, onSelect, setTexts, texts }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (!shapeRef.current || !trRef.current) return;

    if (isSelected) {
      // Attach transformer to the selected text
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const newTexts = texts.map((txt) =>
      txt.id === text.id ? { ...txt, x: e.target.x(), y: e.target.y() } : txt
    );
    setTexts(newTexts);
  };

  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();

    // Update text data with new position and font size
    const newFontSize = Math.max(10, node.fontSize() * scaleX);

    const newTexts = texts.map((txt) =>
      txt.id === text.id
        ? {
            ...txt,
            x: node.x(),
            y: node.y(),
            fontSize: newFontSize,
          }
        : txt
    );

    setTexts(newTexts);

    // Reset the scale to prevent double scaling
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <>
      <KonvaText
        text={text.text}
        x={text.x}
        y={text.y}
        fontSize={text.fontSize}
        fontFamily={text.fontFamily}
        fill={text.fill}
        draggable
        onClick={() => onSelect(text.id)}
        onTap={() => onSelect(text.id)}
        ref={shapeRef}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <KonvaTransformer
          ref={trRef}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default DraggableText;
