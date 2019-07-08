import { expect } from "chai";
import { discordDB } from "../db-discord";
import { TOKEN } from "../secret";
import * as Discord from "db-discord-discord.js"
import { GUID } from "../utilities";
import { ShortTable } from "../ShortTable";

function it5000(str: string, f: () => void) {
    return it(str, f).timeout(5000)
}

describe("test", () => {
    const client = new Discord.Client();


    it5000("login to discord", async () => {
        let promise = new Promise((resolve, reject) => {
            client.on("ready", () => {
                resolve(client)
            });
            client.on("error", e => {
                reject(e)
            })
        })
        client.login(TOKEN)
        expect(await promise).to.equal(client)
    })

    it5000("delete the whole thing", async () => {
        let guild = client.guilds.array()[0]
        await Promise.all(guild.channels.map(x => x.delete()))
    })


    let db: discordDB = undefined as any as discordDB;
    it5000("init discordDB", async () => {
        db = await discordDB.init(client.guilds.array()[0])
        expect(db.metatable).to.not.equal(undefined)
    })


    interface justTestInterfaceForDB {
        test: string
    }

    const shortTableName = "test_short_table"
    let shortTable: ShortTable<justTestInterfaceForDB>;
    it5000("create new short table", async () => {
        shortTable = await db.createNewShortTable<justTestInterfaceForDB>(shortTableName)
        expect(db.tables.map(x => x.Value)).to.include(shortTable)
    })


    it("add 500 things to table", async () => {
        let a: Promise<string>[] = []
        for (let i = 0; i < 500; i++) {
            a.push(shortTable.write({
                test: "test" + i
            }))
        }
        await Promise.all(a)
    }).timeout(1000000000000)

})