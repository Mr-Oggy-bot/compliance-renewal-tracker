import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ObligationsList } from './pages/ObligationsList';
import { MyTasks } from './pages/MyTasks';
import { Login } from './pages/Login';
import { LedgerHistoryModal } from './components/LedgerHistoryModal';
import { RenewModal } from './components/RenewModal';
import { CreateObligationModal } from './components/CreateObligationModal';
import { UploadModal } from './components/UploadModal';
import { WorkerControlModal } from './components/WorkerControlModal';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState(null);
  const [renewingObligation, setRenewingObligation] = useState(null);
  const [uploadingInstanceId, setUploadingInstanceId] = useState(null);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWorkerModal={() => setIsWorkerModalOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            key={refreshKey}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onSelectObligation={(id) => setSelectedObligationId(id)}
            onOpenWorkerModal={() => setIsWorkerModalOpen(true)}
          />
        )}

        {activeTab === 'obligations' && (
          <ObligationsList
            key={refreshKey}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onSelectObligation={(id) => setSelectedObligationId(id)}
            onRenewRequest={(ob) => setRenewingObligation(ob)}
            onUploadRequest={(instId) => setUploadingInstanceId(instId)}
          />
        )}

        {activeTab === 'tasks' && (
          <MyTasks
            key={refreshKey}
            onRenewRequest={(ob) => setRenewingObligation(ob)}
            onUploadRequest={(instId) => setUploadingInstanceId(instId)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        Compliance Renewal Tracker &bull; UCS 503 Software Engineering &bull; Append-Only Ledger &amp; Idempotent Worker Architecture
      </footer>

      {/* Modals */}
      <LedgerHistoryModal
        obligationId={selectedObligationId}
        onClose={() => setSelectedObligationId(null)}
        onRenewRequest={(ob) => {
          setSelectedObligationId(null);
          setRenewingObligation(ob);
        }}
        onUploadRequest={(instId) => {
          setSelectedObligationId(null);
          setUploadingInstanceId(instId);
        }}
      />

      <RenewModal
        obligation={renewingObligation}
        onClose={() => setRenewingObligation(null)}
        onRenewed={() => {
          triggerRefresh();
        }}
      />

      <CreateObligationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          triggerRefresh();
        }}
      />

      <UploadModal
        instanceId={uploadingInstanceId}
        onClose={() => setUploadingInstanceId(null)}
        onUploaded={() => {
          triggerRefresh();
        }}
      />

      <WorkerControlModal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false);
          triggerRefresh();
        }}
      />

    </div>
  );
}
