import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CanvasEditor from '../components/Editor/CanvasEditor';

const EditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const imageUrl = location.state?.imageUrl; 

  const [elements, setElements] = useState([]);

  if (!imageUrl) {
    return <div className="p-8 text-center">편집할 이미지가 없습니다.</div>;
  }

  const addBubble = () => {
    setElements([...elements, {
      id: Date.now(),
      x: 150,
      y: 150,
      text: "대사를 입력하세요"
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600">← 뒤로가기</button>
          <h1 className="text-2xl font-bold">이미지 편집하기</h1>
          <button 
            onClick={addBubble}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            + 말풍선 추가
          </button>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-xl shadow-inner">
          <CanvasEditor 
            imageUrl={imageUrl} 
            elements={elements}
            onUpdatePos={(id, x, y) => {
              setElements(elements.map(el => el.id === id ? { ...el, x, y } : el));
            }}
            onTextChange={(id, text) => {
              setElements(elements.map(el => el.id === id ? { ...el, text } : el));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPage;