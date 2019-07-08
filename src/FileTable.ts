import * as Discord from "db-discord-discord.js"
import { httpRequestAsBuffer, Regexify, betterSearch, KeyPairValue } from "./utilities";
import { Table, SearchArguments } from "./Table";
import { TableType } from "./db-discord";

export class FileTable extends Table<Buffer> {
    public type: TableType = "file";
    async write(obj: Buffer, _searchAble: any = null): Promise<string> {
        let searchAble = "";
        if (_searchAble !== null) {
            if (typeof _searchAble === "string") {
                searchAble = _searchAble;
            }
            else {
                searchAble = JSON.stringify(_searchAble);
            }
        }
        let buf = obj;
        return ((await this.channel.send(searchAble, {
            files: [buf]
        })) as Discord.Message).id;
    }
    async getUrl(id: string): Promise<string> {
        return (await this.channel.fetchMessage(id)).attachments.array()[0].url;
    }
    async get(id: string): Promise<Buffer> {
        let url = await this.getUrl(id)
        return await httpRequestAsBuffer(url)
    }
    async search(searchArguments: SearchArguments<any>): Promise<KeyPairValue<string, Buffer>[]> {
        let search = searchArguments.searchObject || searchArguments.searchTerm;
        if (search === undefined) {
            search = "";
        }
        return await betterSearch<Buffer>(this.channel, async x => await httpRequestAsBuffer(x.attachments.array()[0].url), search, searchArguments.regexChecker)
    }
}
