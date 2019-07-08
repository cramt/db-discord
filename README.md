# db-discord
db-discord is a library that uses discord guilds and text channels as databases. db-discord relies on discord.js

examble on how to use db-discord in typescript

```ts
import { discordDB, login } from "db-discord";

//this interface defines the structure of the objects that the table handles
interface thing {
    name: string;
}

//we start a function thats async so we can await stuff
(async () => {
    //login to discord
    let client = await login(TOKEN);
    //find whatever guild you want
    let guild = client.guilds.array()[0];
    //init the db with set guild
    //this will create a metatable in the guild
    let db = await discordDB.init(guild)
    //get or create the new table
    //this example uses short tables which is the simples type of table to use
    //a short table uses discord messages to store data, which mean fast and easy to search through, but only 2000 characters per message
    let hello_there = db.getOrCreateShortTable<thing>("hello_there")
    //we write a new entry to the table
    let id = await hello_there.write({ name: "test" })
    //here we get the entry based on the id and log it
    hello_there.get(id).then(console.log)
    //we can also search for the entry
    let result = await shortTable.search({
        searchObject: {
            name: "test"
        },
    });
    //and log it
    console.log(result[0].Value)
    //the search can also be filtered using regex
    let result = await shortTable.search({
        searchObject: {
            name: "test"
        },
        regexChecker: {
            name: /t.st/gm
        }
    });
    //the search can also be modifed during the search or cut of early if the desired entry is found
    let result = await shortTable.search({
        searchObject: {
            name: "test"
        },
        //if this callback function returns false, the search will stop and all entries will be returned
        //basically think of it as a "i only want x amounts of objects that has this very specific property, and no more than that" method
        //can also be used to just find the first property
        //can also be used to change the properties of the entries thats gonna be returned mid-search
        callback(obj) {
            return !(obj.name === "test")
        }
    });
})()
```