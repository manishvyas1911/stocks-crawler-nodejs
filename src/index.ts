import fetch from 'node-fetch';
import cheerio from 'cheerio';
var json2xlsx = require('node-json-xlsx');
var fs = require('fs');
var json2xls = require('json2xls');

const processData = function (tableData: any, name: String) {
    let stockPriceCAGRObject = {
        "StockName": name,
        "1Year": '0%',
        "3Years": '0%',
        "5Years": '0%',
        "10Years": '0%'
    };
    if (tableData[2]) {
        let stockPriceCAGRStr = tableData[2].trim().replace(/\n+/g, '').replace(/\s+/g, ' ');
        let stockPriceCAGR = stockPriceCAGRStr.split(/\r?\s/);

        stockPriceCAGR.forEach((cagr: string, i: Number) => {
            if (i == 5) {
                stockPriceCAGRObject["10Years"] = cagr;
            }
            if (i == 8) {
                stockPriceCAGRObject["5Years"] = cagr
            }
            if (i == 11) {
                stockPriceCAGRObject["3Years"] = cagr
            }
            if (i == 14) {
                stockPriceCAGRObject["1Year"] = cagr
            }
        });
    }

    return stockPriceCAGRObject;
}

const crawl = async ({ url, name }: any) => {

    const response = await fetch("https://www.screener.in/company/" + url)
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log($('.ranges-table').text())
    const tableData = $('.ranges-table')
        .map((i, table) => {
            return $(table).text()
        })
        .get();
    console.log(tableData);

    // let compountSalesGrowth = tableData[0].trim().split(/\r?\n/);
    // let compountProfitGrowth = tableData[1].trim().split(/\r?\n/);
    //  let ReturnOnEquity = tableData[3].trim().split(/\r?\n/);
    if (tableData) {
        return await processData(tableData, name)
    } else {
        console.log("Not Processed", name, tableData);

    }

}



// Main'
var oilInputJSON = require('./input/oil.json');
var bankInputJSON = require('./input/finance.json');
var fmcgInputJSON = require('./input/fmcg.json');
var itInputJSON = require('./input/it.json');
var pharmaInputJSON = require('./input/pharma.json');
var chemicalInputJSON = require('./input/chemical.json');
var miscInputJSON = require('./input/other.json');

async function processStocks(input: any) {
    let response = [];
    for (const i of input) {
        response.push(await crawl(i))
    }
    return response;
};
const delay = function (ms: number) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}


processStocks(oilInputJSON).then(value => {
    let finalResponse = [...value]
    delay(10000);
    processStocks(bankInputJSON).then(value => {
        finalResponse = [...value, ...finalResponse]
        delay(10000);
        processStocks(fmcgInputJSON).then(value => {
            finalResponse = [...value, ...finalResponse]
            delay(10000);
            processStocks(itInputJSON).then(value => {
                finalResponse = [...value, ...finalResponse]
                delay(10000);
                processStocks(pharmaInputJSON).then(value => {
                    finalResponse = [...value, ...finalResponse]
                    delay(10000);
                    processStocks(chemicalInputJSON).then(value => {
                        finalResponse = [...value, ...finalResponse]
                        processStocks(miscInputJSON).then(value => {
                            finalResponse = [...value, ...finalResponse]
                            var xls = json2xls(finalResponse);
                            console.log("aFTER pROCess", finalResponse);
                            fs.writeFileSync('stocks.xlsx', xls, 'binary');
                        });

                    });
                });
            });

        });
    });
});


















