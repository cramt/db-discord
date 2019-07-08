import * as Discord from "db-discord-discord.js"
import { Table } from "./Table";
import { LongTable } from "./LongTable";
import { FileTable } from "./FileTable";
import { ShortTable } from "./ShortTable";
import { KeyPairValue } from "./utilities";

export type TableType = "long" | "short" | "file"
export interface MetaTableData {
    name: string;
    id: string;
    objectTypes: {
        [property: string]: string
    } | null
    type: TableType
}
export class discordDB {
    private guild: Discord.Guild;
    private channels: Discord.TextChannel[];
    public metatable: ShortTable<MetaTableData>;
    public tables: KeyPairValue<MetaTableData, Table<any>>[];
    private constructor(guild: Discord.Guild, channels: Discord.TextChannel[], metatable: ShortTable<MetaTableData>, tables: KeyPairValue<MetaTableData, Table<any>>[]) {
        this.guild = guild;
        this.channels = channels;
        this.metatable = metatable;
        this.tables = tables;
    }
    static async init(guild: Discord.Guild): Promise<discordDB> {

        let channels = guild.channels.array().filter(x => x.type == "text").filter(x => x.memberPermissions(guild.me)!.has("READ_MESSAGES")) as Discord.TextChannel[]

        let metatable = (() => {
            let metaChnnels = channels.filter(x => x.name === "metatable");
            if (metaChnnels.length === 0) {
                return null;
            }
            return new ShortTable<MetaTableData>(metaChnnels[0])
        })() || await (async () => {
            let channel = (await guild.createChannel("metatable", {
                type: "text"
            }) as Discord.TextChannel)
            channels[channels.length] = channel;
            return new ShortTable<MetaTableData>(channel);
        })()
        let metadata = await metatable.search({})
        let tables = metadata.map<KeyPairValue<MetaTableData, Table<any>>>(meta => {
            let channel = channels.filter(x => x.id === meta.Value.id)[0];
            let table: Table<any> = (() => {
                switch (meta.Value.type) {
                    case "short":
                        return new ShortTable<any>(channel)
                        break;
                    case "long":
                        return new LongTable<any>(channel)
                        break;
                    case "file":
                        return new FileTable(channel)
                        break;
                    default:
                        throw new Error("table type not supported")
                        break;
                }
            })()
            return {
                Key: meta.Value,
                Value: table
            }
        });
        return new discordDB(guild, channels, metatable, tables);
    }
    getShortTableFromName<T>(name: string): ShortTable<T> | null {
        let channels = this.channels.filter(x => x.name === name);
        if (channels.length === 0) {
            return null;
        }
        return new ShortTable<T>(channels[0])
    }
    getLongTableFromName<T>(name: string): LongTable<T> | null {
        let channels = this.channels.filter(x => x.name === name);
        if (channels.length === 0) {
            return null;
        }
        return new LongTable<T>(channels[0])
    }
    getFileTableFromName(id: string) {
        let channels = this.channels.filter(x => x.id === id);
        if (channels.length === 0) {
            return null;
        }
        return new FileTable(channels[0])
    }
    getShortTableFromID<T>(id: string) {
        let channels = this.channels.filter(x => x.id === id);
        if (channels.length === 0) {
            return null;
        }
        return new ShortTable<T>(channels[0])
    }
    getLongTableFromID<T>(id: string) {
        let channels = this.channels.filter(x => x.id === id);
        if (channels.length === 0) {
            return null;
        }
        return new LongTable<T>(channels[0])
    }
    getFileTableFromID(id: string) {
        let channels = this.channels.filter(x => x.id === id);
        if (channels.length === 0) {
            return null;
        }
        return new FileTable(channels[0])
    }
    async createNewShortTable<T>(name: string) {
        let channel = (await this.guild.createChannel(name, {
            type: "text"
        }) as Discord.TextChannel)
        this.channels[this.channels.length] = channel;
        let table = new ShortTable<T>(channel);
        await this.addToMetatable(table)
        return table;
    }
    async createNewLongTable<T>(name: string) {
        let channel = (await this.guild.createChannel(name, {
            type: "text"
        }) as Discord.TextChannel)
        this.channels[this.channels.length] = channel;
        let table = new LongTable<T>(channel);
        await this.addToMetatable(table)
        return table;
    }
    async createNewFileTable(name: string) {
        let channel = (await this.guild.createChannel(name, {
            type: "text"
        }) as Discord.TextChannel)
        this.channels[this.channels.length] = channel;
        let table = new FileTable(channel);
        await this.addToMetatable(table)
        return table;
    }
    async getOrCreateShortTable<T>(name: string) {
        let table = this.getShortTableFromName<T>(name)
        if (table === null) {
            return await this.createNewShortTable<T>(name)
        }
        return table!
    }
    async getOrCreateLongTable<T>(name: string) {
        let table = this.getLongTableFromName<T>(name)
        if (table === null) {
            return await this.createNewLongTable<T>(name)
        }
        return table!
    }
    async getOrCreateFileTable(name: string) {
        let table = this.getFileTableFromName(name)
        if (table === null) {
            return await this.createNewFileTable(name)
        }
        return table!
    }
    async deleteTable(table: Table<any>): Promise<{}> {
        let channel = this.channels.filter(x => x.id === table.id)[0]
        let i = this.channels.indexOf(channel);
        this.channels.slice(i, i + 1)
        return await Promise.all([channel.delete(), await this.metatable.delete((await this.metatable.search({
            searchObject: {
                id: table.id
            }
        }))[0].Key)]).then(x => ({}))
    }
    protected async addToMetatable(table: Table<any>) {
        let metadata: MetaTableData = {
            name: table.name,
            id: table.id,
            objectTypes: null,
            type: table.type,
        }
        this.tables[this.tables.length] = {
            Key: metadata,
            Value: table
        }
        return await this.metatable.write(metadata)
    }
}