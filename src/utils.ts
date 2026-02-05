import Dexie, { type Table } from "dexie"
import type { CurrencyDataResponse } from "./main";

export default class MyDexieDatabase extends Dexie {
    c_rates!: Table<CurrencyDataResponse, string>;
    constructor(
        database_name: string,
        version_no: number,
        table_name: string,
        primary_key: string
    ) {
        super(database_name);
        this
            .version(version_no)
            .stores({ [table_name]: primary_key })
    }
}