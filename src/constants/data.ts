/**
 * Data Constants
 * Network configurations, mock data, and preset DApps
 * (Migrated from the original constants.ts)
 */

import {NetworkConfig, NetworkId, DAppItem} from '../types/common';
import {Network} from '@endlesslab/endless-ts-sdk';

export const DefaultMainnetConfig: NetworkConfig = {
    id: NetworkId.MAINNET,
    name: Network.MAINNET,
    rpcUrl: 'https://rpc.endless.link/v1',
    indexerUrl: 'https://idx.endless.link/api/v1',
    chainId: 220,
    symbol: 'EDS',
    explorerUrl: 'https://scan.endless.link'
}

export const DefaultTestnetConfig: NetworkConfig = {
    id: NetworkId.TESTNET,
    name: Network.TESTNET,
    rpcUrl: 'https://rpc-test.endless.link/v1',
    indexerUrl: 'https://idx-test.endless.link/api/v1',
    chainId: 221,
    symbol: 'tEDS',
    explorerUrl: 'https://scan.endless.link'
}

// Network Configurations
export const DefaultNetworkConfig: Record<NetworkId, NetworkConfig> = {
    [NetworkId.MAINNET]: DefaultMainnetConfig,
    [NetworkId.TESTNET]: DefaultTestnetConfig,
};

// Preset DApps
export const MainnetPreSetDapps: DAppItem[] = [
    {
        id: 'd1',
        name: 'SliSwap',
        description: 'The #1 AMM DEX on Endless Chain.',
        url: 'https://sliswap.com',
        iconUrl: 'data:image/svg+xml,%3csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'32\'%20height=\'32\'%20viewBox=\'0%200%2032%2032\'%20fill=\'none\'%3e%3crect%20width=\'32\'%20height=\'32\'%20rx=\'6\'%20fill=\'black\'/%3e%3cpath%20d=\'M16.1078%2024.8458L12.8001%2012.9691M12.8001%2012.9691L16.1078%206.9531M12.8001%2012.9691L25.3428%2016.1437M12.8001%2012.9691L6.59302%2016.1437\'%20stroke=\'%23404040\'/%3e%3cpath%20d=\'M15.8539%2025.6164L18.4998%2017.9523M6.63867%2015.8557L18.5263%2017.9379M18.5642%2017.9379L25.3428%2015.9907M15.9451%206.6842L18.602%2017.9379\'%20stroke=\'white\'%20stroke-width=\'1.42857\'/%3e%3cpath%20d=\'M15.4194%206.58065C15.74%206.25996%2016.26%206.25996%2016.5806%206.58065L25.4194%2015.4194C25.74%2015.74%2025.74%2016.26%2025.4194%2016.5806L16.5806%2025.4194C16.26%2025.74%2015.74%2025.74%2015.4194%2025.4194L6.58065%2016.5806C6.25996%2016.26%206.25996%2015.74%206.58065%2015.4194L15.4194%206.58065Z\'%20stroke=\'white\'%20stroke-width=\'1.42857\'/%3e%3cpath%20d=\'M17.0859%2017.2224C17.7063%2017.2224%2017.8006%2016.6445%2017.7702%2016.3556C18.0287%2016.2644%2018.5822%2016.1823%2018.7282%2016.5837C18.8742%2016.9852%2019.3973%2017.1768%2019.6406%2017.2224C19.5797%2017.2224%2019.5128%2017.3958%2019.7318%2018.0892C19.0749%2018.3081%2018.6673%2018.9407%2018.5457%2019.2297C18.5305%2019.2601%2018.3541%2019.3027%2017.5877%2019.2297C17.5877%2018.5727%2017.1163%2018.226%2016.9034%2018.1348C16.8882%2018.0588%2016.9034%2017.7698%2017.0859%2017.2224Z\'%20fill=\'white\'/%3e%3cpath%20d=\'M16.0483%2023.6783C15.7052%2024.8147%2014.9649%2024.3024%2014.6877%2024.1266L14.3829%2024.3111L15.3828%2025.3309L17.1435%2025.2617C17.5106%2024.6161%2018.017%2023.3182%2017.6202%2023.7371C16.8621%2024.5376%2016.8211%2024.3001%2016.8775%2024.0471C16.9096%2023.7204%2016.3145%2022.7965%2016.0483%2023.6783Z\'%20fill=\'white\'/%3e%3c/svg%3e',
        category: 'DeFi'
    },
    {
        id: 'd2',
        name: 'UpOnly',
        description: 'The #1 MEME Launchpad on Endless Chain.',
        url: 'https://uponly.eternalab.link',
        iconUrl: 'https://up-only-test.eternalab.link/logo.svg',
        category: 'DeFi'
    },
    {
        id: 'd3',
        name: 'GoldUst',
        description: 'Digital asset mining! Fair launch and fair trade.',
        url: 'https://www.goldust.io',
        iconUrl: 'https://www.goldust.io/_next/static/media/logo.2f873e0b.png',
        category: 'NFT'
    },
];

