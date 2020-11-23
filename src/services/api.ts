import axios from 'axios';
import config from '../../config';
import { ICommunityInfo } from '../../types';


axios.defaults.baseURL = config.baseApiUrl;

async function acceptCreateCommunity(
    acceptanceTransaction: string,
    publicId: string,
): Promise<boolean> {
    let response = 500;
    try {
        // handle success
        const requestBody = {
            acceptanceTransaction,
            publicId,
        };
        const requestHeaders = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        };
        const result = await axios.post('/community/accept', requestBody, requestHeaders);
        response = result.status;
    } catch (error) {
        // handle error
    } finally {
        // always executed
    }
    return response === 202 ? true : false;
}

async function getAllValidCommunities(): Promise<ICommunityInfo[]> {
    let response = [] as ICommunityInfo[];
    try {
        // handle success
        const result = await axios.get('/community/all/valid')
        response = result.data;
    } catch (error) {
        // handle error
    } finally {
        // always executed
    }
    return response;
}

async function getAllPendingCommunities(): Promise<ICommunityInfo[]> {
    let response = [] as ICommunityInfo[];
    try {
        // handle success
        const result = await axios.get('/community/all/pending')
        response = result.data;
    } catch (error) {
        // handle error
    } finally {
        // always executed
    }
    return response;
}

export {
    acceptCreateCommunity,
    getAllValidCommunities,
    getAllPendingCommunities,
}