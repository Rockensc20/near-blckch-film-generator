const { Worker, NearAccount, NEAR } = require('near-workspaces');
const assert = require('assert');

// Global context
describe('Near Contract Tests', () => {
  let worker;
  let accounts;

  beforeEach(async () => {
    console.log(near.randomSeed())
    // Create sandbox, accounts, deploy contracts, etc.
    worker = await Worker.init();

    // Deploy contract
    const root = worker.rootAccount;
    const contract = await root.createSubAccount('test-account');

    // Get wasm file path from package.json test script in folder above
    await contract.deploy(process.argv[2]);

    // Save state for test runs, it is unique for each test
    accounts = { root, contract };
    done();
  });

  afterEach(async () => {
    // Stop Sandbox server
    try {
      await worker.tearDown();
    } catch (error) {
      console.log('Failed to stop the Sandbox:', error);
    }
  });

  it('returns the default greeting', async () => {
    const { contract } = accounts;
    const greeting = await contract.view('get_greeting', {});
    assert.strictEqual(greeting, 'Hello');
    done();
  });

  it('changes the greeting', async () => {
    const { root, contract } = accounts;
    await root.call(contract, 'set_greeting', { greeting: 'Howdy' });
    const greeting = await contract.view('get_greeting', {});
    assert.strictEqual(greeting, 'Howdy');
    done();
  });
  
});