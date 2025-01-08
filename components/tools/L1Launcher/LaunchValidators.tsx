import { useWizardStore } from './store';
import NextPrev from './ui/NextPrev';
import { useState } from 'react';
import Note from './ui/Note';
import Pre from './ui/Pre';
import { CONTAINER_VERSION } from './constants';

const dockerCommand = (subnetID: string) => `docker run -it -d \\
  --name avalanchego \\
  --network host \\
  -v ~/.avalanchego:/home/avalanche/.avalanchego \\
  -e AVALANCHEGO_NETWORK_ID=fuji \\
  -e AVALANCHEGO_PARTIAL_SYNC_PRIMARY_NETWORK=true \\
  -e AVALANCHEGO_TRACK_SUBNETS=${subnetID} \\
  -e AVALANCHEGO_PUBLIC_IP_RESOLUTION_SERVICE=ifconfigme \\
  -e HOME=/home/avalanche \\
  --user $(id -u):$(id -g) \\
  containerman17/easy-avalanchego:${CONTAINER_VERSION}`


export default function LaunchValidators() {
  const { subnetId, chainId, evmChainId, nodesCount } = useWizardStore();
  const [isBootstrapped, setIsBootstrapped] = useState(false);


  return (
    <>
      <h1 className="text-2xl font-medium mb-6 text-gray-900 dark:text-gray-100">Launch L1 Validators</h1>

      <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
        {nodesCount > 1 ? 'Launch this on each of your ' + nodesCount + ' validator node' + (nodesCount > 1 ? 's' : '') + ':' : 'Launch this on your validator node:'}
      </h3>
      <Pre>{dockerCommand(subnetId)}</Pre>

      <Note>
        <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-blue-900 dark:text-blue-200">{subnetId}</code> is the subnet ID
      </Note>


      <div className="mb-4">
        <strong className="text-gray-900 dark:text-gray-100">Requirements for validator nodes:</strong>
        <ul className="list-disc list-inside ml-4 text-gray-800 dark:text-gray-200">
          <li>16GB RAM (you might try with 8GB)</li>
          <li>8 cores CPU (you might try 4 cores)</li>
          <li>
            At least 100GB of any disk space (EBS or SSD), except for HDD
          </li>
          <li>
            <strong className="text-gray-900 dark:text-gray-100">⚠️ Important:</strong> make sure port 9651 is open on your node!
          </li>
        </ul>
      </div>


      <p className="mb-4 text-gray-800 dark:text-gray-200">
        It will take approximately 3 to 10 minutes to bootstrap as it needs to
        sync the P-Chain, which is quick. Note that these nodes are not
        archival; you should read how to set up archival nodes if needed.
      </p>

      <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
        You can check the node logs by running:
      </h3>
      <Pre>docker logs -f avalanchego</Pre>

      <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
        To test if the node bootstrapped successfully, run:
      </h3>
      <Pre>{`curl -X POST --data '{ 
"jsonrpc":"2.0", "method":"eth_chainId", "params":[], "id":1 
}' -H 'content-type:application/json;' \\
127.0.0.1:9650/ext/bc/${chainId}/rpc`}</Pre>

      <Note>
        <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-blue-900 dark:text-blue-200">{chainId}</code> is the chain ID
      </Note>

      <p className="mb-4 text-gray-800 dark:text-gray-200">At first, it will return <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-blue-900 dark:text-blue-200">404 page not found</code> as the node is not bootstrapped yet.</p>



      <p className="mb-4 text-gray-800 dark:text-gray-200">
        If your node has bootstrapped successfully, you should see this response:
      </p>

      <Pre>{`{"jsonrpc":"2.0","id":1,"result":"0x${evmChainId.toString(16)}"}`}</Pre>


      <Note>
        <code className="font-mono bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-blue-900 dark:text-blue-200">0x{evmChainId.toString(16)}</code> is the hex representation of the chain ID {evmChainId}
      </Note>

      <p className="mb-8 text-gray-800 dark:text-gray-200">
        Once the validator
        {nodesCount > 1 ? 's' : ''} are bootstrapped, you will launch the RPC
        node{nodesCount > 1 ? 's' : ''} in the next step.
      </p>

      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="bootstrapConfirm"
            checked={isBootstrapped}
            onChange={(e) => setIsBootstrapped(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="bootstrapConfirm" className="ml-2 text-gray-900 dark:text-gray-100">
            I confirm my node{nodesCount > 1 ? 's are' : ' is'} bootstrapped and returning the expected chain ID
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">Click this to continue</p>
      </div>


      <NextPrev nextDisabled={!isBootstrapped} currentStepName="launch-validators" />
    </>
  );
}
