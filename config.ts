import Constants from 'expo-constants';

const commonConfig = {
    /**
     * cUSD decimals to use in ui format
     */
    cUSDDecimals: 18,

    /**
     * The default API URL
     */
    baseApiUrl: process.env.EXPO_API_BASE_URL + '/api',

    /**
     *
     */
    adminAppKey: process.env.EXPO_ADMIN_APP_KEY!,
};
const ENV = {
    dev: {
        /**
         * Block explorer base URL. Contract address is added at the end.
         */
        blockExplorer: 'https://alfajores-blockscout.celo-testnet.org/address/',

        /**
         * JSON RPC url
         */
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',

        /**
         * Contract Address to use in dev
         */
        impactMarketContractAddress: process.env
            .EXPO_DEV_IMPACT_MARKET_CONTRACT!,

        /**
         * Is it in testnet?
         */
        testnet: true,
    },
    staging: {
        /**
         * Block explorer base URL. Contract address is added at the end.
         */
        blockExplorer: 'https://alfajores-blockscout.celo-testnet.org/address/',

        /**
         * JSON RPC url
         */
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',

        /**
         * Contract Address to use in dev
         */
        impactMarketContractAddress: process.env
            .EXPO_DEV_IMPACT_MARKET_CONTRACT!,

        /**
         * Is it in testnet?
         */
        testnet: true,
    },
    production: {
        /**
         * Block explorer base URL. Contract address is added at the end.
         */
        blockExplorer: 'https://explorer.celo.org/address/',

        /**
         * JSON RPC url
         */
        jsonRpc:
            'https://celo-mainnet--rpc.datahub.figment.io/apikey/' +
            process.env.EXPO_FIGMENT_API_KEY! +
            '/',

        /**
         * Contract Address to use in production
         */
        impactMarketContractAddress:
            '0xe55C3eb4a04F93c3302A5d8058348157561BF5ca',

        /**
         * Is it in testnet?
         */
        testnet: false,
    },
};

function getEnvVars() {
    if (__DEV__) {
        // thanks https://stackoverflow.com/a/57468503/3348623
        // do dev stuff 🤘
        if (process.env.EXPO_USE_STAGING) {
            return { ...commonConfig, ...ENV.staging };
        }
        return { ...commonConfig, ...ENV.dev };
    } else if (Constants.appOwnership === 'expo') {
        return { ...commonConfig, ...ENV.staging };
    }
    return { ...commonConfig, ...ENV.production };
}

export default getEnvVars();
