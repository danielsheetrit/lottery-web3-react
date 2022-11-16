import { useState, useEffect } from 'react';
import { lotteryContract, web3 } from './services';

export default function App() {
  const [contractDetails, setContractDetails] = useState({
    manager: '',
    players: [],
    balance: '',
  });

  // enterFee in Ether
  const [enterFee, setEnterFee] = useState(0);
  const [msg, setMsg] = useState({
    title: '',
    color: '',
  });

  const resetMsg = () => {
    return setTimeout(() => {
      setMsg({ title: '', color: '' });
    }, 3000);
  };

  const enterLottery = async (ev) => {
    ev.preventDefault();

    try {
      const accounts = await web3.eth.getAccounts();

      setMsg({ title: 'Submitting Transaction...', color: 'lightBlue' });

      await lotteryContract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(enterFee, 'ether'),
      });

      setMsg({ title: 'Transaction Passed', color: 'lightGreen' });

      resetMsg();
    } catch (err) {
      setMsg({ title: 'Sending Transaction Faild', color: 'pink' });
      resetMsg();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const manager = await lotteryContract.methods.manager().call();
        const players = await lotteryContract.methods.getPlayers().call();

        const balanceInWei = await web3.eth.getBalance(
          lotteryContract.options.address
        );

        const balanceInEther = web3.utils.fromWei(balanceInWei);

        setContractDetails({ manager, players, balance: balanceInEther });
      } catch (err) {
        console.log(err);
        resetMsg();
        setMsg({ title: 'An error occurred during connection', color: 'pink' });
      }
    })();
  }, []);

  return (
    <div
      className="App"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      {msg.title && (
        <div
          style={{
            backgroundColor: msg.color || 'lightgrey',
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '1rem',
            borderRadius: 4,
          }}
        >
          {msg.title}
        </div>
      )}
      <h1>Lottery</h1>
      <div
        style={{
          border: '2px dashed black',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: '1rem' }}>
          <h4 style={{ marginBottom: '8px' }}>Manager:</h4>
          <p>{contractDetails.manager}</p>
        </div>
        <div>
          <p>Players: {contractDetails.players.length}</p>
          <p>Balance: {contractDetails.balance} Ether</p>
        </div>

        <hr />
      </div>

      <form
        onSubmit={enterLottery}
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h4>Amount of ether to send</h4>
        <div>
          <label style={{ marginRight: '8px' }}>Ether:</label>
          <input
            value={enterFee}
            type="number"
            onChange={(ev) => setEnterFee(ev.target.value)}
            style={{
              marginRight: '8px',
              border: 'none',
              backgroundColor: 'lightGray',
            }}
          />
          <button>Enter to the lottery</button>
        </div>
      </form>
    </div>
  );
}
