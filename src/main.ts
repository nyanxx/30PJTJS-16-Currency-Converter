import MyDexieDatabase from "./utils"
import countriesData from "./assets/countriesData"
import type { CountryData } from "./assets/countriesData"

// Init Dexie
const db = new MyDexieDatabase("currency_rates_db", 1, "c_rates", "base_code")
// const table = db.table<CurrencyDataResponse>("c_rates")

const convertFrom = document.getElementById("current-currency-type")
const convertTo = document.getElementById("to-currency-type")

const sortedCountriesData: CountryData[] = countriesData.sort((a, b) => {
    return a.currency.localeCompare(b.currency)
})
sortedCountriesData.forEach((country: CountryData): void => {
    const optionElement: HTMLOptionElement = document.createElement("option")
    optionElement.value = country.code
    optionElement.textContent = `${country.currency} (${country.country})`
    if (convertFrom instanceof HTMLSelectElement) {
        convertFrom.appendChild(optionElement)
    }
    if (convertTo instanceof HTMLSelectElement) {
        convertTo.appendChild(optionElement.cloneNode(true))
    }
})


const formElement = document.getElementById("form")
if (formElement instanceof HTMLFormElement) {
    formElement.addEventListener("submit", (event) => {
        event.preventDefault()
        const form = new FormData(formElement)
        const amount = form.get("amount") as number | null
        const changeFrom = form.get("current-currency-type") as string | null
        const changeTo = form.get("to-currency-type") as string | null
        if (amount && changeFrom && changeTo) {
            convertCurrency(changeFrom, changeTo, amount)
        } else {
            console.log("fields are missing!")
        }
    })

}

export type CurrencyDataResponse = {
    result: string,
    provider: string,
    documentation: string,
    terms_of_use: string,
    time_last_update_unix: number,
    time_last_update_utc: string,
    time_next_update_unix: number,
    time_next_update_utc: string,
    time_eol_unix: number,
    base_code: string,
    rates: Record<string, number>,
}

async function getFromCache(ccFrom: string, ccTo: string): Promise<number | null> {
    const data: CurrencyDataResponse | undefined = await db.c_rates.get(ccFrom)
    if (data) {
        console.log("serving from CACHE")
        return data.rates[ccTo]
    } else {
        return null
    }
}

async function convertCurrency(from: string, to: string, amount: number): Promise<void> {
    let exchageRate: number | null = await getFromCache(from, to)
    if (!exchageRate) {
        // fetch from origin
        console.log("fetching from ORIGIN....")
        // https://open.er-api.com/v6/latest/USD
        try {
            // const response = await fetch("../dummyData.json")
            const response = await fetch(`https://open.er-api.com/v6/latest/${from}`)
            const data: CurrencyDataResponse = await response.json()
            if (data.result === "success" && data.base_code === from) {
                // Add in cache
                try {
                    db.c_rates.put(data)
                    console.log("Data CACHED success!")
                } catch (error) {
                    console.error("Error CACHING data! :-", error)
                }
                exchageRate = data.rates[to]
            }
        } catch (error) {
            console.error("Error fetching data from ORIGIN! :-", error)
        }
    }
    if (exchageRate) {
        const convertedAmount = amount * exchageRate
        renderCurrency(convertedAmount, to)
    }
}

function renderCurrency(amount: number, currencyCode: string) {
    const result: HTMLDivElement | null = document.querySelector("#result")
    if (result) {
        result.style = "display: block"
        result.innerText = `${amount.toFixed(2)} ${currencyCode}`
    }
}