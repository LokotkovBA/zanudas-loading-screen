import axios from "axios";
import { getBackendAddress } from "./environment";
import headers from "./headers";

const BACKEND_ADDRESS = getBackendAddress();

export function getRequest(address: string, port: number | string) {
    return axios.get(`https://${BACKEND_ADDRESS}:${port}/${address}`, {
        headers: headers
    })
};
