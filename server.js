const http = require('http');
const fs = require('fs');
const readline = require('readline');

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let contactPrefix = '/contacts/';
let parsedData;

let readBody = (req, callback) =>{
    let body = '';
    req.on('data', (chunk)=>{
        body += chunk.toString();
    });
    req.on('end', ()=>{
        callback(body);
    });
}

let server = http.createServer((req, res) => {
    if (req.url === "/contacts" && req.method === "GET"){
        fs.readFile('hobbits.json',(error, data) =>{
            if (error){
                res.end('hobbits not found');
            }
            else{
                res.end(data.toString());
            }
        });
    }
    else if (req.url.startsWith(contactPrefix) && req.method === "GET"){
        let number = req.url.slice(contactPrefix.length);
        fs.readFile('hobbits.json', (error, data) => {
            if (error){
                res.end('hobbits not found');
            }
            else{
                parsedData = JSON.parse(data);
                res.end(parsedData[number]);
            }
        });
    }
    else if (req.url.startsWith(contactPrefix) && req.method === "DELETE"){
        let number = req.url.slice(contactPrefix.length);
        fs.readFile('hobbits.json', (error, data) =>{
            if (error){
                res.end('hobbits not found');
            }
            else{
                parsedData = JSON.parse(data);
                res.end('You have deleted ' + parsedData[number]);
                delete parsedData[number];
                let stringifiedData = JSON.stringify(parsedData);
                fs.writeFile('hobbits.json', stringifiedData, (error) => {
                    if (error){
                        res.end(error);
                    }
                });
            }
        });
    }
    else if (req.url === "/contacts" && req.method === "POST"){
        //grab information from the post
        //read file and place data in let then add new info to let and then write file
        fs.readFile('hobbits.json', (error, data) => {
            parsedData = JSON.parse(data);
            readBody(req, (body)=>{
                let contact = JSON.parse(body);
                console.log(contact);
                res.end('Created Contact!');
                let newKey = ((Object.keys(parsedData).length) + 1);
                parsedData[newKey] = contact;
                let stringifiedData = JSON.stringify(parsedData);
                fs.writeFile('hobbits.json', stringifiedData, (error) =>{
                    if (error){
                        res.end(error)
                    }
                    else {
                        res.end(contact + " has been added to the list!")
                    }
                });
            });
        });
    }
});

server.listen(3000);
