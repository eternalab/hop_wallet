import {
    Account,
    AccountAddress, ClientRequest, ClientResponse,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    Endless,
    ENDLESS_COIN_ID,
    EndlessConfig,
    GetCoinDataResponse,
    InputEntryFunctionData,
    InputGenerateTransactionPayloadData,
} from "@endlesslab/endless-ts-sdk";
import slip10 from 'micro-key-producer/slip10.js';
import { EndlessSignAndSubmitTransaction, EndlessSignMessageInput, EndlessSignMessageOutput } from "../types/inject.ts";
import {
    CoinInfo,
    EstimateTransaction,
    InnerResp,
    LocalAccount,
    ParsedPayload,
    RespType,
    Transaction,
    WalletData
} from "../types/wallet.ts";
import * as bip39 from "@scure/bip39";
import { wordlist } from '@scure/bip39/wordlists/english';
import { Collections, NetworkConfig, NftItem, Nfts, TransactionWDEvent } from "../types/common.ts";
import Decimal from "decimal.js";
import { COLLECTION_PAGE_SIZE, EDS_META, NFT_PAGE_SIZE } from "../constants";

export class MnemonicUtils {
    // Generate mnemonic from entropy
    static async generateLocalMnemonic(): Promise<string> {
        try {
            return bip39.generateMnemonic(wordlist)
        } catch (error) {
            console.error(error)
            throw new Error('Failed to generate mnemonic')
        }
    }

    // Validate mnemonic
    static async validateMnemonic(mnemonic: string): Promise<boolean> {
        return bip39.validateMnemonic(mnemonic, wordlist)
    }

}

export class EndlessService {
    private static endless: Endless
    private static currentNetwork: NetworkConfig
    private static readonly DERIVATION_PATH = "m/44'/637'/0'/0'"

    static initialize(network: NetworkConfig) {
        this.currentNetwork = network
        this.endless = new Endless(new EndlessConfig({
            fullnode: network.rpcUrl,
            indexer: network.indexerUrl,
            network: network.name,
            client: {
                async provider<Req, Res>(requestOptions: ClientRequest<Req>): Promise<ClientResponse<Res>> {
                    const { url, method, body, headers, contentType } = requestOptions

                    const fetchHeaders: Record<string, string> = {}
                    if (headers) {
                        for (const [key, value] of Object.entries(headers)) {
                            if (value !== undefined) {
                                fetchHeaders[key] = String(value)
                            }
                        }
                    }
                    if (contentType) {
                        fetchHeaders['Content-Type'] = contentType
                    }
                    const reqInit = {
                        method: method,
                        headers: fetchHeaders,
                        body: undefined,
                    }
                    if (body) {
                        if (body instanceof Uint8Array) {
                            reqInit.body = Buffer.from(body);
                        } else {
                            reqInit.body = Buffer.from(JSON.stringify(body));
                        }
                    }
                    const response = await fetch(url, reqInit)

                    const responseBody = await response.json() as Res

                    return {
                        status: response.status,
                        statusText: response.statusText,
                        data: responseBody,
                        headers: Object.fromEntries(response.headers.entries()),
                        config: requestOptions,
                        request: requestOptions,
                        response: response,
                    }
                }
            },
        }))
    }

    static getClient(network: NetworkConfig): Endless {
        if (this.currentNetwork!==network || !this.endless){
            this.initialize(network)
        }
        return this.endless
    }

    // wallet functions \\
    static async createWallet(mnemonic?: string, hdIndex: number = 0): Promise<WalletData> {
        try {
            const seedPhrase = mnemonic || await MnemonicUtils.generateLocalMnemonic()
            const isValid = await MnemonicUtils.validateMnemonic(seedPhrase)
            if (!isValid) {
                throw new Error('Invalid mnemonic phrase')
            }
            const account = await this.generateAccountFromMnemonicAndIndex(seedPhrase, hdIndex, "Account 0")
            return {
                mnemonic: seedPhrase,
                accounts: [{
                    address: account.address,
                    publicKey: account.publicKey,
                    privateKey: account.privateKey,
                    authKey: account.authKey,
                    name: account.name,
                    hdIndex: hdIndex,
                    createAt: new Date().getTime(),
                }],
                createdAt: Date.now()
            }
        } catch (error) {
            console.error('Failed to create wallet:', error)
            throw new Error(error instanceof Error ? error.message : 'Failed to create wallet')
        }
    }

