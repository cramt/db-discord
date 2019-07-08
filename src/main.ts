import { removeUnacceptedCharactersForDiscord } from "./utilities";

/*
interface unicodeTesting {
    character: string
}

let bigest = 4294967296;
(async () => {
    let client = await login(TOKEN)
    let channel = client.guilds.array()[0].channels.array().filter(x => x.id === "593186816828375060")[0] as Discord.TextChannel
    let totalList: string[] = []
    let countsAsEmpty: string[] = []
    for (let i = 0; i < bigest; i++) {
        let char = String.fromCharCode(i)
        console.log("char: " + char)
        try {
            await channel.send(char)
        }
        catch (e) {
            console.log(char + " counts as empty")
            countsAsEmpty[countsAsEmpty.length] = char
        }
        console.log("sent " + char)
        let search = await channel.search({
            content: char
        })
        if (search.totalResults === 0) {
            console.log("found none")
            totalList[totalList.length] = char
        }
        else {
            let allMessages = flatMap(search.messages)
            console.log("found: " + allMessages.map(x => x.content).join(", "))
            await Promise.all(allMessages.map(x => x.delete()))
        }
    }
    let totalListWritestream = fs.createWriteStream("totalList.json")
    totalListWritestream.write(JSON.stringify(totalList))
    totalListWritestream.close();
    let countsAsEmptryWritestream = fs.createWriteStream("countsAsEmptry.json")
    countsAsEmptryWritestream.write(JSON.stringify(totalList))
    countsAsEmptryWritestream.close();
})()
*/
console.log(removeUnacceptedCharactersForDiscord("hello_thereä324_:;は#\"¤#"));