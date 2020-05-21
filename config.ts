import Constants from 'expo-constants';

const ENV = {
    dev: {
        /**
         * The default API URL
         */
        baseApiUrl: 'http://192.168.1.110:5000/api',

        /**
         * JSON RPC url
         */
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',

        /**
         * Contract Address to use in dev
         */
        impactMarketContractAddress: '0x2354d9642a68b04157027f8fE2fE551521D29563',
    },
    prod: {
        /**
         * The default API URL
         */
        baseApiUrl: 'https://impactmarket-poc-api.herokuapp.com/api',

        /**
         * JSON RPC url
         */
        jsonRpc: 'https://alfajores-forno.celo-testnet.org',

        /**
         * Contract Address to use in dev
         */
        impactMarketContractAddress: '0x80820c492179FFbc109942AEEDF427bAB3082948',
    }
}

function getEnvVars() {
    if (Constants.manifest.packagerOpts !== undefined) {
        if (Constants.manifest.packagerOpts.dev !== undefined) {
            return Constants.manifest.packagerOpts.dev ? ENV.dev: ENV.prod;
        }
    }
    return ENV.prod;
}

export default getEnvVars()