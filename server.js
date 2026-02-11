import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("src/mock/db.json"); // ajusta aquí
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use((req, res, next) => {
    res.header("Access-Control-Expose-Headers", "X-Total-Count");
    next();
});
server.use(router);

server.listen(3002, () => console.log("JSON Server on http://localhost:3002"));
