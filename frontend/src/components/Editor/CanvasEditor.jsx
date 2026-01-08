import React, { useRef } from 'react';
import { Stage, Layer, Image, Group, Text, Path } from 'react-konva';
import useImage from 'use-image';

const CanvasEditor = ({ imageUrl, elements, onUpdatePos, onTextChange }) => {
  // S3 이미지 로드 (CORS 해결을 위해 'anonymous' 설정 필수)
  const [img] = useImage(imageUrl, 'anonymous'); 
  const stageRef = useRef(null);

  // 말풍선 모양 (SVG Path)
  const bubblePathData = "M10,10 L90,10 Q100,10 100,20 L100,50 Q100,60 90,60 L50,60 L35,80 L35,60 L10,60 Q0,60 0,50 L0,20 Q0,10 10,10 Z";

  // 편집된 결과물 저장 함수
  const handleExport = () => {
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = "edited_image.png";
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border shadow-lg bg-white">
        <Stage width={500} height={500} ref={stageRef}>
          <Layer>
            {img && <Image image={img} width={500} height={500} />}
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
      <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded">
        이미지 저장하기
      </button>
    </div>
  );
};

export default CanvasEditor;