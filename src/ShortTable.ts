import * as Discord from "db-discord-discord.js"
import { Table, SearchArguments } from "./Table";
import { TableType } from "./db-discord";
import { KeyPairValue, Regexify, betterSearch } from "./utilities";

export class ShortTable<T> extends Table<T> {
    public type: TableType = "short";
    async write(obj: T): Promise<string> {
        this.emit("write", obj)
        return ((await this.channel.send(JSON.stringify(obj))) as Discord.Message).id;
    }
    async writeExpectSearch(obj: T): Promise<string> {
        let id = await this.write(obj)
        let search: KeyPairValue<string, T>[] = []
        while (search.length === 0) {
            search = (await this.search(obj)).filter(x => x.Key === id)
        }
        return id;
    }
    async get(id: string): Promise<T> {
        return JSON.parse((await this.channel.fetchMessage(id)).content);
    }
    async search(searchArguments: SearchArguments<T>): Promise<KeyPairValue<string, T>[]> {
        let search = searchArguments.searchObject || searchArguments.searchTerm;
        if (search === undefined) {
            search = "";
        }
        return await betterSearch(this.channel, async x => JSON.parse(x.content) as T, search, searchArguments.regexChecker, searchArguments.callback)
    }
    async update(id: string, _obj: ((o: T) => T) | T): Promise<{}> {
        let obj = (o: T) => o;
        if (typeof _obj === "function") {
            obj = (_obj as (o: T) => T)
        }
        else {
            obj = (o: T) => _obj
        }
        let message = await this.channel.fetchMessage(id)
        let data = JSON.parse(message.content) as T
        await message.edit(JSON.stringify(obj(data)))
        return {}
    }
}
