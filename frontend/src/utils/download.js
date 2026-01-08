// export const downloadImage = async (imageUrl, fileName = "generated-image.png") => {
//   try {
//     const response = await fetch(imageUrl);
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("다운로드 실패:", error);
//   }
// };


export const downloadImage = async (imageUrl, fileName = "image.png") => {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors', // CORS 모드 명시
      cache: 'no-cache', // 캐시된 응답 사용 안 함 (매우 중요)
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("다운로드 실패:", error);
    alert("이미지 다운로드에 실패했습니다. S3 권한을 확인해주세요.");
  }
};

// export const downloadImage = async (imageUrl, fileName = "image.png") => {
//   try {
//     const response = await fetch(imageUrl, {
//       method: 'GET',
//       cache: 'no-store', // 304 방지 및 항상 새로 가져오기
//     });

//     if (!response.ok) throw new Error('Network response was not ok');

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
    
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName; // 이 속성이 있으면 자동으로 다운로드를 시도함
    
//     // 핵심: body에 추가해야 브라우저가 더 신뢰함
//     document.body.appendChild(link);
    
//     link.click();
    
//     // 정리
//     setTimeout(() => {
//     }, 100); // 아주 짧은 지연 시간을 줌

//   } catch (error) {
//     console.error("다운로드 실패:", error);
//   }
// };