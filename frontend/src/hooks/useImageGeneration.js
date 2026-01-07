// import { useQuery, useMutation } from "@tanstack/react-query";
// import { generateImageProcess, getImageResult } from "../api/image";

// export const useImageGeneration = () => {
//   // 1. 이미지 생성 요청 (Mutation)
//   const mutation = useMutation({
//     mutationFn: (prompt) => generateImageProcess(prompt),
//   });

//   // 2. 이미지 상태 확인 (Query + Polling)
//   const jobId = mutation.data?.jobId;

//   const query = useQuery({
//     queryKey: ["imageJob", jobId],
//     queryFn: () => getImageResult(jobId),
//     enabled: !!jobId, // jobId가 있을 때만 실행
//     refetchInterval: (query) => {
//       // 상태가 COMPLETED나 FAILED가 아니면 5초마다 다시 가져옴
//       return query.state.data?.status === "PROCESSING" ? 5000 : false;
//     },
//   });

//   return {
//     generateImage: mutation.mutate,
//     isGenerating: mutation.isPending || query.data?.status === "PROCESSING",
//     imageUrl: query.data?.imageUrl,
//     error: mutation.error || query.error || (query.data?.status === "FAILED" ? "생성 실패" : null),
//   };
// };