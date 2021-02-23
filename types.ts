export interface CommunityStateAttributes {
    claimed: string;
    claims: number;
    beneficiaries: number;
    raised: string;
    backers: number;
}

export interface CommunityContractAttributes {
    claimAmount: string;
    maxClaim: string;
    baseInterval: number;
    incrementInterval: number;
}
export interface ICommunityPendingDetails {
    publicId: string;
    contractAddress: string;
    requestByAddress: string;
    name: string;
    city: string;
    country: string;
    description: string;
    email: string;
    coverImage: string;
    state: CommunityStateAttributes;
    contract: CommunityContractAttributes;
}
