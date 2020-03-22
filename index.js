var http = require('http');
var url = require('url');
var fs = require("fs");
var Jimp = require("jimp");

var server = http.createServer(function (req, res) {
    
    function writehex(string, x=0, y=0, csshex, font, subtitle=false){
        return new Promise(res => {
            new Jimp(500, 500, 0x0, (err, img) => {
                Jimp.loadFont(font).then(font => {
                    var maxwidth = 460;
                    var maxhigth = 75;
                    if(subtitle){
                        x = x + 75;
                        maxhigth = 25;
                    }
                    img.print(font, y, x, {
                        text: string,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                        // alignmentY: Jimp.VERTICAL_ALIGN_CENTER
                    }, maxwidth);
                    img.color([{ apply: 'xor', params: [csshex] }])
                    res(img);
                });
            });
        });
    };

    function edit(obj, preview = false){
        return new Promise((res, rej) => {
            if(typeof obj != "object"){
                rej("need an object as key");
                return;
            }
            Jimp.read("./background/" + obj.background + ".jpg", async (err, background) => {
                if(err){
                    rej("err reading file")
                    return
                };

                var x = 370;
                var y = 20;

                var name = await writehex(obj.name, x, y, obj.namecol, Jimp.FONT_SANS_64_BLACK);
                background.blit(name, 0, 0);
                if(obj.squad.length > 0){
                    var squad = await writehex(obj.squad, x, y, obj.squadcol, Jimp.FONT_SANS_32_BLACK, true);
                    background.blit(squad,0 , 0);
                }
                if(preview){
                    background.quality(40);
                    background.resize(400, 400);
                }else{
                    background.quality(100);
                }
                background.getBufferAsync(Jimp.MIME_JPEG).then(img_buffer => res(img_buffer));
            });
        });
    };

    function Images(type = "", obj=false){
        return new Promise((res, rej) => {
            try {
                if(!["ready", "preview", "download"].includes(type)){
                    rej("No valid Requesttype");
                    return;
                }
                var vorlagen = fs.readdirSync("./background");
                if(type == "ready"){
                    var ret = {background : []};
                    vorlagen.forEach(i => {
                        var item = { name : i.split(".")[0], base64 : ""};
                        item.base64 = new Buffer.from(fs.readFileSync("./background/" + i)).toString('base64');
                        ret.background.push(item);
                    })
                    res(ret.background);
                }
                if(type == "preview"){
                    // console.log(obj.background);
                    if(!vorlagen.includes(obj.background + ".jpg")){
                        res("unknown background");
                        return;
                    }
                    // JIMP STUFF
                    edit(obj, true).then(img => {
                        var previewpic = new Buffer.from(img).toString('base64');
                        if(typeof previewpic == "string"){
                            res(previewpic);
                        }else{
                            res("ERR");
                        }
                    }).catch(err => res("err"));
                }
                if(type == "download"){
                    edit(obj).then(pic => res(pic));
                }
            } catch (error) {
                rej(error);
            }
        });
    }

    if(req.method != "GET"){
        res.writeHead(404, "NOT FOUND");
        res.end();
        return
    }
    // console.log("Got GET");
    var querry = url.parse(req.url, true).query;
    // console.log("Querry:" + JSON.stringify(querry));
    try {
        // https://wiki.selfhtml.org/wiki/MIME-Type/Übersicht
        if(req.url.startsWith("/index") || req.url == "/"){
            // res.write("Index");
            res.end(fs.readFileSync("./index/index.html"));
        }else if(req.url == "/favicon.ico"){
            // TODO: Return ICON
            res.end();
        } else if(req.url.startsWith("/assets/")){ 
            //console.log(req.url);
            if(req.url.startsWith("/assets/img/")){
                if(req.url.endsWith(".svg")){
                    res.writeHead(200, {'Content-Type': 'image/svg+xml'})
                }else if(req.url.endsWith(".png")){
                    res.writeHead(200, {'Content-Type': 'image/png'})
                }
            }else if(!req.url.startsWith("/assets/js/")){
                res.writeHead(200, {'Content-Type': 'text/css'})
            }else{
                res.writeHead(200, {'Content-Type': 'text/javascript'})
            }
            res.end(fs.readFileSync("./index" + req.url));
        } else if(req.url.startsWith("/attachments")){
            res.writeHead(200, {'Content-Type' : 'application/json'})
            Images("ready").then(result => res.end(JSON.stringify(result))).catch(err => res.end("err-300"));
        }else if(req.url.startsWith("/preview")){
            Images("preview", querry).then(result => res.end(result)).catch(err => res.end("err-300"));
        }else if(req.url.startsWith("/download")){
            Images("download", querry).then(result => res.end(result)).catch(err => res.end("err-300"));
        }else{
            res.writeHead(404, "NOT FOUND");
        }
    } catch (error) {
        res.writeHead(300, "INTERNAL ERROR");
        res.end();
    }
}).listen(80);

server.on("listening", () => console.log("Server startet on " + server.address().port));
