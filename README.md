# Hop Wallet

A Chrome extension wallet for the Endless blockchain.

## Features

- Create new wallet with mnemonic phrase generation
- Import existing wallet via recovery phrase
- Send and receive EDS tokens
- Token management and balance display
- NFT collections viewing and transfer
- DApp browser
- Transaction history
- Multi-account support
- Network switching (Mainnet/Testnet)
- DApp connection (Endless Wallet Standard)

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite + @crxjs/vite-plugin
- **Blockchain SDK**: @endlesslab/endless-ts-sdk
- **Crypto**: micro-key-producer (BIP39/BIP44)

## Project Structure

```
src/
├── background/      # Service worker for extension background tasks
├── content/         # Content scripts for DApp injection
│   ├── content.ts   # Content script bridge
│   └── inject.ts    # Injected wallet provider (window.endless)
├── components/      # Reusable UI components
├── constants/       # Application constants
├── services/        # External API services
├── store/           # State management (useReducer)
│   ├── WalletContext.tsx
│   ├── walletReducer.ts
│   └── viewReducers/
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
│   ├── OnboardingView.tsx
│   ├── HomeView.tsx
│   ├── SettingsView.tsx
│   ├── ApprovalViews.tsx
│   └── OtherViews.tsx
└── App.tsx          # Main application component
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

The built extension will be in the `dist/` folder, and a zip file will be created in `release/`.

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

## Testing

### Test DApp

A test DApp page (`test-dapp.html`) is included for testing wallet integration. It provides a UI to test all wallet features:

- **Connection**: Connect/disconnect wallet, check connection status
- **Account Info**: Get account details and network information
- **Sign Message**: Test message signing with custom messages and nonces
- **Transactions**: Sign and submit transactions with custom payloads
- **Event Listeners**: Subscribe to wallet events (accountChange, networkChange, etc.)
- **Debug Console**: Execute arbitrary wallet methods

To use:
1. Build and load the extension in Chrome
2. Open `test-dapp.html` in your browser
3. The page will detect the wallet and enable testing controls

## DApp Integration

Hop Wallet injects a provider at `window.endless` following the [Endless Wallet Standard](https://docs.endless.link/endless/devbuild/build/endless-standards/endless-wallet-standard).

### Available Methods

```typescript
interface EndlessWallet {
  isEndless: boolean;
  connect(): Promise<UserResponse<AccountInfo>>;
  disconnect(): Promise<void>;
  isConnected(address: string): Promise<boolean>;
  getAccount(): Promise<UserResponse<AccountInfo>>;
  getNetwork(): Promise<UserResponse<NetworkInfo>>;
  signAndSubmitTransaction(data: EndlessSignAndSubmitTransaction): Promise<UserResponse<{ hash: string }>>;
  signMessage(data: EndlessSignMessageInput): Promise<EndlessSignMessageOutput>;
  on<T>(event: EndLessSDKEventType, callback: (payload: T) => void): void;
  off<T>(event: EndLessSDKEventType, callback: (payload: T) => void): void;
}
```

### Events

- `connect` - Wallet connected
- `disconnect` - Wallet disconnected
- `accountChange` - Active account changed
- `networkChange` - Network switched

### Example Usage

```javascript
// Check if wallet is installed
if (window.endless) {
  // Connect to wallet
  const response = await window.endless.connect();
  if (response.status === 'Approved') {
    console.log('Connected:', response.args.address);
  }

  // Listen for account changes
  window.endless.on('accountChange', (account) => {
    console.log('Account changed:', account);
  });

  // Sign and submit transaction
  const txResponse = await window.endless.signAndSubmitTransaction({
    payload: {
      function: '0x1::coin::transfer',
      typeArguments: ['0x1::endless_coin::EndlessCoin'],
      functionArguments: [recipientAddress, amount]
    }
  });
}
```

## Security

- Mnemonic phrases are encrypted with user password using AES-GCM
- Private keys never leave the extension
- DApp connections require explicit user approval
- Transaction signing requires user confirmation

## License

MIT
