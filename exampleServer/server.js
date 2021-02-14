const http = require('http');
const braintree = require("braintree");
const config = require('./config')

const hostname = '127.0.0.1';
const port = 3000;

const gateway = new braintree.BraintreeGateway(config);

const server = http.createServer((req, res) => {
    switch (req.url) {
        case "/token":
            gateway.clientToken.genxerate({}, (err, response) => {
                res.writeHead(200, {'Content-Type': 'application/json'});

                return res.end(JSON.stringify({success: true, clientToken: response.clientToken}))
            });
            break
        case "/pay":
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            })
            req.on('end', () => {
                const {nonce, amount, deviceData} = JSON.parse(data)
                gateway.transaction.sale({
                    amount,
                    paymentMethodNonce: nonce,
                    deviceData: deviceData,
                    options: {
                        submitForSettlement: true
                    }
                }, (err, result) => {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        return res.end(JSON.stringify({success: false, err, result}))
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        return res.end(JSON.stringify(result))
                    }
                });
            })
            break

        default:
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({message: 'Bad request'}));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
