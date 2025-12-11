import {
    AccountInfo,
    EndlessSignAndSubmitTransaction, EndlessSignMessageInput, EndlessSignMessageOutput,
    NetworkInfo,
    UserResponse,
    UserResponseStatus
} from "../types/inject.ts";
import {MessageType} from "../types/background.ts";
import {
    MESSAGE_TYPE_ENDLESS_WALLET_EVENT,
    MESSAGE_TYPE_ENDLESS_WALLET_REQUEST, MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE,
    MESSAGE_TYPE_WALLET_EVENT
} from "../constants";

// Inject the wallet provider script
const script = document.createElement('script')
script.src = chrome.runtime.getURL('src/content/inject.js')
script.onload = function () {
    if (script.parentNode) {
        script.parentNode.removeChild(script)
    }
}
;(document.head || document.documentElement).appendChild(script)


interface WalletRequest {
    method: string
    params?: any
    id: string
}

// Listen for wallet events from background and forward to page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === MESSAGE_TYPE_WALLET_EVENT) {
        // Forward event to the injected script
        window.postMessage({
            type: MESSAGE_TYPE_ENDLESS_WALLET_EVENT,
            payload: {
                event: message.event,
                data: message.data
            }
        }, '*')
    }
    // Always return true for async response
    return true
})

// Listen for wallet requests from page
window.addEventListener('message', async (event) => {
    if (event.source !== window || event.data.type !== MESSAGE_TYPE_ENDLESS_WALLET_REQUEST) {
        return
    }

    const request: WalletRequest = event.data.payload

    try {
        const response = await handleWalletRequest(request)
        window.postMessage({
            type: MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE,
            payload: {
                id: request.id,
                result: response
            }
        }, '*')
    } catch (error) {
        window.postMessage({
            type: MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE,
            payload: {
                id: request.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }, '*')
    }
})

async function handleWalletRequest(request: WalletRequest): Promise<any> {
    switch (request.method) {
        case 'connect':
            return await connect()
        case 'disconnect':
            return await disconnect()
        case 'isConnected':
            return await isConnected(request.params)
        case 'getAccount':
            return await getAccount()
        case 'getNetwork':
            return await getNetwork()
        case 'signAndSubmitTransaction':
            return await signAndSubmitTransaction(request.params)
        case 'signMessage':
            return await signMessage(request.params)
        default:
            throw new Error(`Unsupported method: ${request.method}`)
    }
}

async function connect(): Promise<UserResponse<AccountInfo>> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletConnect,
            data: {origin: window.location.origin}
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: chrome.runtime.lastError.message,
                })
                return
            }
            if (response && response.success) {
                resolve({
                    status: UserResponseStatus.APPROVED,
                    args: {
                        account: response.data.account,
                        address: response.data.address,
                        authKey: response.data.authKey,
                    }
                })
            } else {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: response.error,
                })
            }
        })
    })
}

async function disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletDisconnect,
            data: {origin: window.location.origin}
        }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
                return
            }

            if (response && response.success) {
                resolve()
            } else {
                reject(new Error(response?.error || 'Disconnection failed'))
            }
        })
    })
}

async function isConnected(addr: string): Promise<boolean> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletIsConnected,
            data: {origin: window.location.origin, addr: addr}
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve(false)
                return
            }
            resolve(response && response.success && response.data)
        })
    })
}

async function getAccount(): Promise<UserResponse<AccountInfo>> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletGetAccount,
            data: {origin: window.location.origin}
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: chrome.runtime.lastError.message,
                })
                return
            }

            if (response && response.success) {
                resolve({
                    status: UserResponseStatus.APPROVED,
                    args: {
                        account: response.data.account,
                        address: response.data.address,
                        authKey: response.data.authKey,
                    }
                })
            } else {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: response.error,
                })
            }
        })
    })
}

async function getNetwork(): Promise<UserResponse<NetworkInfo>> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletGetNetwork,
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: chrome.runtime.lastError.message,
                })
                return
            }

            if (response && response.success) {
                resolve({
                    status: UserResponseStatus.APPROVED,
                    args: {
                        name: response.data.name,
                        chainId: response.data.chainId,
                        url: response.data.url,
                    }
                })
            } else {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: response.error,
                })
            }
        })
    })
}

async function signAndSubmitTransaction(params: EndlessSignAndSubmitTransaction): Promise<UserResponse<{ hash: string }>> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletSignAndSubmitTransaction,
            data: params,
        }, (response) => {
            if (chrome.runtime.lastError) {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: chrome.runtime.lastError.message,
                })
                return
            }
            if (response && response.success) {
                resolve({
                    status: UserResponseStatus.APPROVED,
                    args: {
                        hash: response.data,
                    }
                })
            } else {
                resolve({
                    status: UserResponseStatus.REJECTED,
                    message: response?.error || 'Sign Failed',
                })
            }
        })
    })
}

async function signMessage(params: EndlessSignMessageInput): Promise<EndlessSignMessageOutput> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: MessageType.WalletSignMessage,
            data: params
        }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
                return
            }
            if (response && response.success) {
                resolve(response.data)
            } else {
                reject(new Error(response?.error || 'Message signing failed'))
            }
        })
    })
}
