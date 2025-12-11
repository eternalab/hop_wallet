// official standards
// https://docs.endless.link/endless/devbuild/build/endless-standards/endless-wallet-standard
import {
    AccountInfo,
    EndLessSDKEvent,
    EndLessSDKEventListenersType,
    EndLessSDKEventPayload,
    EndLessSDKEventType,
    EndlessSignAndSubmitTransaction,
    EndlessSignMessageInput,
    EndlessSignMessageOutput,
    NetworkInfo,
    UserResponse
} from "../types/inject"
import {
    MESSAGE_TYPE_ENDLESS_WALLET_EVENT,
    MESSAGE_TYPE_ENDLESS_WALLET_REQUEST,
    MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE
} from "../constants";

interface EndlessWallet {
    isEndless: boolean
    connect(): Promise<UserResponse<AccountInfo>>
    disconnect(): Promise<void>
    isConnected(data: string): Promise<boolean>
    getAccount(): Promise<UserResponse<AccountInfo>>
    getNetwork(): Promise<UserResponse<NetworkInfo>>
    signAndSubmitTransaction(data: EndlessSignAndSubmitTransaction): Promise<UserResponse<{ hash: string }>>
    signMessage(data: EndlessSignMessageInput): Promise<EndlessSignMessageOutput>
    on<T extends EndLessSDKEventType>(event: T, callback: (payload: EndLessSDKEventPayload<T>) => void): void
    off<T extends EndLessSDKEventType>(event: T, callback: (payload: EndLessSDKEventPayload<T>) => void): void
}


class WalletProvider implements EndlessWallet {
    public isEndless = true
    private eventListeners: EndLessSDKEventListenersType = {}
    private requestId = 0

    constructor() {
        this.setupEventListeners()
    }

    private setupEventListeners() {
        // Listen for responses from content script
        window.addEventListener('message', (event) => {
            if (event.source !== window) {
                return
            }

            // Handle wallet responses
            if (event.data.type === MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE) {
                const response = event.data.payload
                this.handleResponse(response)
            }

            // Handle wallet events (accountChange, networkChange, etc.)
            if (event.data.type === MESSAGE_TYPE_ENDLESS_WALLET_EVENT) {
                const {event: eventName, data} = event.data.payload
                this.emit(eventName, data)
            }
        })
    }

    private handleResponse(response: any) {
        if (response.event) {
            this.emit(response.event, response.data)
        }
    }

    private async sendRequest(method: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = (++this.requestId).toString()

            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'))
            }, 60000) // Increased timeout for user interaction

            const handleResponse = (event: MessageEvent) => {
                if (event.source !== window || event.data.type !== MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE) {
                    return
                }

                const response = event.data.payload
                if (response.id === id) {
                    clearTimeout(timeout)
                    window.removeEventListener('message', handleResponse)

                    if (response.error) {
                        reject(new Error(response.error))
                    } else {
                        resolve(response.result)
                    }
                }
            }

            window.addEventListener('message', handleResponse)

            window.postMessage({
                type: MESSAGE_TYPE_ENDLESS_WALLET_REQUEST,
                payload: {
                    id,
                    method,
                    params
                }
            }, window.location.origin)
        })
    }

    async connect(): Promise<UserResponse<AccountInfo>> {
        const result = await this.sendRequest('connect')
        // Emit connect event on successful connection
        if (result.status === 'Approved' && result.args) {
            this.emit(EndLessSDKEvent.CONNECT, result.args)
        }
        return result
    }

    async disconnect(): Promise<void> {
        await this.sendRequest('disconnect')
        this.emit(EndLessSDKEvent.DISCONNECT, undefined)
    }

    async isConnected(data: string): Promise<boolean> {
        return await this.sendRequest('isConnected', data)
    }

    async getAccount(): Promise<UserResponse<AccountInfo>> {
        return await this.sendRequest('getAccount')
    }

    async getNetwork(): Promise<UserResponse<NetworkInfo>> {
        return await this.sendRequest('getNetwork')
    }

    async signAndSubmitTransaction(data: EndlessSignAndSubmitTransaction): Promise<UserResponse<{ hash: string }>> {
        return await this.sendRequest('signAndSubmitTransaction', data)
    }

    async signMessage(data: EndlessSignMessageInput): Promise<EndlessSignMessageOutput> {
        return await this.sendRequest('signMessage', data)
    }

    /**
     * Subscribe to wallet events
     * @param event - Event type from EndLessSDKEvent enum
     * @param callback - Callback function to execute when event is triggered
     */
    on<T extends EndLessSDKEventType>(event: T, callback: (payload: EndLessSDKEventPayload<T>) => void): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = []
        }
        // @ts-ignore - Type safety is ensured by generic constraints
        this.eventListeners[event]!.push(callback)
    }

    /**
     * Unsubscribe from wallet events
     * @param event - Event type from EndLessSDKEvent enum
     * @param callback - The same callback function that was passed to on()
     */
    off<T extends EndLessSDKEventType>(event: T, callback: (payload: EndLessSDKEventPayload<T>) => void): void {
        const listeners = this.eventListeners[event]
        if (listeners) {
            // @ts-ignore - Type safety is ensured by generic constraints
            const index = listeners.indexOf(callback)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }

    /**
     * Emit an event to all registered listeners
     * @param event - Event type
     * @param data - Event payload data
     */
    private emit<T extends EndLessSDKEventType>(event: T, data: EndLessSDKEventPayload<T>): void {
        const listeners = this.eventListeners[event]
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    // @ts-ignore - Type safety is ensured by generic constraints
                    callback(data)
                } catch (error) {
                    console.error(`Error in ${event} event listener:`, error)
                }
            })
        }
    }
}

// @ts-ignore
// wallet inject name
if (!window.endless) {
    const walletProvider = new WalletProvider()

    Object.defineProperty(window, 'endless', {
        value: walletProvider,
        writable: false,
        configurable: false
    })

    // Dispatch init event
    window.dispatchEvent(new Event('endless#initialized'))
    console.log('Hop Wallet injected successfully')
}
// @ts-ignore
declare global {
    interface Window {
        endless: EndlessWallet
    }
}
