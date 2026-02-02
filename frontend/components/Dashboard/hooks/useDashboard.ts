import { useState, useEffect, useMemo, useRef } from 'react';
import { UserImage } from '../../../types';
import { imageService, GenerateOptions } from '../../../services/api';
import { OPTIONS_ATMOSPHERE, OPTIONS_REGION, OPTIONS_ERA } from '../constants';

export type SortOption = 'latest' | 'oldest' | 'name';
export type FilterType = 'all' | 'original' | 'edit';

interface GenerateResult {
  imageUrl: string;
  record: UserImage;
}

export const useDashboard = () => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeImageRecord, setActiveImageRecord] = useState<UserImage | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const [selectedAtmosphere, setSelectedAtmosphere] = useState(OPTIONS_ATMOSPHERE[0]);
  const [selectedRegion, setSelectedRegion] = useState(OPTIONS_REGION[0]);
  const [selectedEra, setSelectedEra] = useState(OPTIONS_ERA[0]);

  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [selectedRootPrompt, setSelectedRootPrompt] = useState<string | null>(null);
  const [selectedLineage, setSelectedLineage] = useState<UserImage[]>([]);
  const [isLineageOpen, setIsLineageOpen] = useState(false);
  const [shouldRenderLineage, setShouldRenderLineage] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await imageService.getHistory();
      setImages([...data]);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (customPrompt?: string): Promise<GenerateResult | undefined> => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const options: GenerateOptions = {
        atmosphere: selectedAtmosphere.value,
        region: selectedRegion.value,
        era: selectedEra.value
      };

      const { jobId, imageUrl: initialUrl } = await imageService.generateEduImage(targetPrompt, options);

      let finalImageUrl = initialUrl;
      let finalImageId = "";
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const result = await imageService.checkGenerationStatus(jobId);

        if (result.status === 'COMPLETED') {
          finalImageUrl = result.imageUrl;
          finalImageId = String(result.imageId);
          break;
        } else if (result.status === 'FAILED') {
          throw new Error('AI 이미지 생성에 실패했습니다.');
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }

      if (attempts === maxAttempts) throw new Error('생성 시간이 초과되었습니다.');

      await fetchHistory();
      const history = await imageService.getHistory();
      const newRecord = history.find(img => img.id === finalImageId) || history[0];

      setActiveImageUrl(finalImageUrl);
      setActiveImageRecord(newRecord);
      setIsEditorOpen(true);

      if (!customPrompt) setPrompt('');
      return { imageUrl: finalImageUrl, record: newRecord };
    } catch (error: any) {
      console.error(error);
      alert(error.message || '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditExisting = (img: UserImage) => {
    setActiveImageRecord(img);
    setActiveImageUrl(img.originalUrl);
    setLastPrompt(img.title);
    setIsEditorOpen(true);
  };

  const handleDirectDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `K-Edu-image.png`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("다운로드 중 오류가 발생했습니다:", error);
      window.open(url, '_blank');
    }
  };

  const handleViewLineage = async (rootId: string, prompt: string) => {
    try {
      const data = await imageService.getEditImageHistory(String(rootId));
      setSelectedLineage(data);
      openLineagePanel(rootId, prompt);
    } catch (error) {
      console.error("편집 내역을 불러오지 못했습니다:", error);
    }
  };

  const openLineagePanel = (rootId: string, prompt: string) => {
    setSelectedRootId(rootId);
    setSelectedRootPrompt(prompt);
    setShouldRenderLineage(true);

    requestAnimationFrame(() => {
      setIsLineageOpen(true);
    });
  };

  const closeLineagePanel = () => {
    setIsLineageOpen(false);

    setTimeout(() => {
      setShouldRenderLineage(false);
    }, 300);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await imageService.deleteImageRecord(deleteTargetId);

      await fetchHistory();

      setSelectedLineage(prev =>
        prev.filter(img => img.id !== deleteTargetId)
      );

      if (deleteTargetId === selectedRootId) {
        closeLineagePanel();
      }

      setDeleteTargetId(null);
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedImages = useMemo(() => {
    let result = images.filter(img => {
      const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all'
        ? true
        : filterType === 'edit' ? img.isEdit : !img.isEdit;
      return matchesSearch && matchesType;
    });

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [images, sortBy, searchQuery, filterType]);

  return {
    // State
    images,
    activeImageUrl,
    activeImageRecord,
    isEditorOpen,
    isLoading,
    prompt,
    lastPrompt,
    isGenerating,
    loadingMsgIndex,
    selectedAtmosphere,
    selectedRegion,
    selectedEra,
    sortBy,
    filterType,
    searchQuery,
    isSortOpen,
    isFilterOpen,
    sortRef,
    filterRef,
    deleteTargetId,
    isDeleting,
    selectedRootId,
    selectedRootPrompt,
    selectedLineage,
    isLineageOpen,
    shouldRenderLineage,
    filteredAndSortedImages,

    // Setters
    setImages,
    setActiveImageUrl,
    setActiveImageRecord,
    setIsEditorOpen,
    setPrompt,
    setLastPrompt,
    setIsGenerating,
    setLoadingMsgIndex,
    setSelectedAtmosphere,
    setSelectedRegion,
    setSelectedEra,
    setSortBy,
    setFilterType,
    setSearchQuery,
    setIsSortOpen,
    setIsFilterOpen,
    setDeleteTargetId,
    setIsDeleting,
    setSelectedLineage,
    setSelectedRootId,
    setSelectedRootPrompt,

    // Methods
    fetchHistory,
    handleGenerate,
    handleEditExisting,
    handleDirectDownload,
    handleViewLineage,
    openLineagePanel,
    closeLineagePanel,
    handleDeleteConfirm,
  };
};
