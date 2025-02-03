const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const getDate = require("./modules/utils");
const messages = require("./lang/en/en.json");

const FILE_PATH = path.join(__dirname, "file.txt");

class ServerHandler {
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const { pathname, query } = parsedUrl;

        if (req.method === "GET") {
            if (pathname === "/COMP4537/lab/3/getDate/") {
                this.getDateHandler(res, query);
            } else if (pathname === "/COMP4537/lab/3/writeFile/") {
                this.writeFileHandler(res, query);
            } else if (pathname.startsWith("/COMP4537/lab/3/readFile/")) {
                this.readFileHandler(res, pathname);
            } else {
                this.sendResponse(res, 404, "text/plain", "404 Not Found");
            }
        } else {
            this.sendResponse(res, 405, "text/plain", "Method Not Allowed");
        }
    }

    getDateHandler(res, query) {
        const name = query.name || "Guest";  
        const currentTime = getDate();
        const responseMessage = `<p style="color:blue;">${messages.greeting.replace("%1", name)} ${currentTime}</p>`;
        this.sendResponse(res, 200, "text/html", responseMessage);
    }

    writeFileHandler(res, query) {
        const text = query.text;
        if (!text) {
            this.sendResponse(res, 400, "text/plain", "Error: Missing text parameter");
            return;
        }

        fs.appendFile(FILE_PATH, text + "\n", (err) => {
            if (err) {
                this.sendResponse(res, 500, "text/plain", "Error writing to file");
            } else {
                this.sendResponse(res, 200, "text/plain", `Text appended: ${text}`);
            }
        });
    }

    readFileHandler(res, pathname) {
        const filename = pathname.replace("/COMP4537/lab/3/readFile/", "");
        const filePath = path.join(__dirname, filename);

        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                this.sendResponse(res, 404, "text/plain", `Error: ${filename} not found`);
            } else {
                this.sendResponse(res, 200, "text/plain", data);
            }
        });
    }

    sendResponse(res, statusCode, contentType, message) {
        res.writeHead(statusCode, { "Content-Type": contentType });
        res.end(message);
    }
}

class Server {
    constructor(port) {
        this.port = port;
        this.handler = new ServerHandler();
        this.server = http.createServer((req, res) => this.handler.handleRequest(req, res));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running atlocalhost:${this.port}/COMP4537/lab/3/`);
        });
    }
}

const port = process.env.PORT || 3000;
const app = new Server(port);
app.start();
