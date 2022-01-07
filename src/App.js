import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import 'semantic-ui-css/semantic.min.css'
import { Container, Menu, Icon, Button, Statistic, Label, Header, Message, List, Grid, Image, IconGroup } from 'semantic-ui-react'
import myEpicNft from './utils/MyEpicNFT.json';

const App = () => {

  const truncate = (input, len) => 
  input.length > len ? `${input.substring(0, len)}...` : input;

  const [errorStatus,  setErrorStatus] = useState({error: false, message: ''});
  const [successStatus,  setSuccessStatus] = useState({success: false, message: ''});
  const [currentAccount, setCurrentAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [transHash, setTransHash] = useState('');

  const CONTRACT_ADDRESS = "0x821D788243129d4e54991068d36EBbFBA9Bb0385";
  const TWITTER_HANDLE = '_life0fmale';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  const { ethereum } = window;

  const checkIfWalletIsConnected = async () => {

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      setErrorStatus({...errorStatus, error: true, message: 'Make sure you have metamask!'});
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

   

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      getTotalSupply();
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found")
    }
  };

  const closeErrorModal = () => {
    setErrorStatus({...errorStatus, error: false, message: ''});
  };

  const closeSuccessModal = () => {
    setSuccessStatus({...successStatus, success: false, message: ''});
  };

  const getTotalSupply = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        let totalS = await connectedContract.getTotalNFTsMintedSoFar();
  
        console.log(totalS.toNumber())
        setTotalSupply(totalS.toNumber());
  
      } else {
        console.log("Ethereum object doesn't exist!");
        setErrorStatus({...errorStatus, error: true, message: 'Ethereum object does not exist!'});
      }
    } catch (error) {
      console.log(error)
      setErrorStatus({...errorStatus, error: true, message: error.message+", check your internet connection"});
    }
  }

  const checkForChain = async () => {
    if(ethereum){
      let chainId = await ethereum.request({ method: 'eth_chainId' });

      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 

      if (chainId !== rinkebyChainId) {
        setErrorStatus({...errorStatus, error: true, message: 'Your Metamask is not connected to the Rinkeby Test Network!'});
      }
    }
  };

  const connectWallet = async () => {

    if (!ethereum) {
      setErrorStatus({...errorStatus, error: true, message: 'Get MetaMask!'});
      return;
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });

    console.log("Connected to chain " + chainId);
    const rinkebyChainId = "0x4"; 

    if (chainId !== rinkebyChainId) {
      setErrorStatus({...errorStatus, error: true, message: 'You are not connected to the Rinkeby Test Network!'});
      return;
    }else{

      try {

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);

        setupEventListener();
        getTotalSupply();
      } catch (error) {
        console.log(error);
        setErrorStatus({...errorStatus, error: true, message: error.message});
      }
    }
  };


  const setupEventListener = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          console.log(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  };

  const askContractToMintNft = async () => {
    setLoading(true);
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
  
        console.log("Mining...please wait.")
        await nftTxn.wait();

        setTransHash(nftTxn.hash);
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        getTotalSupply();
        setSuccessStatus({...successStatus, success: true, message: 'You just got yourself an NFT'});

        setLoading(false);
  
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoading(false);
        setErrorStatus({...errorStatus, error: true, message: 'Ethereum object does not exist!'});
      }
    } catch (error) {
      console.log(error)
      setLoading(false);
      setErrorStatus({...errorStatus, error: true, message: error.message+", check your internet connection"});
    }
  }

  const funcListener = () => {
    if(ethereum){
      ethereum.on("accountsChanged", (accounts) => {
        setCurrentAccount(accounts[0]);
        if(accounts.length === 0){
          window.location.reload();
        }
      });
      ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };



  useEffect(() => {
    checkIfWalletIsConnected();
    checkForChain();
    funcListener();
  }, [])

  return(
    <div>
      <Container fluid>
        <Menu size='large' secondary style={{padding: '30px'}}>
          <Menu.Item>
            <Icon name='twitter' color='blue' /> <a href={TWITTER_LINK}>{TWITTER_HANDLE}</a>
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              {currentAccount === '' ? <Button primary onClick={() => connectWallet()}>CONNECT</Button> : <Button primary >CONNECTED</Button>}
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        {(() => {
          if (errorStatus.error === false && successStatus.success === false) {
            return(
              <>
                <Header
                  as='h1'
                  content='My NFT COLLECTION'
                  style={{
                    fontSize: '4em',
                    fontWeight: 'normal',
                    marginBottom: 0,
                    marginTop: '1em',
                    textAlign: 'center'
                  }}
                />
                <Header
                  as='h2'
                  content='Mint whatever you want when you want to.'
                  style={{
                    fontSize: '1.7em',
                    fontWeight: 'normal',
                    marginTop: '1.5em',
                    textAlign: 'center'
                  }}
                />

                <Header textAlign='center'>
                  <a target="_blank" href={'https://rinkeby.etherscan.io/address/'+CONTRACT_ADDRESS}>{truncate(CONTRACT_ADDRESS, 15)}</a>
                </Header>

                {currentAccount != '' ? (
                  <>
                    <Header style={{textAlign: 'center'}}>
                      <Statistic  label='NFTS Minted' value={totalSupply+" / 200"} />
                    </Header>


                    <Header style={{textAlign: 'center'}}>
                      {loading ? 
                      <Button loading primary style={{width: '150px'}}>
                        Loading
                      </Button>
                      :
                      <Button primary style={{width: '150px'}} onClick={(e) => askContractToMintNft()}>
                        MINT FOR FREE
                      </Button>}

                    </Header> 
                  </>
                  ) : <Header as='h4' disabled textAlign='center'>CONNECT YOUR METAMASK TO GET STARTED</Header> }
              </>
            )
          }else if(errorStatus.error === true && successStatus.success === false){
            return (
              <Grid style={{marginTop: '80px'}}>
                <Grid.Row>
                  <Grid.Column width={5}></Grid.Column>
                  <Grid.Column width={6}>
                    <Button floated='right' secondary onClick={() => closeErrorModal()}>CLOSE</Button>
                    <Message style={{marginTop: '50px'}}
                      error
                      header='Error'
                      content={errorStatus.message}
                    />
                  </Grid.Column>
                  <Grid.Column width={5}></Grid.Column>
                </Grid.Row>
              </Grid>
            )
          }else if(successStatus.success === true && errorStatus.error === false){
            return (
              <Grid style={{marginTop: '80px'}}>
                <Grid.Row>
                  <Grid.Column width={5}></Grid.Column>
                  <Grid.Column width={6}>
                    <Button floated='right' secondary onClick={() => closeSuccessModal()}>CLOSE</Button>
                    <Message style={{marginTop: '50px'}}
                      success
                      header='Success'
                      content={successStatus.message}
                    />
                    <List relaxed>
                      <List.Item>
                        <List.Content>
                          <List.Header as='a'><a target='_blank' href={"https://rinkeby.etherscan.io/tx/"+transHash}>{transHash}</a></List.Header>
                          <List.Description as='a'>TRANSACTION</List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Header as='a'><a target='_blank' href={"https://testnets.opensea.io/assets/"+CONTRACT_ADDRESS+"/"+totalSupply}>VIEW YOUR ASSET</a></List.Header>
                          <List.Description as='a'>OPENSEA</List.Description>
                        </List.Content>
                      </List.Item>
                    </List>
        
                  </Grid.Column>
                  <Grid.Column width={5}></Grid.Column>
                </Grid.Row>
              </Grid>
            )
          }else{
            return(
              <></>
            )
          }
        })()}
      </Container>
    </div>
  );
};

export default App;