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
Backend is deployed on heroku so apis are \
domain = https://digital-wallet-66e8c445a671.herokuapp.com\
fetch wallet details = /wallet/:walletId\
setup wallet = /wallet/setup\
perform transactions = wallet/transact/:walletId  \
                        body = {\
                          amount: number;\
                          description: string; \
                        }\
fetch transactions = wallet/transactions?walletId={walletId}?skip={skip}?limit={limit}\
fetch transactions csv file = wallet/transactions/csv?walletId={walletId}\

## Database design
# Wallet Schema
The Wallet schema represents a user's wallet and contains information about the wallet's name, balance, and the date it was created.\
Fields\
name: The name of the wallet (e.g., "Savings", "Checking").\
balance: The current balance of the wallet.\
date: The date when the wallet was created\

# Transaction Schema
The Transaction schema represents a financial transaction that is associated with a wallet. It contains information about the transaction's amount, description, date, type (credit or debit), and the balance after the transaction.\
balance: The balance of the wallet after the transaction.\
walletId: A reference to the Wallet associated with this transaction.\
amount: The amount of money involved in the transaction.\
description: A brief description of the transaction.\
date: The date when the transaction occurred.\
type: The type of the transaction (either "credit" or "debit").\

The Transaction schema has a field walletId which is a reference to the Wallet schema. This establishes a one-to-many relationship between Wallet and Transaction.
