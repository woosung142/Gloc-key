import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageHistory } from "../api/image";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
              <p><small>생성일: {new Date(item.createdAt).toLocaleString()}</small></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}