export const TestnetPreSetDapps: DAppItem[] = [
    {
        id: 'd1',
        name: 'SliSwap',
        description: 'The #1 AMM DEX on Endless Chain.',
        url: 'http://test.sliswap.com/',
        iconUrl: 'data:image/svg+xml,%3csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'32\'%20height=\'32\'%20viewBox=\'0%200%2032%2032\'%20fill=\'none\'%3e%3crect%20width=\'32\'%20height=\'32\'%20rx=\'6\'%20fill=\'black\'/%3e%3cpath%20d=\'M16.1078%2024.8458L12.8001%2012.9691M12.8001%2012.9691L16.1078%206.9531M12.8001%2012.9691L25.3428%2016.1437M12.8001%2012.9691L6.59302%2016.1437\'%20stroke=\'%23404040\'/%3e%3cpath%20d=\'M15.8539%2025.6164L18.4998%2017.9523M6.63867%2015.8557L18.5263%2017.9379M18.5642%2017.9379L25.3428%2015.9907M15.9451%206.6842L18.602%2017.9379\'%20stroke=\'white\'%20stroke-width=\'1.42857\'/%3e%3cpath%20d=\'M15.4194%206.58065C15.74%206.25996%2016.26%206.25996%2016.5806%206.58065L25.4194%2015.4194C25.74%2015.74%2025.74%2016.26%2025.4194%2016.5806L16.5806%2025.4194C16.26%2025.74%2015.74%2025.74%2015.4194%2025.4194L6.58065%2016.5806C6.25996%2016.26%206.25996%2015.74%206.58065%2015.4194L15.4194%206.58065Z\'%20stroke=\'white\'%20stroke-width=\'1.42857\'/%3e%3cpath%20d=\'M17.0859%2017.2224C17.7063%2017.2224%2017.8006%2016.6445%2017.7702%2016.3556C18.0287%2016.2644%2018.5822%2016.1823%2018.7282%2016.5837C18.8742%2016.9852%2019.3973%2017.1768%2019.6406%2017.2224C19.5797%2017.2224%2019.5128%2017.3958%2019.7318%2018.0892C19.0749%2018.3081%2018.6673%2018.9407%2018.5457%2019.2297C18.5305%2019.2601%2018.3541%2019.3027%2017.5877%2019.2297C17.5877%2018.5727%2017.1163%2018.226%2016.9034%2018.1348C16.8882%2018.0588%2016.9034%2017.7698%2017.0859%2017.2224Z\'%20fill=\'white\'/%3e%3cpath%20d=\'M16.0483%2023.6783C15.7052%2024.8147%2014.9649%2024.3024%2014.6877%2024.1266L14.3829%2024.3111L15.3828%2025.3309L17.1435%2025.2617C17.5106%2024.6161%2018.017%2023.3182%2017.6202%2023.7371C16.8621%2024.5376%2016.8211%2024.3001%2016.8775%2024.0471C16.9096%2023.7204%2016.3145%2022.7965%2016.0483%2023.6783Z\'%20fill=\'white\'/%3e%3c/svg%3e',
        category: 'DeFi'
    },
    {
        id: 'd2',
        name: 'UpOnly',
        description: 'The #1 MEME Launchpad on Endless Chain.',
        url: 'http://up-only-test.eternalab.link/',
        iconUrl: 'https://up-only-test.eternalab.link/logo.svg',
        category: 'DeFi'
    },
    {
        id: 'd3',
        name: 'GoldUst',
        description: 'Digital asset mining! Fair launch and fair trade.',
        url: 'https://test.goldust.io/',
        iconUrl: 'https://www.goldust.io/_next/static/media/logo.2f873e0b.png',
        category: 'NFT'
    },
];
