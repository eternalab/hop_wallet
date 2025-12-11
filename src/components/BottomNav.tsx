import React from 'react';
import { Wallet, LayoutGrid, Grid2X2, Clock } from 'lucide-react';
import { AppView } from '../types/common.ts';

interface BottomNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const getButtonClass = (isActive: boolean) =>
    `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${isActive ? 'text-cyan-600' : 'text-slate-400'}`;

  const isWalletActive = [AppView.HOME, AppView.SEND, AppView.RECEIVE, AppView.TOKEN_DETAIL].includes(currentView);
  const isNftActive = [AppView.COLLECTION, AppView.COLLECTION_DETAIL].includes(currentView);

  return (
    <div className="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center w-full z-20 shrink-0">
      <button
        onClick={() => onChangeView(AppView.HOME)}
        className={getButtonClass(isWalletActive)}
      >
        <Wallet size={20} />
        Wallet
      </button>

      <button
        onClick={() => onChangeView(AppView.COLLECTION)}
        className={getButtonClass(isNftActive)}
      >
        <LayoutGrid size={20} />
        NFTs
      </button>

      <button
        onClick={() => onChangeView(AppView.DAPPS)}
        className={getButtonClass(currentView === AppView.DAPPS)}
      >
        <Grid2X2 size={20} />
        DApps
      </button>

      <button
        onClick={() => onChangeView(AppView.ACTIVITY)}
        className={getButtonClass(currentView === AppView.ACTIVITY)}
      >
        <Clock size={20} />
        Activity
      </button>
    </div>
  );
};