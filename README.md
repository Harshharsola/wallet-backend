## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Api Details
Backend is deployed on heroku so apis are 
domain = https://digital-wallet-66e8c445a671.herokuapp.com
fetch wallet details = /wallet/:walletId
setup wallet = /wallet/setup
perform transactions = wallet/transact/:walletId  
                        body = {
                          amount: number;
                          description: string; 
                        }
fetch transactions = wallet/transactions?walletId={walletId}?skip={skip}?limit={limit}
fetch transactions csv file = wallet/transactions/csv?walletId={walletId}
