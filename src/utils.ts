import Dexie, { type Table } from "dexie"
import type { CurrencyDataResponse } from "./main";

export default class MyDexieDatabase extends Dexie {

    /**
    * If you know you table_name ahead of time along with it's type
    * Explicitly declare the table 
    * your_table_name!: Table<YourTableType, string>; // The second parameter is the type of primary key
    * don't forget to import {Table} from 'dexie'
    */

    c_rates!: Table<CurrencyDataResponse, string>; // The second parameter is the type of primary key

    /** 
    * Other wise while working with table use something like -
    * const table = db.table<YourTableType>("your_table_name")
    * 
    * (if you are going to use the above then 
    * don't use this class and method all together because you are repeating the stuff)
    */

    /** constructor(database_name, version_no, stores) */
    /** constructor(database_name, version_no, table_no, primary_key) */
    constructor(
        database_name: string,
        version_no: number,
        // stores: Record<string, string>
        table_name: string,
        primary_key: string
    ) {
        super(database_name);
        this
            .version(version_no)
            // .stores({stores})
            .stores({ [table_name]: primary_key })
    }
}