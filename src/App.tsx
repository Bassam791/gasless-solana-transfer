import { useState } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

const HELIUS_API_KEY = '6b7408dd-3570-4abf-908c-3750dd959d7a';
const connection = new Connection(`https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`);

function GaslessTransferApp() {
  const wallet = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const sendGaslessTransfer = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const ix = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: Math.floor(Number(amount) * 1e9),
      });

      const tx = new Transaction().add(ix);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(tx);

      // Send signed tx to Helius relayer
      const serializedTx = signedTx.serialize();
      const b64Tx = serializedTx.toString('base64');

      const res = await fetch(`https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: b64Tx }),
      });

      const data = await res.json();
      alert(`Sent! Tx signature: ${data.signature}`);
    } catch (err) {
      console.error(err);
      alert('Error sending gasless transfer.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gasless Solana Transfer</h1>
      <WalletMultiButton />
      <div className="mt-4">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 w-full rounded"
          onClick={sendGaslessTransfer}
        >
          Send Gasless Transfer
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={`https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <GaslessTransferApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
        }
