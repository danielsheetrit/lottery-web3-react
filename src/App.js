import { useState, useEffect } from 'react';
import { lotteryContract, web3 } from './services';

const containerStyle = {
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function App() {
  const [accounts, setAccounts] = useState([]);

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

  const printMsg = (title, color, isStatic) => {
    setMsg({ title, color });

    if (isStatic) return;

    setTimeout(() => {
      setMsg({ title: '', color: '' });
    }, 3000);
  };

  const enterLottery = async (ev) => {
    ev.preventDefault();

    printMsg('Submitting Transaction...', 'lightBlue', true);

    try {
      await lotteryContract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(enterFee, 'ether'),
      });

      printMsg('Transaction Passed', 'lightGreen');
    } catch (err) {
      console.log(err);
      printMsg('Sending Transaction Faild', 'pink');
    }
  };

  const pickAWinner = async () => {
    setMsg({ title: 'Picking Winner...', color: 'lightBlue' });

    try {
      await lotteryContract.methods.pickWinner().send({
        from: accounts[0],
      });

      printMsg('Winner is found', 'lightGreen');
    } catch (err) {
      console.log(err);
      printMsg('Picking Winner Faild', 'pink');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);

        const manager = await lotteryContract.methods.manager().call();
        const players = await lotteryContract.methods.getPlayers().call();

        const balanceInWei = await web3.eth.getBalance(
          lotteryContract.options.address
        );

        const balanceInEther = web3.utils.fromWei(balanceInWei);

        setContractDetails({ manager, players, balance: balanceInEther });
      } catch (err) {
        console.log(err);
        printMsg('An error occurred during connection', 'pink');
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
          ...containerStyle,
          flexDirection: 'row',
          border: '2px dashed black',
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

      <form onSubmit={enterLottery} style={containerStyle}>
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

      <div style={containerStyle}>
        <h4>Click to pick a winner</h4>
        <button onClick={() => pickAWinner()}>Pick A Winner</button>
      </div>
    </div>
  );
}
