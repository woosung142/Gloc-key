import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageHistory, getEditImageHistory } from "../api/image"; // API 추가
import { downloadImage } from "../utils/download";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdits, setSelectedEdits] = useState(null); // 편집 내역 저장용
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // 편집 히스토리 가져오기 함수
  const fetchEditHistory = async (rootImageId) => {
    try {
      const edits = await getEditImageHistory(rootImageId);
      setSelectedEdits(edits);
      setIsModalOpen(true);
    } catch (e) {
      console.error("편집 내역 로드 실패", e);
      alert("편집 내역을 불러올 수 없습니다.");
    }
  };

  const handleEditClick = (imageId, imageUrl) => {
    navigate('/edit', { state: { imageUrl, imageId } });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getImageHistory();
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
    <div style={{ padding: "20px" }}>
      <h1>나의 이미지 생성 내역</h1>
      <button onClick={() => navigate("/")}>메인으로 돌아가기</button>
      <hr />

      {/* 이미지 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {history.map((item) => (
          <div key={item.jobId} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
            <p><strong>프롬프트:</strong> {item.prompt}</p>
            
            {/* 이미지를 클릭하면 편집 내역을 불러옴 */}
            <img 
              src={item.imageUrl} 
              alt="generated" 
              style={{ width: "100%", cursor: "pointer", borderRadius: "4px" }} 
              onClick={() => fetchEditHistory(item.imageId)}
            />

            <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
              <button onClick={() => downloadImage(item.imageUrl)}>원본 다운</button>
              <button onClick={() => handleEditClick(item.imageId, item.imageUrl)}>편집하기</button>
            </div>
          </div>
        ))}
      </div>

      {/* 편집 내역 모달창 */}
      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>편집된 이미지 내역</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ float: "right" }}>닫기</button>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "20px" }}>
              {selectedEdits && selectedEdits.length > 0 ? (
                selectedEdits.map((edit) => (
                  <div key={edit.imageId} style={{ textAlign: "center", border: "1px solid #eee", padding: "10px" }}>
                    <img src={edit.imageUrl} alt="edited" style={{ width: "100%" }} />
                  
                    <p><small>{new Date(edit.createdAt).toLocaleString()}</small></p>
                    <button 
                      style={{ backgroundColor: "#4f46e5", color: "white" }}
                      onClick={() => handleEditClick(edit.imageId, edit.imageUrl)}
                    >
                      이 버전으로 다시 편집
                    </button>
                    <button onClick={() => downloadImage(edit.imageUrl)}>이 버전 다운로드</button>
                  </div>
                ))
              ) : (
                <p>편집된 내역이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 간단한 인라인 스타일
const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "80%", maxHeight: "80%", overflowY: "auto"
};