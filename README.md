## dfuse API Push Guaranteed Example (via `eosjs`)

This repository sole purposes is to demonstrate you to setup `eosjs` to push a
transaction through dfuse API Push Guaranteed endpoint.

The endpoint is 100% compatible with EOS push transaction endpoint. The single
difference is that, when the required headers are present, you'll get the response
back only when your transaction has reach a block or is irreversible (depending
on value passed in header `X-Eos-Push-Guarantee`).

## Quick Start

    yarn install

Create a `.env` file with the following content:

    export DFUSE_IO_API_KEY=<dfuse API Key Here>
    export SIGNING_PRIVATE_KEY=5JpjqdhVCQTegTjrLtCSXHce7c9M8w7EXYZS7xC13jVFF4Phcrx

Load it in your environment:

    source .env

Launch the `push-transaction.ts` script:

    yarn run ts-node push-transaction.ts

**Note** Of course, you will need to adapt `push-transaction.ts` so the transaction
pushed to the network make sense and can be completed correctly.

### Headers

- `Authorization: Bearer $DFUSE_API_TOKEN`
- `X-Eos-Push-Guarantee: in-block | irreversible`
