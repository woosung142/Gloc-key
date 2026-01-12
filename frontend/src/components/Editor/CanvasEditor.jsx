import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Image, Group, Text, Path } from 'react-konva';

const CanvasEditor = forwardRef(({ imageUrl, elements, onUpdatePos, onTextChange }, ref) => {
  const [imgElement, setImgElement] = useState(null);
  const stageRef = useRef(null);

  // 부모 컴포넌트에서 stageRef에 접근할 수 있도록 노출
  useImperativeHandle(ref, () => ({
    getCanvasImage: () => {
      return stageRef.current.toDataURL({ pixelRatio: 2 });
    }
  }));

  useEffect(() => {
    if (!imageUrl) return;
    const loadImage = async () => {
      try {
        const response = await fetch(imageUrl, { cache: 'no-store' });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const image = new window.Image();
        image.src = objectUrl;
        image.crossOrigin = 'anonymous';
        image.onload = () => setImgElement(image);
      } catch (error) {
        console.error("이미지 로드 실패:", error);
      }
    };
    loadImage();
  }, [imageUrl]);

  const bubblePathData = "M10,10 L90,10 Q100,10 100,20 L100,50 Q100,60 90,60 L50,60 L35,80 L35,60 L10,60 Q0,60 0,50 L0,20 Q0,10 10,10 Z";

  return (
    <div className="border shadow-lg bg-white">
      <Stage width={500} height={500} ref={stageRef}>
        <Layer>
          {imgElement && <Image image={imgElement} width={500} height={500} />}
          {elements.map((el) => (
            <Group
              key={el.id}
              x={el.x}
              y={el.y}
              draggable
              onDragEnd={(e) => onUpdatePos(el.id, e.target.x(), e.target.y())}
            >
              <Path data={bubblePathData} fill="white" stroke="#333" strokeWidth={2} scaleX={1.5} scaleY={1.2} />
              <Text
                text={el.text}
                fontSize={16}
                width={150}
                padding={20}
                align="center"
                onClick={() => {
                  const newText = prompt("대사를 입력하세요:", el.text);
                  if (newText) onTextChange(el.id, newText);
                }}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
});

export default CanvasEditor;