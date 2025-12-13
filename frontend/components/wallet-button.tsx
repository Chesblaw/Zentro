'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Wallet, X, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useAccount,
  useConnect,
  useDisconnect,
  Connector,
} from '@starknet-react/core';
import {
  StarknetkitConnector,
  useStarknetkitConnectModal,
} from 'starknetkit';

/* -------------------------------------------------
   Config / Helpers
--------------------------------------------------*/

const LAST_CONNECTOR_KEY = 'last_starknet_connector';

const truncateAddress = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
function getWalletIcon(id: string) {
  const key = id.toLowerCase();

  if (key.includes('argent')) return '🅰️';
  if (key.includes('braavos')) return '🪖';
  if (key.includes('okx')) return '🟢';
  if (key.includes('bitget')) return '🔵';

  return '👛';
}

/* -------------------------------------------------
   Main Component
--------------------------------------------------*/


export default function WalletButton({ className = '' }) {
  const { address, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Only Starknet wallets we want
  const availableConnectors = useMemo(
    () =>
      connectors.filter(
        (c) =>
          c.available() &&
          ['argent', 'braavos', 'okx', 'bitget'].some((k) =>
            c.id.toLowerCase().includes(k),
          ),
      ),
    [connectors],
  );


  /* ---------------- Modal UX ---------------- */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  /* ---------------- Connect handlers ---------------- */

  const connectWallet = async (connector: Connector) => {
    try {
      setLoadingId(connector.id);
      await connectAsync({ connector });
      localStorage.setItem(LAST_CONNECTOR_KEY, connector.id);
      toast.success('Wallet connected');
      setOpen(false);
    } catch {
      toast.error('Failed to connect wallet');
    } finally {
      setLoadingId(null);
    }
  };


  /* -------------------------------------------------
     Connected state
  --------------------------------------------------*/
  if (status === 'connected') {
    return (
      <div className='flex items-center gap-2'>
        <button className='px-4 py-2 rounded-xl bg-black/30 text-white flex items-center gap-2'>
          <Wallet className='w-4 h-4' />
          {truncateAddress(address)}
        </button>
        <button
          onClick={() => disconnect()}
          className='p-2 rounded-xl border border-red-500/40 hover:bg-red-500/10'
          aria-label='Disconnect wallet'
        >
          <LogOut className='w-4 h-4 text-red-500' />
        </button>
      </div>
    );
  }

  /* -------------------------------------------------
     Disconnected state
  --------------------------------------------------*/
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-4 py-2 rounded-xl bg-gradient-to-r from-[#db74cf] to-blue-500 text-white flex items-center gap-2 ${className}`}
      >
        <Wallet className='w-4 h-4' />
        Connect Wallet
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen bg-black/70 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-sm rounded-2xl bg-[#121212] shadow-2xl p-6 text-white"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-tr from-purple-600 to-blue-500 text-2xl">
                🔒
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                Connect Your Wallet
              </h2>
              <p className="text-sm text-gray-400">
                Select a Starknet wallet to continue
              </p>
            </div>

            {/* Wallet list */}
            <div className="space-y-2">
              {availableConnectors.map((connector) => (
                <WalletRow
                  key={connector.id}
                  icon={getWalletIcon(connector.id)}
                  name={connector.name}
                  loading={loadingId === connector.id}
                  onClick={() => connectWallet(connector)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}

/* -------------------------------------------------
   Connector Button
--------------------------------------------------*/

function WalletRow({
  icon,
  name,
  loading,
  onClick,
}: {
  icon: string;
  name: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10 transition disabled:opacity-50"
    >
      <div className="h-9 w-9 rounded-lg bg-black/40 flex items-center justify-center text-lg">
        {icon}
      </div>

      <div className="flex-1 text-left text-sm font-medium">
        {name}
      </div>

      {loading && (
        <span className="text-xs text-gray-400">Connecting…</span>
      )}
    </button>
  );
}
