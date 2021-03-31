/* IMPORTS */
const config = require("./config.json"); //import your configuration file
const app = require("fastify")({ logger: false }); //import fastify, which we will be using as our server - alternatively you could use a package such as express
const fetch = require("node-fetch"); //import node-fetch which we will use to make the requests to the Tixte API
const authLink = `https://tixte.com/oauth/authorize?client_id=${config.clientId}&scope=${config.clientScopes.join("+")}&response_type=code&redirect_uri=${config.clientRedirectUri}`;

/* REGISTERS */
//this module enables us to access the users cookies - this is how we store and check the users authorization
app.register(require("fastify-cookie"), {
    secret: config.cookieSecret, //this secret will be used to sign cookies
    parseOptions: {}
});

/* ROUTES */
app.get("/", async (req, res) => {
    const authCookie = req.cookies.accessToken;
    //if the user does not have an auth token set, we redirect them to the oauth flow
    if (!authCookie || !req.unsignCookie(authCookie).value) return res.redirect(authLink);

    //if they do have an access token, we try to fetch their user information
    const rawResponse = await fetch(`https://api.tixte.com/v1/users/@me`, {
        headers: {
            "Authorization": `Bearer ${req.unsignCookie(authCookie).value}` //here we fetch the access token
        }
    });
    const parsedResponse = await rawResponse.json(); //parse the response body
    if (!parsedResponse.success) return res.redirect(authLink); //we redirect them to re-authenticate if the response is not successful
    
    //if the response returned the user successfully, we return the message
    res.send(`Hello, ${parsedResponse.data.username}!`);
});

app.get("/callback", async (req, res) => {
    if (!req.query.code) return res.redirect(authLink) //if the user did not send a callback code, we redirect them to authenticate
   
    //if they do have an access token, we try to fetch their user information
   const rawResponse = await fetch(`https://api.tixte.com/v1/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json" //you can also use application/x-www-form-urlencoded if you prefer
        },
        body: JSON.stringify({
            client_id: config.clientId, //specify the client id
            client_secret: config.clientSecret, //specify the client secret
            grant_type: "authorization_code", //specify the grant type
            scope: config.clientScopes.join(" "), //specify our scopes
            redirect_uri: config.clientRedirectUri, //specify our client redirect uri
            code: req.query.code //specify the code the user returned
        })
    });
    const parsedResponse = await rawResponse.json(); //parse the response body
    if (!parsedResponse.success) return res.redirect(authLink); //we redirect them to re-try if the response is not successful

    //if the response is successful, we set the clients cookie
    res.setCookie("accessToken", parsedResponse.data.access_token, {
        path: "/",
        signed: true
    });

    //redirect the client to the main homepage
    res.redirect("/");
});

/* SERVER */
async function build() {
    await app.listen(config.fastifyPort, "0.0.0.0"); //listen to all connections on port "8080"
    console.log(`App listening on port ::${config.fastifyPort}`) //console.log if the app successfully starts
};

build().catch(console.log); //run the build process, and catch any errors