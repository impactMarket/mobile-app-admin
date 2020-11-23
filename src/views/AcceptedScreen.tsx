import React, { useState, useEffect } from "react";
import {
    DataTable,
} from "react-native-paper";
import { ICommunityInfo } from "../../types";
import {
    getAllValidCommunities,
} from "../services/api";

export default function AcceptedScreen() {
    const [validCommunities, setValidCommunities] = useState<ICommunityInfo[]>([]);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const _acceptingCommunityRequest = await getAllValidCommunities();
                setValidCommunities(_acceptingCommunityRequest);
            } catch (e) {
            }
            finally {
            }
        };
        loadCommunities();
    }, []);

    return (
        <DataTable>
            <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Location</DataTable.Title>
                <DataTable.Title>By</DataTable.Title>
            </DataTable.Header>

            {validCommunities.map((community) =>
                <DataTable.Row key={community.publicId}>
                    <DataTable.Cell>{community.name}</DataTable.Cell>
                    <DataTable.Cell>{community.city}</DataTable.Cell>
                    <DataTable.Cell>{community.requestByAddress}</DataTable.Cell>
                </DataTable.Row>)}

            <DataTable.Pagination
                page={1}
                numberOfPages={1}
                onPageChange={(page) => { console.log(page); }}
                label="1-1 of 1"
            />
        </DataTable>
    );
}