    static async generateAccountFromMnemonicAndIndex(mnemonic: string, index: number = 0, name: string): Promise<LocalAccount> {
        if (index < 0) {
            throw new Error("hd index should be greater than or equal to 0")
        }
        if (!bip39.validateMnemonic(mnemonic, wordlist)) {
            throw new Error('Invalid mnemonic phrase')
        }
        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic)
            const masterKey = slip10.fromMasterSeed(seed)
            const path = `${this.DERIVATION_PATH}/${index}'`
            const hdKey = masterKey.derive(path)
            return await this.createAccountFromPrivateKey(hdKey.privateKey, name, index)
        } catch (error) {
            console.error('Error generating accounts from mnemonic:', error)
            throw new Error('Failed to generate accounts from mnemonic')
        }
    }

    static async generateAccountsFromMnemonic(mnemonic: string, index: number = 0): Promise<LocalAccount[]> {
        if (index < 0) {
            throw new Error("hd index should be greater than or equal to 0")
        }
        if (!bip39.validateMnemonic(mnemonic, wordlist)) {
            throw new Error('Invalid mnemonic phrase')
        }

        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic)
            const masterKey = slip10.fromMasterSeed(seed)
            const accounts: LocalAccount[] = []
            const path = `${this.DERIVATION_PATH}/${index}'`
            const hdKey = masterKey.derive(path)
            const account = await this.createAccountFromPrivateKey(hdKey.privateKey, `Local Account ${index}`, index)
            accounts.push(account)

            return accounts
        } catch (error) {
            console.error('Error generating accounts from mnemonic:', error)
            throw new Error('Failed to generate accounts from mnemonic')
        }
    }

    static async createAccountFromPrivateKey(privateKey: Uint8Array, name: string, hdIndex: number = 1): Promise<LocalAccount> {
        try {
            const priKey = new Ed25519PrivateKey(privateKey)
            const acc = Account.fromPrivateKey({ privateKey: priKey })

            return {
                address: acc.accountAddress.toBs58String(),
                publicKey: acc.publicKey.toString(),
                authKey: acc.publicKey.authKey().toString(),
                privateKey: priKey.toString(),
                createAt: new Date().getTime(),
                name,
                hdIndex
            }
        } catch (error) {
            console.error('Error creating account from private key:', error)
            throw new Error('Failed to create account from private key')
        }
    }

    static async signMessage(fromPrivateKey: string, params: EndlessSignMessageInput, network: NetworkConfig): Promise<InnerResp<EndlessSignMessageOutput>> {
        try {
            const privateKey = new Ed25519PrivateKey(fromPrivateKey)
            const account = Account.fromPrivateKey({ privateKey })
            const signature = account.sign('Endless' + params.message)
            return {
                status: RespType.Success, data: {
                    address: account.accountAddress.toBs58String(),
                    chainId: network.chainId,
                    fullMessage: 'Endless' + params.message,
                    publicKey: account.publicKey.toString(),
                    message: params.message,
                    nonce: params.nonce || '',
                    prefix: 'Endless::Message',
                    signature: signature
                }
            }
        } catch (error) {
            console.error('Error signMessage:', error)
            return { status: RespType.Error, errMsg: "unable to sign message" }
        }
    }

    // chain functions \\
    static async getAccountBalance(address: string, network: NetworkConfig): Promise<string> {
        try {
            const client = this.getClient(network)
            const aa = AccountAddress.fromString(address)
            const edsBalance = await client.viewEDSBalance(aa)
            return this.formatEDSBalance(edsBalance.toString()).toFixed(2)
        } catch (error) {
            console.error('Error fetching balance:', error)
            return '0'
        }
    }

    static async sendEDSTransaction(fromPrivateKey: string, toAddress: string, amountNoDecimal: string, network: NetworkConfig): Promise<string> {
        try {
            const client = this.getClient(network)
            const privateKey = new Ed25519PrivateKey(fromPrivateKey)
            const account = Account.fromPrivateKey({ privateKey })
            const amountInOctas = this.parseAmount(amountNoDecimal)
            const transaction = await client.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: '0x1::endless_coin::transfer',
                    typeArguments: [],
                    functionArguments: [toAddress, amountInOctas]
                }
            })
            const senderAuthenticator = client.transaction.sign({
                signer: account,
                transaction
            })
            const response = await client.transaction.submit.simple({
                transaction,
                senderAuthenticator
            })

            return response.hash
        } catch (error) {
            console.error('Error sending transaction:', error)
            throw new Error('Failed to send transaction')
        }
    }

    static async sendCoinTransaction(fromPrivateKey: string, coin: string, toAddress: string, amountWithDecimal: string, network: NetworkConfig) {
        try {
            const client = this.getClient(network)
            const privateKey = new Ed25519PrivateKey(fromPrivateKey)
            const account = Account.fromPrivateKey({ privateKey })
            const transaction = await client.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: '0x1::endless_account::transfer_coins',
                    typeArguments: ["0x1::fungible_asset::Metadata"],
                    functionArguments: [toAddress, amountWithDecimal, coin]
                }
            })
            const senderAuthenticator = client.transaction.sign({
                signer: account,
                transaction
            })
            const response = await client.transaction.submit.simple({
                transaction,
                senderAuthenticator
            })

            return response.hash
        } catch (error) {
            console.error('Error sending transaction:', error)
            throw new Error('Failed to send transaction')
        }
    }

    static async sendNftTransaction(fromPrivateKey: string, nftAddress: string, toAddress: string, network: NetworkConfig): Promise<string> {
        try {
            const client = this.getClient(network)
            const privateKey = new Ed25519PrivateKey(fromPrivateKey)
            const account = Account.fromPrivateKey({ privateKey })
            const transaction = await client.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: '0x1::object::transfer',
                    typeArguments: ["0x4::token::Token"],
                    functionArguments: [nftAddress, toAddress]
                }
            })
            const senderAuthenticator = client.transaction.sign({
                signer: account,
                transaction
            })
            const response = await client.transaction.submit.simple({
                transaction,
                senderAuthenticator
            })

            return response.hash
        } catch (error) {
            console.error('Error sending transaction:', error)
            throw new Error('Failed to send transaction')
        }
    }

    static async estimateTransaction(addr: string, pubKeyStr: string, data: EndlessSignAndSubmitTransaction, network: NetworkConfig): Promise<InnerResp<EstimateTransaction>> {
        const client = this.getClient(network)
        const aa = AccountAddress.fromBs58String(addr)
        const publicKey = new Ed25519PublicKey(pubKeyStr)
        const transaction = await client.transaction.build.simple({
            sender: aa,
            data: data.payload,
            options: data?.options,
        })
        const simulateResp = await client.transaction.simulate.simple({
            signerPublicKey: publicKey,
            transaction: transaction,
        })
        if (simulateResp.length === 0) {
            return { status: RespType.Error, errMsg: "simulate resp is null" }
        }
        if (!simulateResp[0].success) {
            return { status: RespType.Error, errMsg: simulateResp[0].vm_status }
        }
        const balanceChange = this.calBalanceChangeFromEvents(simulateResp[0].events)
        return {
            status: RespType.Success, data: {
                success: true,
                balanceChange: balanceChange,
                esGasFee: simulateResp[0].gas_used
            }
        }
    }

    static async signAndSubmitTransaction(fromPrivateKey: string, data: EndlessSignAndSubmitTransaction, network: NetworkConfig): Promise<InnerResp<string>> {
        try {
            const client = this.getClient(network)

            const privateKey = new Ed25519PrivateKey(fromPrivateKey)
            const account = Account.fromPrivateKey({ privateKey })
            const transaction = await client.transaction.build.simple({
                sender: account.accountAddress,
                data: data.payload,
                options: data?.options,
            })

            const simulate = await client.transaction.simulate.simple({
                signerPublicKey: account.publicKey,
                transaction: transaction,
            })
            if (simulate.length === 0) {
                return { status: RespType.Error, errMsg: "simulate resp is null" }
            }
            if (!simulate[0].success) {
                return { status: RespType.Error, errMsg: simulate[0].vm_status }
            }
            const senderAuthenticator = client.transaction.sign({
                signer: account,
                transaction
            })
            const response = await client.transaction.submit.simple({
                transaction,
                senderAuthenticator
            })

            return {
                status: RespType.Success,
                data: response.hash,
            }
        } catch (error) {
            console.error('Error sending transaction:', error)
            return { status: RespType.Error, errMsg: "unable to send transaction" }
        }
    }

    static async getTransactionHistory(address: string, limit: number = 10, network: NetworkConfig): Promise<Transaction[]> {
        try {
            const client = this.getClient(network)
            const transactions = await client.getAccountTransactions({
                accountAddress: address,
                options: { limit }
            })
            return transactions.map(tx => this.formatTransaction(tx, address)).reverse()
        } catch (error) {
            console.error('Error fetching transaction history:', error)
            return []
        }
    }

    static async getAccountCoins(address: string, limit: number = 20, network: NetworkConfig): Promise<CoinInfo[]> {
        try {
            const client = this.getClient(network)
            const coins = await client.getAccountCoinsData({
                accountAddress: address,
                options: { page: 0, pageSize: limit }
            })
            return coins.data
        } catch (error) {
            console.error('Error fetching transaction history:', error)
            return []
        }
    }

    static async queryCoinInfo(addr: string, network: NetworkConfig): Promise<GetCoinDataResponse> {
        if (addr === ENDLESS_COIN_ID) {
            return EDS_META
        }
        const client = this.getClient(network)
        return await client.coin.getCoinData(addr)
    }

    static async queryAccountCollections(addr: string, network: NetworkConfig): Promise<Collections> {
        try {
            const resp = await fetch(`${network.indexerUrl}/accounts/${addr}/nfts/collections?page=0&pageSize=${COLLECTION_PAGE_SIZE}&collection=`)
            const respJson = await resp.json()
            if (respJson?.data.length > 0) {
                return {
                    total: respJson?.total,
                    page: respJson?.page,
                    pageSize: respJson?.pageSize,
                    data: respJson.data.map((d) => {
                        return {
                            id: d?.collection?.id,
                            name: d?.collection?.name,
                            uri: d?.collection?.uri,
                            description: d?.collection.description,
                            count: d?.count
                        }
                    })
                }
            }
        } catch (error) {
            console.error('fetch collections failed:', error)
            return {
                total: 0,
                page: 0,
                pageSize: 10,
                data: []
            }
        }
    }

    static async queryNftsByCollectionId(addr: string, collectionId: string, network: NetworkConfig, page: number = 0): Promise<Nfts> {
        try {
            const resp = await fetch(`${network.indexerUrl}/accounts/${addr}/nfts?page=${page}&pageSize=${NFT_PAGE_SIZE}&collection=${collectionId}`)
            const respJson = await resp.json()
            if (respJson?.data.length > 0) {
                return {
                    total: respJson?.total,
                    page: respJson?.page,
                    pageSize: respJson?.pageSize,
                    data: respJson.data.map((d): NftItem => {
                        return {
                            id: d?.id,
                            uri: d?.uri,
                            name: d?.name,
                            index: d?.index,
                            properties: d?.properties
                        }
                    })
                }
            }else{
                return {
                    total: 0,
                    page: 0,
                    pageSize: 10,
                    data: []
                }
            }
        } catch (error) {
            console.error('fetch collections failed:', error)
            return {
                total: 0,
                page: 0,
                pageSize: 10,
                data: []
            }
        }
    }

    static validateAddress(address: string): boolean {
        try {
            const aa = AccountAddress.fromBs58String(address)
            return aa.toBs58String() === address
        } catch (e) {
            return false;
        }
    }

    static async estimateSendGasFee(fromAddress: string, fromAddrPubKey: string, toAddress: string, amount: string, network: NetworkConfig): Promise<string> {
        try {
            const pubKey = new Ed25519PublicKey(fromAddrPubKey)
            const client = this.getClient(network)
            const amountInOctas = this.parseAmount(amount)

            const transaction = await client.transaction.build.simple({
                sender: fromAddress,
                data: {
                    function: '0x1::endless_coin::transfer',
                    typeArguments: [],
                    functionArguments: [toAddress, amountInOctas]
                }
            })

            const gasEstimate = await client.transaction.simulate.simple({
                signerPublicKey: pubKey,
                transaction
            })

            const gasFee = gasEstimate[0].gas_used
            return this.formatEDSBalance(gasFee).toFixed(8)
        } catch (error) {
            console.error('Error estimating gas fee:', error)
            return '0.001'
        }
    }

    static async estimateSendCoinGasFee(fromAddress: string, fromAddrPubKey: string, coin: string, toAddress: string, amount: string, network: NetworkConfig): Promise<string> {
        try {
            const pubKey = new Ed25519PublicKey(fromAddrPubKey)
            const client = this.getClient(network)

            const transaction = await client.transaction.build.simple({
                sender: fromAddress,
                data: {
                    function: '0x1::endless_account::transfer_coins',
                    typeArguments: ["0x1::fungible_asset::Metadata"],
                    functionArguments: [toAddress, amount, coin]
                }
            })

            const gasEstimate = await client.transaction.simulate.simple({
                signerPublicKey: pubKey,
                transaction
            })

            const gasFee = gasEstimate[0].gas_used
            return this.formatEDSBalance(gasFee).toFixed(8)
        } catch (error) {
            console.error('Error estimating gas fee:', error)
            return '0.00001'
        }
    }

    static async estimateSendNftGasFee(fromAddress: string, fromAddrPubKey: string, nftAddress: string, toAddress: string, network: NetworkConfig): Promise<string> {
        try {
            const pubKey = new Ed25519PublicKey(fromAddrPubKey)
            const client = this.getClient(network)

            const transaction = await client.transaction.build.simple({
                sender: fromAddress,
                data: {
                    function: '0x4::object::transfer',
                    typeArguments: ["0x4::token::Token"],
                    functionArguments: [nftAddress, toAddress]
                }
            })

            const gasEstimate = await client.transaction.simulate.simple({
                signerPublicKey: pubKey,
                transaction
            })

            const gasFee = gasEstimate[0].gas_used
            return this.formatEDSBalance(gasFee).toFixed(8)
        } catch (error) {
            console.error('Error estimating gas fee:', error)
            return '0.00001'
        }
    }

    private static formatTransaction(tx: any, userAddress: string): Transaction {
        const isSent = tx.sender === userAddress
        const otherAddress = isSent ?
            (tx.payload?.arguments?.[0] || 'Unknown') :
            tx.sender
        const bcm = this.calBalanceChangeFromEvents(tx.events);
        const bm = bcm.get(tx.sender)
        let edsChange = new Decimal(0);
        if (bm !== undefined) {
            let ec = bm.get(ENDLESS_COIN_ID)
            if (ec !== undefined) {
                edsChange = ec
            }
        }
        return {
            hash: tx.hash,
            sender: tx.sender,
            receiver: otherAddress,
            amount: edsChange,
            timestamp: Math.floor(Number(tx.timestamp) / 1000),
            status: tx.success ? 'success' : 'failed',
            type: isSent ? 'send' : 'receive'
        }
    }

    static async detailBalanceChange(bcMap: Map<string, Map<string, Decimal>>): Promise<Map<string, Map<GetCoinDataResponse, Decimal>>> {
        const result = new Map<string, Map<GetCoinDataResponse, Decimal>>();
        for (const [addr, bc] of bcMap) {
            const coinMap = new Map<GetCoinDataResponse, Decimal>();
            const entries = Array.from(bc.entries());
            await Promise.all(entries.map(async ([coin, amount]) => {
                try {
                    const coinInfo = await this.queryCoinInfo(coin, this.currentNetwork);
                    coinMap.set(coinInfo, amount);
                }catch (e){
                    console.error("query failed:",e)
                }

            }));
            result.set(addr, coinMap);
        }
        return result;
    }

    static calBalanceChangeFromEvents(txEvents: Array<any>): Map<string, Map<string, Decimal>> {
        const events = txEvents as Array<TransactionWDEvent>;
        const balanceChangeMap = new Map<string, Map<string, Decimal>>();
        for (const event of events) {
            if (event.type === "0x1::fungible_asset::Withdraw") {
                let balance = balanceChangeMap.get(event.data.owner)
                if (balance === undefined) {
                    balance = new Map<string, Decimal>([[event.data.coin, new Decimal(event.data.amount).mul(-1)]])
                } else {
                    let coinAmount = balance.get(event.data.coin)
                    if (coinAmount === undefined) {
                        balance.set(event.data.coin, new Decimal(event.data.amount).mul(-1))
                    } else {
                        balance.set(event.data.coin, coinAmount.sub(event.data.amount))
                    }
                }
                balanceChangeMap.set(event.data.owner, balance)
            } else if (event.type === "0x1::fungible_asset::Deposit") {
                let balance = balanceChangeMap.get(event.data.owner)
                if (balance === undefined) {
                    balance = new Map<string, Decimal>([[event.data.coin, new Decimal(event.data.amount)]])
                } else {
                    let coinAmount = balance.get(event.data.coin)
                    if (coinAmount === undefined) {
                        balance.set(event.data.coin, new Decimal(event.data.amount))
                    } else {
                        balance.set(event.data.coin, coinAmount.add(event.data.amount))
                    }
                }
                balanceChangeMap.set(event.data.owner, balance)
            }
        }
        return balanceChangeMap

    }

    static formatEDSBalance(balance: string | number): Decimal {
        return new Decimal(balance).div(1e8)
    }

    static parseAmount(amount: string): number {
        return new Decimal(amount).mul(1e8).floor().toNumber()
    }

    static switchNetwork(network: NetworkConfig) {
        this.currentNetwork = network
        this.initialize(network)
    }

    static getCurrentNetwork(): NetworkConfig {
        return this.currentNetwork
    }

    static getCurrentRpcUrl(): string {
        return this.currentNetwork.rpcUrl
    }

    static getCurrentChainId(): number {
        return this.currentNetwork.chainId
    }

    static tryParsePayload(payload: InputGenerateTransactionPayloadData): ParsedPayload {
        try {
            const ef = payload as InputEntryFunctionData;
            const splArr = ef.function.split("::")
            if (splArr.length === 3) {
                return {
                    isParsed: true,
                    payloadDetail: {
                        moduleAddress: splArr[0],
                        moduleName: splArr[1],
                        functionName: splArr[2],
                        functionArguments: ef.functionArguments,
                    }
                }
            } else {
                return {
                    isParsed: false,
                }
            }
        } catch (error) {
            return {
                isParsed: false,
            }
        }
    }

}
