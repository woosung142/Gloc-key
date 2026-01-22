
import React, { useEffect } from 'react';
import { User } from '../../types';
import CanvasEditor from '../Editor/CanvasEditor';
import { useDashboard } from './hooks/useDashboard';
import { Navbar } from './components/Navbar';
import { GeneratorSection } from './components/GeneratorSection';
import { ArchiveSection } from './components/ArchiveSection';
import { HistoryPanel } from './components/HistoryPanel';
import { DeleteDialog } from './components/DeleteDialog';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Footer } from './components/Footer';
import { AlertType } from '../Common/CustomAlert';

interface Props {
  onLogout: () => void;
  user: User | null;
  onNavigateToMyPage: () => void;
  onAlert: (
    type: AlertType, 
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    cancelLabel?: string, 
    confirmLabel?: string
  ) => void;
}

const Dashboard: React.FC<Props> = ({ onLogout, user, onNavigateToMyPage, onAlert }) => {
  const dashboard = useDashboard();

  useEffect(() => {
    dashboard.fetchHistory();
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboard.sortRef.current && !dashboard.sortRef.current.contains(event.target as Node)) dashboard.setIsSortOpen(false);
      if (dashboard.filterRef.current && !dashboard.filterRef.current.contains(event.target as Node)) dashboard.setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let interval: any;
    if (dashboard.isGenerating) {
      dashboard.setLoadingMsgIndex(0);
      interval = setInterval(() => {
        dashboard.setLoadingMsgIndex((prev) => (prev + 1) % 5);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [dashboard.isGenerating]);



  return (
    <div className="min-h-screen flex flex-col selection:bg-[#B59458]/20 selection:text-[#1E293B]">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onProfileClick={onNavigateToMyPage} // Navbar로 전달
        onAlert={onAlert}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 space-y-32">
        <GeneratorSection
          prompt={dashboard.prompt}
          onPromptChange={dashboard.setPrompt}
          selectedAtmosphere={dashboard.selectedAtmosphere}
          selectedRegion={dashboard.selectedRegion}
          selectedEra={dashboard.selectedEra}
          onAtmosphereChange={dashboard.setSelectedAtmosphere}
          onRegionChange={dashboard.setSelectedRegion}
          onEraChange={dashboard.setSelectedEra}
          isGenerating={dashboard.isGenerating}
          onGenerate={() => dashboard.handleGenerate()}
        />

        <ArchiveSection
          images={dashboard.images}
          filteredAndSortedImages={dashboard.filteredAndSortedImages}
          isLoading={dashboard.isLoading}
          searchQuery={dashboard.searchQuery}
          onSearchChange={dashboard.setSearchQuery}
          sortBy={dashboard.sortBy}
          onSortChange={dashboard.setSortBy}
          filterType={dashboard.filterType}
          onFilterChange={dashboard.setFilterType}
          isSortOpen={dashboard.isSortOpen}
          onSortOpenChange={dashboard.setIsSortOpen}
          isFilterOpen={dashboard.isFilterOpen}
          onFilterOpenChange={dashboard.setIsFilterOpen}
          sortRef={dashboard.sortRef}
          filterRef={dashboard.filterRef}
          onEdit={dashboard.handleEditExisting}
          onDownload={dashboard.handleDirectDownload}
          onViewLineage={dashboard.handleViewLineage}
          onDelete={dashboard.setDeleteTargetId}
        />
      </main>

      <LoadingOverlay
        isVisible={dashboard.isGenerating}
        loadingMsgIndex={dashboard.loadingMsgIndex}
      />

      <DeleteDialog
        isOpen={dashboard.deleteTargetId !== null}
        isDeleting={dashboard.isDeleting}
        onConfirm={dashboard.handleDeleteConfirm}
        onCancel={() => dashboard.setDeleteTargetId(null)}
      />

      <HistoryPanel
        isOpen={dashboard.isLineageOpen}
        shouldRender={dashboard.shouldRenderLineage}
        selectedRootPrompt={dashboard.selectedRootPrompt}
        selectedLineage={dashboard.selectedLineage}
        onClose={dashboard.closeLineagePanel}
        onDownload={dashboard.handleDirectDownload}
        onEdit={(img) => {
          dashboard.setActiveImageUrl(img.originalUrl);
          dashboard.setActiveImageRecord(img);
          dashboard.setIsEditorOpen(true);
          dashboard.closeLineagePanel();
        }}
        onDelete={dashboard.setDeleteTargetId}
      />

      {dashboard.isEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-[#FDFCF9] flex items-center justify-center overflow-hidden animate-fade-in">
          <CanvasEditor
            initialImageUrl={dashboard.activeImageUrl}
            initialRecord={dashboard.activeImageRecord}
            lastPrompt={dashboard.lastPrompt}
            onRegenerate={async () => {
              const res = await dashboard.handleGenerate(dashboard.lastPrompt);
              if (res) {
                dashboard.setActiveImageUrl(res.imageUrl);
                dashboard.setActiveImageRecord(res.record);
              }
            }}
            onSave={() => { dashboard.fetchHistory(); dashboard.setIsEditorOpen(false); }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
