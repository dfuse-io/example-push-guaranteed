import { Api, JsonRpc, JsSignatureProvider } from "eosjs"
import fetch, { Request, RequestInit, Response } from "node-fetch"
import { TextDecoder, TextEncoder } from "text-encoding"

const config = readConfig()

/**
 * Here the actual difference to make our push guaranteed API to work. You need to customize
 * `fetch` so that custom headers are appended to the request performed.
 *
 * The headers that are required:
 *  - `Authorization: Bearer $DFUSE_API_TOKEN`
 *  - `X-Eos-Push-Guarantee: in-block | irreversible`
 *
 * Those two headers needs to be present on your push transaction request otherwise, the
 * push guaranteed API will **not** kicked in and you will use the "normal endpoint" in
 * those situations.
 */
const customizedFetch = (input: string | Request, init: RequestInit): Promise<Response> => {
  if (init.headers === undefined) {
    init.headers = {}
  }

  const headers = init.headers as { [name: string]: string }
  headers["Authorization"] = `Bearer ${config.dfuseApiKey}`
  headers["X-Eos-Push-Guarantee"] = "in-block" // Can be "irreversible" also

  return fetch(input, init)
}

/**
 * Demonstrates how to push a transaction with guaranteed using dfuse API endpoint.
 *
 * Requierements:
 *  - Have an environment variable named `DFUSE_IO_API_KEY` containing your dfuse API key
 *  - Have an environment variable name `SIGNING_PRIVATE_KEY` containing the private key used to sign the trx
 */
async function main() {
  const signatureProvider = new JsSignatureProvider([config.privateKey])
  const rpc = new JsonRpc(config.endpoint, { fetch: customizedFetch })
  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  })

  const result = await api.transact(
    {
      actions: [
        {
          account: "eosio.token",
          name: "transfer",
          authorization: [
            {
              actor: "eosio",
              permission: "active"
            }
          ],
          data: {
            from: "eosio",
            to: "eosuser2",
            quantity: "0.0001 EOS",
            memo: ""
          }
        }
      ]
    },
    {
      blocksBehind: 3,
      expireSeconds: 30
    }
  )

  console.log("Transaction push result.", result)
}

function readConfig() {
  const endpoint = process.env.API_ENDPOINT || "https://mainnet.eoscanada.com"

  const dfuseApiKey = process.env.DFUSE_IO_API_KEY
  if (dfuseApiKey === undefined) {
    console.log(
      "You must have a 'DFUSE_IO_API_KEY' environment variable containing your dfuse API key."
    )
    process.exit(1)
  }

  const privateKey = process.env.SIGNING_PRIVATE_KEY
  if (privateKey === undefined) {
    console.log(
      "You must have a 'SIGNING_PRIVATE_KEY' environment variable containing private used to sign."
    )
    process.exit(1)
  }

  return {
    endpoint,
    dfuseApiKey: dfuseApiKey!,
    privateKey: privateKey!
  }
}

main()
  .then(() => {
    console.log("Transaction pushed.")
    process.exit(0)
  })
  .catch((error) => {
    console.log("An error occurred.", error)
    process.exit(1)
  })
