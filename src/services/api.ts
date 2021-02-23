import axios from 'axios';

import config from '../../config';
import { ICommunityPendingDetails } from '../../types';

axios.defaults.baseURL = config.baseApiUrl;

async function acceptCreateCommunity(
    acceptanceTransaction: string,
    publicId: string
): Promise<{ contractAddress: string | null }> {
    let response: { contractAddress: string | null } = {
        contractAddress: null,
    };
    // handle success
    const requestBody = {
        acceptanceTransaction,
        publicId,
    };
    const requestHeaders = {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    };
    const result = await axios.post(
        '/community/accept',
        requestBody,
        requestHeaders
    );
    response = result.data;
    return response;
}

async function removeCommunity(publicId: string): Promise<boolean> {
    const requestBody = {
        publicId,
    };
    const requestHeaders = {
        headers: {
            Authorization: `Bearer ${config.adminAppKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    };
    const result = await axios.post(
        '/community/remove',
        requestBody,
        requestHeaders
    );
    if (result.status >= 400) {
        return false;
    }
    return result.data as boolean;
}

async function getAllPendingCommunities(): Promise<ICommunityPendingDetails[]> {
    let response = [] as ICommunityPendingDetails[];
    try {
        // handle success
        const result = await axios.get('/community/pending');
        response = result.data;
    } catch (error) {
        // handle error
    } finally {
        // always executed
    }
    return response;
}

export { acceptCreateCommunity, removeCommunity, getAllPendingCommunities };
