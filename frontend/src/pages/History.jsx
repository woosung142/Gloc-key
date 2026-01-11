import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageHistory } from "../api/image";
import { downloadImage } from "../utils/download";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);

  const handleEditClick = (imageId, imageUrl) => {
    // 생성된 이미지 URL을 state에 담아 /edit 페이지로 이동
    navigate('/edit', { 
      state: { 
        imageUrl: imageUrl,
        imageId: imageId 
      } });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getImageHistory();
        // Page 객체에서 content 배열을 가져옴
        setHistory(data.content || []);
      } catch (e) {
        console.error("히스토리 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h1>나의 이미지 생성 내역</h1>
      <button onClick={() => navigate("/")}>메인으로 돌아가기</button>
      <hr />
      {history.length === 0 ? (
        <p>생성된 이미지가 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1/1/1", gap: "20px" }}>
          {history.map((item) => (
            <div key={item.jobId} style={{ border: "1px solid #ccc", padding: "10px" }}>
              <p><strong>프롬프트:</strong> {item.prompt}</p>
              {(
                <img src={item.imageUrl} alt="generated" style={{ width: "100%" }} />
              )}
              <button onClick={() => downloadImage(item.imageUrl)}>다운로드</button>
              <button onClick={() => handleEditClick(item.imageId, item.imageUrl)}>이 이미지 편집하기</button>
              <p><small>생성일: {new Date(item.createdAt).toLocaleString()}</small></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}