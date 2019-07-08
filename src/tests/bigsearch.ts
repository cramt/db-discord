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
    it5000("get new short table", async () => {
        shortTable = await db.getShortTableFromName<justTestInterfaceForDB>(shortTableName)!
        expect(shortTable).to.not.equal(null)
        expect(db.tables.map(x => x.Value.id)).to.include(shortTable.id)
    })


    it("find test243", async () => {
        let result = await shortTable.search({
            searchObject: {
                test: "test243"
            },
            callback(obj) {
                return !(obj.test === "test243")
            }
        });
        expect(result[0].Value.test).to.equal("test243")
    }).timeout(1000000000000)

})