const http = require('http');
const fs = require('fs');
const pg = require('pg-promise')();
const dbConfig = 'postgres://MitchGuth@localhost:5432/contacts';
const db = pg(dbConfig);

let parsedData;

let readBody = (req, callback) =>{
    let body = '';
    req.on('data', (chunk)=>{
        body += chunk.toString();
    });
    req.on('end', ()=>{
        callback(body);
    });
};

let notFound = (req, res, matches) =>{
    res.end("404 not found.");
};

let generateID = () => {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
};

let getContact = (req, res, matches) => {
    db.query('SELECT * FROM characters WHERE id = ' + matches[0])
        .then((characters) =>{
            res.end(JSON.stringify(characters))
        });
    // fs.readFile('hobbits.json', (error, data) => {
    //     if (error){
    //         res.end('hobbits not found');
    //     }
    //     else{
    //         var parsedData = JSON.parse(data);
    //         res.end(JSON.stringify(parsedData[matches]));
    //     }
    //     });
};

let getAllContacts = (req, res, matches) => {
    db.query('SELECT * FROM characters')
        .then((characters) => {
            res.end(JSON.stringify(characters))
        });
    // fs.readFile('hobbits.json', (error, data) =>{
    //     if (error){
    //         res.end('hobbits not found');
    //     }
    //     else{
    //         res.end(data.toString());
    //     }
    // });
};

let deleteContact = (req, res, matches) => {
    fs.readFile('hobbits.json', (error, data) =>{
        if (error){
            res.end('hobbits not found');
        }
        else{
            parsedData = JSON.parse(data);
            res.end('You have deleted ' + parsedData[matches]);
            delete parsedData[matches];
            let stringifiedData = JSON.stringify(parsedData);
            fs.writeFile('hobbits.json', stringifiedData, (error) => {
                if (error){
                    res.end(error);
                }
            });
        }
    });
};

let createContact = (req, res, matches) => {
    fs.readFile('hobbits.json', (error, data) => {
        parsedData = JSON.parse(data);
        readBody(req, (body) => {
            let contact = JSON.parse(body);
            console.log(contact);
            res.end('Created Contact!');
            let newKey = generateID();
            contact.id = newKey;
            parsedData[newKey] = contact;
            let stringifiedData = JSON.stringify(parsedData);
            fs.writeFile('hobbits.json', stringifiedData, (error) =>{
                if (error){
                    res.end(error)
                }
                else {
                    //adjust so just the name is printed
                    res.end(contact + " has been added to the list!")
                }
            });
        });
    });
};

let renderHome = (req, res, matches) => {
    fs.readFile('frontend/index.html', 'utf8', (error, data) => {
        if (error) {
            res.end(error);
        }
        else{
            res.end(data);
        }

    });
};

let renderIndexJS = (req, res, matches) => {
    fs.readFile('frontend/index.js', 'utf8', (error, data) => {
        if (error) {
            res.end(error);
        }
        else{
            res.end(data);
        }
    });
};

let routes = [
    {
        method: "GET", 
        url: /^\/contacts$/,
        run: getAllContacts
    },
    {
        method: "GET",
        url: /^\/contacts\/([0-9]+)$/,
        run: getContact
    },

    {
        method: "DELETE", 
        url: /^\/contacts\/([0-9]+)$/ ,
        run: deleteContact
    },
    {
        method: "POST", 
        url: /^\/contacts$/,
        run: createContact
    },
    {
        method: "GET", 
        url: /^\/$/,
        run: renderHome
    },
    {
        method: "GET",
        url: /^.*$/,
        run: renderIndexJS
    },
    {
        method: "GET",
        url: /^.*$/,
        run: notFound
    }
]

let server = http.createServer((req, res) => {
    console.log(req.url);
    let route = routes.find((route) =>
        route.url.test(req.url) && req.method === route.method);
    let matches = route.url.exec(req.url).slice(1);
    console.log("server working")
    route.run(req, res, matches);
});

server.listen(3000);
