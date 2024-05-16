[![](https://img.shields.io/badge/NEAR-000000.svg?style=for-the-badge&logo=NEAR&logoColor=white)](https://near.org/)
[![](https://img.shields.io/badge/Contract-JS-yellow)](backend-smart-contract)
[![](https://img.shields.io/badge/Frontend-JS-yellow)](frontend-dapp)

# Film Combination Generator built on NEAR
This is the NEAR blockchain project repository for the "blockchains" course of the mobile computing master degree at the University of Applied Sciences Upper Austria.

Requirements<br />
> WSL on Windows<br />
> Uses nvm to switch between node 20 and node 18, otherwise the NEAR example projects would not build<br />
> NEAR CLI is strongly recommended<br />
> NEAR testnet account and wallet<br />
<br />

Components<br />
> Smart contract built with the NEAR SDK for JavaScript/TypeScript -> acts as the Backend, can be called with the NEAR CLI or through the frontend<br />
> dApp built with NodeJS/NextJS based on a NEAR example project, main contribution is a new component in the cards file as well as its corresponding page. Uses the smart contract from above
  
Additional notes<br />
> As of the time of this commit none of the tests in any NEAR examples that were tried as basis would work due to issues with asyncronous calls in the testing framework

Useful CLI commands<br />
> nvm use 18 <br />
> npm run dev 

> near login <br />
> near deploy <account-name> build/film-generator-near.wasm <br />
> near view filmgen.testnet get_film_combination <br />
> near view filmgen.testnet get_film_combinations <br /> 
> near call filmgen.testnet donate_to_photographer '{"photographerToDonateTo":"filmgen.testnet "}' --useAccount <account-name> --depositYocto 1000000
