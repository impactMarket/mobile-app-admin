export interface ICommunity {
    publicId: string;
    requestByAddress: string;
    contractAddress: string;
    name: string;
    description: string;
    location: {
        title: string;
        latitude: number;
        longitude: number;
    };
    coverImage: string;
    status: string;
    txCreationObj: any;
    createdAt: string;
    updatedAt: string;
}