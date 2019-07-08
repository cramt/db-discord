import * as https from "https"
import * as Discord from "db-discord-discord.js"
import XRegExp from "xregexp";

export function login(token: string): Promise<Discord.Client> {
    return new Promise<Discord.Client>((resolve, reject) => {
        let client = new Discord.Client()

        client.on("ready", () => {
            resolve(client)
        })

        client.on("error", reject)

        client.login(token)
    })
}

export function httpRequest(url: string) {
    return new Promise<string>((resolve, reject) => {
        https.get(url, resp => {
            let data = "";
            resp.on("data", chunk => {
                data += chunk;
            })
            resp.on("end", () => {
                resolve(data);
            })
        })
    })
}
export function httpRequestAsBuffer(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        https.get(url, resp => {
            let data: any[] = []
            resp.on("data", chunk => {
                data.push(chunk)
            })
            resp.on("end", () => {
                resolve(Buffer.concat(data));
            })
        })
    })
}

export type Regexify<T> = {
    [P in keyof T]: RegExp
};

export async function recursiveSearch<T>(
    channel: Discord.TextChannel,
    searchTerm: string,
    testerFunction: (obj: T) => boolean = () => true,
    shouldAddFunction: (obj: T) => boolean = () => true,
    converter: (message: Discord.Message) => Promise<T>): Promise<KeyPairValue<Discord.Message, T>[]> {

    function searchResultMessages(result: Discord.MessageSearchResult) {
        return flatMap(result.messages)
    }


    let buffer: KeyPairValue<Discord.Message, T>[] = []
    let firstResult = await channel.search({
        content: searchTerm,

    });
    let messages = await Promise.all(searchResultMessages(firstResult).map<Promise<KeyPairValue<Discord.Message, T>>>(async x => ({ Key: x, Value: await converter(x) })))
    for (let i = 0; i < messages.length; i++) {
        if (shouldAddFunction(messages[i].Value)) {
            buffer.push(messages[i])
            if (!testerFunction(messages[i].Value)) {
                return buffer;
            }
        }
    }
    let maxValue = firstResult.totalResults

    function clean() {
        buffer = buffer.sort((a, b) => b.Key.createdTimestamp - a.Key.createdTimestamp)

        let returnBuffer: KeyPairValue<Discord.Message, T>[] = []
        let returnBufferId: string[] = []
        buffer.forEach(x => {
            if (!returnBufferId.includes(x.Key.id)) {
                returnBuffer[returnBuffer.length] = x
                returnBufferId[returnBufferId.length] = x.Key.id
            }
        })

        buffer = returnBuffer
    }

    async function get(): Promise<{}> {
        clean();
        if (buffer.length >= maxValue) {
            return {}
        }
        let result = await channel.search({
            content: searchTerm,
            maxID: buffer[buffer.length - 1].Key.id
        })
        let messages = await Promise.all(searchResultMessages(firstResult).map<Promise<KeyPairValue<Discord.Message, T>>>(async x => ({ Key: x, Value: await converter(x) })))
        for (let i = 0; i < messages.length; i++) {
            if (shouldAddFunction(messages[i].Value)) {
                buffer.push(messages[i])
                if (!testerFunction(messages[i].Value)) {
                    return {}
                }
            }
        }

        return await get();
    }
    await get();

    return buffer;
}

export async function betterSearch<T>(
    channel: Discord.TextChannel,
    converter: (message: Discord.Message) => Promise<T>,
    _searchTerm: Partial<T> | string,
    regex: Partial<Regexify<T>> = {},
    callback: (message: T) => boolean = (() => true)): Promise<KeyPairValue<string, T>[]> {

    let searchTerm = "";
    if (typeof _searchTerm === "object") {
        searchTerm = (Object.getOwnPropertyNames(_searchTerm).map(x => (_searchTerm as any)[x]).join(","));
    }
    else {
        searchTerm = _searchTerm;
    }
    let result = await recursiveSearch<T>(channel, searchTerm, callback, message => {
        if (typeof _searchTerm === "object") {
            return Object.getOwnPropertyNames(_searchTerm).every(y => {
                let reg: RegExp | undefined = (regex as any)[y]
                let value: any = (message as any)[y]
                let searchValue: any = (_searchTerm as any)[y]
                if (reg !== undefined) {
                    return reg.test(value)
                }
                return value === searchValue;
            });
        };
        return true;
    }, converter)
    /*
    if (typeof _searchTerm === "object") {
        result = result.filter((x) => {
            return Object.getOwnPropertyNames(_searchTerm).every(y => {
                let reg: RegExp | undefined = (regex as any)[y]
                let value: any = (x.Value as any)[y]
                let searchValue: any = (_searchTerm as any)[y]
                if (reg !== undefined) {
                    return reg.test(value)
                }
                return value === searchValue;
            });
        });
    }
    */
    return result.map(x => ({ Key: x.Key.id, Value: x.Value }))
}

export interface KeyPairValue<K, P> {
    Key: K;
    Value: P;
}

export function flatMap<T>(arr: T[][]): T[] {
    return ([] as T[]).concat.apply([], arr) as T[]
}

export function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let unicodeLettersAndNumbers = XRegExp("^(\\p{L}|\\p{N})")
export function isAlphanumerical(str: string): boolean[] {
    return str.split("").map(x => unicodeLettersAndNumbers.test(x));
}

export function replaceCharacters(str: string, replacers: boolean[], replacement: string): string {
    return str.split("").map((x, i) => replacers[i] ? x : replacement).join("")
}

export function removeUnacceptedCharactersForDiscord(str: string): string {
    return replaceCharacters(str, isAlphanumerical(str), " ")
}

export function sleep(ms: number): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
        setTimeout(resolve)
    })
}

/*

type PrimitiveType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "Object" | "function" | "null" | string
type PrimitiveTypeString = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "Object" | "function" | "null"
interface PrimitiveType2 {
    isArray: boolean;
    possiblyTypes: PrimitiveTypeString[]

}
interface TypeAnalyzed {
    [key: string]: PrimitiveType | TypeAnalyzed
}

export function getType(obj: any): PrimitiveType | TypeAnalyzed {
    if (obj === null) {
        return "null"
    }
    if (Array.isArray(obj)) {
        let arrayTypes = obj.map(x => getType(x))
        arrayTypes = arrayTypes.filter((a, b) => arrayTypes.indexOf(a) === b)
        return "(" + arrayTypes.join("|") + ")[]"
    }
    return typeof obj
}

export function objectTypeAnalyze(obj: any): TypeAnalyzed {
    function analyze(o: any): TypeAnalyzed {
        let re: TypeAnalyzed = {}
        Object.getOwnPropertyNames(o).forEach(name => {
            let value = o[name]
            let type = getType(value)
            if (type === "object") {
                re[name] = analyze(value)
            }
            else {
                re[name] = type
            }
        })
        return re;
    }
    let analyzed = analyze(obj)
    return analyzed
}

*/