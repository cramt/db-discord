import * as Discord from "db-discord-discord.js"
import { EventEmitter } from "events";
import { TableType } from "./db-discord";
import { KeyPairValue, Regexify } from "./utilities";


export interface SearchArguments<T> {
    searchTerm?: string;
    searchObject?: Partial<T>;
    regexChecker?: Partial<Regexify<T>>;
    callback?: (obj: T) => boolean;
}
export declare interface Table<T> {
    on(event: "write", listener: (obj: T) => void): this
    emit(event: "write", args: T): boolean
}
export abstract class Table<T> extends EventEmitter {
    public abstract type: TableType;
    public name: string;
    public id: string;
    protected channel: Discord.TextChannel;
    constructor(channel: Discord.TextChannel) {
        super();
        this.channel = channel;
        this.name = channel.name;
        this.id = channel.id;
    }
    abstract async write(obj: T): Promise<string>;
    abstract async get(id: string): Promise<T>;
    async delete(id: string): Promise<{}> {
        return await (await this.channel.fetchMessage(id)).delete();
    }
    abstract async search(searchArguments: SearchArguments<T>): Promise<KeyPairValue<string, T>[]>;
}
