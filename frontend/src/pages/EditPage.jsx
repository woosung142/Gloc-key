import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CanvasEditor from '../components/Editor/CanvasEditor';
import { getUploadUrl, imageUploadComplete } from '../api/image';
import axios from 'axios';

const EditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { imageUrl, imageId } = location.state || {};
  const [elements, setElements] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  

  if (!imageUrl) {
    return <div className="p-8 text-center">편집할 이미지가 없습니다.</div>;
  }

  const handleEditImageSave = async () => {
    if (!canvasRef.current) return;
    
    setIsSaving(true);
    try {
      // 1. 캔버스에서 이미지 데이터(base64) 가져오기
      const dataUrl = canvasRef.current.getCanvasImage();
      
      // 2. 백엔드에서 Pre-signed URL 발급 받기
      const { uploadUrl, uploadId } = await getUploadUrl(imageId);
      
      // 3. base64를 Blob으로 변환
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // 4. S3에 PUT 요청으로 업로드
      // 주의: 이때는 공통 axios 인스턴스 대신 raw axios를 써야 헤더 꼬임이 없습니다.
      await axios.put(uploadUrl, blob, {
        headers: { 'Content-Type': 'image/png' }
      });

      // 5. 백엔드에 업로드 완료 알림
      await imageUploadComplete(uploadId);

      alert("편집된 이미지가 저장되었습니다!");
      navigate('/history'); // 히스토리 페이지로 이동
    } catch (error) {
      console.error("저장 실패:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };
  useEffect(() => {
    console.log("넘어온 이미지 ID:", imageId);
    console.log("넘어온 이미지 URL:", imageUrl);
  }, [imageUrl, imageId]);
  
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
          <div className="flex gap-2">
            <button onClick={addBubble} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">+ 말풍선 추가</button>
            <button 
              onClick={handleEditImageSave} 
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? "저장 중..." : "편집 완료 및 저장"}
            </button>
          </div>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-xl shadow-inner">
          <CanvasEditor 
            ref={canvasRef} // ref 연결
            imageUrl={imageUrl} 
            elements={elements}
            onUpdatePos={(id, x, y) => setElements(elements.map(el => el.id === id ? { ...el, x, y } : el))}
            onTextChange={(id, text) => setElements(elements.map(el => el.id === id ? { ...el, text } : el))}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPage;