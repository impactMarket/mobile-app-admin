interface ICommunity {
    publicId: string;
    requestByAddress: string;
    contractAddress: string;
    name: string;
    description: string;
    descriptionEn: string;
    language: string;
    currency: string;
    country: string;
    city: string;
    gps: {
        latitude: number;
        longitude: number;
    };
    visibility: string;
    email: string;
    coverImage: string;
    status: string;
}

interface ICommunityState {
    claimed: string;
    raised: string;
    beneficiaries: number;
    backers: number;
}

interface ICommunityMetrics {
    ssiDayAlone: number;
    ssi: number;
    ubiRate: number;
    estimatedDuration: number;
    historicalSSI: number[];
}

export interface ICommunityInfo extends ICommunity {
    beneficiaries: {
        added: ICommunityInfoBeneficiary[];
        removed: ICommunityInfoBeneficiary[];
    };
    managers: string[];
    state: ICommunityState;
    metrics?: ICommunityMetrics; // private communities do not have metrics
    contractParams: ICommunityContractParams;
}

interface ICommunityContractParams {
    claimAmount: string,
    maxClaim: string,
    baseInterval: number,
    incrementInterval: number,
}

interface ICommunityInfoBeneficiary {
    address: string;
    name: string;
    timestamp: number;
    claimed: string;
}

interface IAddressAndName {
    address: string;
    name: string;
}