import { useState } from 'react';
import './Toss.css';
import Footer from '../Landingpage/Footer/Footer';

function Toss() {
  const [result, setResult] = useState('Heads');
  const [flipping, setFlipping] = useState(false);

  const flipCoin = () => {
    if (flipping) return; // Prevent multiple flips

    setFlipping(true);
    setTimeout(() => {
      const outcomes = ['Heads', 'Tails'];
      const newResult = outcomes[Math.floor(Math.random() * outcomes.length)];
      setResult(newResult);
      setFlipping(false);
    }, 1000); // Duration of the flip animation
  };

  return (
    <>
      <div className="coin-flip-app">
        <h1>Toss a Coin</h1>
        <div className={`coin ${flipping ? 'flipping' : ''}`}>
          <div className="coin-face">{result}</div>
        </div>
        <button onClick={flipCoin} disabled={flipping}>
          {flipping ? 'Flipping...' : 'Flip Coin'}
        </button>
      </div>
      <Footer />
    </>
  );
}

export default Toss;