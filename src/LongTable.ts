import * as Discord from "db-discord-discord.js"
import { httpRequest, betterSearch, KeyPairValue } from "./utilities";
import { Table, SearchArguments } from "./Table";
import { TableType } from "./db-discord";

export class LongTable<T> extends Table<T> {
    public type: TableType = "long";
    async write(obj: T, _searchAble: Partial<T> | null = null): Promise<string> {
        let searchAble = "";
        if (_searchAble !== null) {
            searchAble = JSON.stringify(_searchAble);
        }
        let buf = Buffer.from(JSON.stringify(obj), "utf8");
        return ((await this.channel.send(searchAble, {
            files: [buf]
        })) as Discord.Message).id;
    }
    async get(id: string): Promise<T> {
        let url = (await this.channel.fetchMessage(id)).attachments.array()[0].url;
        return JSON.parse(await httpRequest(url)) as T;
    }
    async search(searchArguments: SearchArguments<T>): Promise<KeyPairValue<string, T>[]> {
        let search = searchArguments.searchObject || searchArguments.searchTerm;
        if (search === undefined) {
            search = "";
        }
        return await betterSearch(this.channel, async x => JSON.parse(await httpRequest(x.attachments.array()[0].url)) as T, search, searchArguments.regexChecker, searchArguments.callback)        
    }
}
