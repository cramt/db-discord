import { expect } from "chai";
import { discordDB } from "../db-discord";
import { TOKEN } from "../secret";
import * as Discord from "db-discord-discord.js"
import { GUID } from "../utilities";

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
    let shortTableID = ""
    it5000("create new short table", async () => {
        let shortTable = await db.createNewShortTable<justTestInterfaceForDB>(shortTableName)
        shortTableID = shortTable.id
        expect(db.tables.map(x => x.Value)).to.include(shortTable)
    })


    it5000("get short table from name", async () => {
        let shortTable = await db.getShortTableFromName<justTestInterfaceForDB>(shortTableName)
        expect(shortTable).to.not.equal(null)
        expect(db.tables.filter(x => x.Key.id === shortTable!.id).length > 0).to.equal(true)
    })


    it5000("get short table from id", async () => {
        let shortTable = await db.getShortTableFromID<justTestInterfaceForDB>(shortTableID)
        expect(shortTable).to.not.equal(null)
        expect(db.tables.filter(x => x.Key.id === shortTable!.id).length > 0).to.equal(true)
    })

    let randomString = GUID();


    it5000("write to short table and find it", async () => {
        let shortTable = await db.getShortTableFromID<justTestInterfaceForDB>(shortTableID)!
        expect(shortTable).to.not.equal(null)
        let id = await shortTable.writeExpectSearch({
            test: randomString
        });
        let search = await shortTable.search({
            searchObject: {
                test: randomString
            }
        });
        expect(search.length).to.not.equal(0)
        expect(id).to.equal(search[0].Key)
    })
})