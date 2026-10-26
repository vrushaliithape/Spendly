import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TransactionModal from '../components/transactions/TransactionModal';
import { transactionService } from '../services/transactionService';

const MainLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateTransaction = async (data) => {
    setTxSubmitting(true);
    try {
      await transactionService.createTransaction(data);
      // Trigger a state change so child components can refresh
      setRefreshTrigger((prev) => prev + 1);
    } finally {
      setTxSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      <div className="main-content">
        <Outlet
          context={{
            openAddTxModal: () => setIsAddTxModalOpen(true),
            openMobileNav: () => setIsMobileNavOpen(true),
            refreshTrigger,
          }}
        />
      </div>

      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isLoading={txSubmitting}
      />
    </div>
  );
};

export default MainLayout;
