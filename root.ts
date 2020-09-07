import { newKit } from "@celo/contractkit";
import config from './config';

export const kit = newKit(config.jsonRpc)
