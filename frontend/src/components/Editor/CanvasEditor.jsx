import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Image, Group, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import bubblePng from '../../assets/bubble.png';
// 개별 말풍선 요소 컴포넌트
const BubbleElement = ({ el, isSelected, onSelect, onUpdatePos, onTextChange }) => {
  // 로컬 assets 폴더의 말풍선 PNG 로드
  const [bubbleImg] = useImage(bubblePng);
  const shapeRef = useRef();

  return (
    <Group
      id={String(el.id)}
      x={el.x}
      y={el.y}
      draggable
      onClick={onSelect}
      onTap={onSelect} // 모바일 대응
      onDragEnd={(e) => onUpdatePos(el.id, e.target.x(), e.target.y())}
    >
      {/* 1. 배경 PNG 이미지 */}
      {bubbleImg && (
        <Image
          image={bubbleImg}
          width={el.width || 180}
          height={el.height || 120}
          ref={shapeRef}
        />
      )}
      
      {/* 2. 이미지 위 텍스트 (중앙 정렬) */}
      <Text
        text={el.text}
        width={el.width || 180}
        height={el.height || 120}
        fontSize={16}
        fontFamily="Arial"
        fill="#333"
        align="center"
        verticalAlign="middle"
        padding={20}
        onDblClick={() => {
          const newText = prompt("대사를 입력하세요:", el.text);
          if (newText) onTextChange(el.id, newText);
        }}
      />
    </Group>
  );
};

const CanvasEditor = forwardRef(({ imageUrl, elements, onUpdatePos, onTextChange }, ref) => {
  const [bgImgElement, setBgImgElement] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);

  // 부모 컴포넌트(EditPage)에서 사용할 메서드 노출
  useImperativeHandle(ref, () => ({
    getCanvasImage: () => {
      if (!stageRef.current) return null;
      return stageRef.current.toDataURL({ pixelRatio: 2 });
    },
    stageRef: stageRef
  }));

  // S3 이미지 CORS 문제를 해결하기 위한 Fetch 로직
  useEffect(() => {
    if (!imageUrl) return;

    const loadImage = async () => {
      try {
        // 캐시를 무시하고 새로 요청하여 S3로부터 CORS 허용 헤더를 받아옴
        const response = await fetch(imageUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const img = new window.Image();
        img.src = objectUrl;
        img.crossOrigin = 'anonymous'; // 중요: 캔버스 오염 방지
        img.onload = () => {
          setBgImgElement(img);
        };
      } catch (error) {
        console.error("배경 이미지 로드 중 CORS 또는 네트워크 에러 발생:", error);
      }
    };

    loadImage();
  }, [imageUrl]);

  // 선택된 요소에 Transformer 연결
  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  return (
    <div className="relative border-2 border-gray-200 shadow-2xl bg-white overflow-hidden rounded-xl">
      <Stage 
        width={500} 
        height={500} 
        ref={stageRef}
        onMouseDown={(e) => {
          // 빈 공간 클릭 시 선택 해제
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
            return;
          }
        }}
      >
        <Layer>
          {/* 1. 배경 원본 이미지 */}
          {bgImgElement ? (
            <Image image={bgImgElement} width={500} height={500} />
          ) : (
            // 로딩 중 표시용 사각형
            <Image width={500} height={500} fill="#f3f4f6" />
          )}
          
          {/* 2. 말풍선(PNG + Text) 목록 */}
          {elements.map((el) => (
            <BubbleElement
              key={el.id}
              el={el}
              isSelected={String(el.id) === selectedId}
              onSelect={() => setSelectedId(String(el.id))}
              onUpdatePos={onUpdatePos}
              onTextChange={onTextChange}
            />
          ))}

          {/* 3. 크기 조절/회전 핸들 */}
          {selectedId && (
            <Transformer
              ref={trRef}
              keepRatio={false} // 말풍선 이미지를 자유롭게 늘릴 수 있게 함
              rotateEnabled={true}
              boundBoxFunc={(oldBox, newBox) => {
                // 최소 크기 제한
                if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      
      {!bgImgElement && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <div className="text-gray-400 animate-pulse font-medium">이미지를 불러오는 중...</div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 bg-black/40 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none">
        드래그: 이동 / 더블클릭: 대사 수정 / 핸들: 크기 및 회전
      </div>
    </div>
  );
});

export default CanvasEditor;