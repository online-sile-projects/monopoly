import Header from './components/Header';
import GameSetting from './components/GameSetting';
import GameBoard from './components/GameBoard';
import PlayerPanel from './components/PlayerPanel';
import Dice from './components/Dice';
import ActionPanel from './components/ActionPanel';
import Modal from './components/Modal';
import Footer from './components/Footer';
import { GameProvider } from './context/GameContext';
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <Header />
        <main>
          <GameSetting />
          <GameBoard />
          <PlayerPanel />
          <Dice />
          <ActionPanel />
          <Modal />
        </main>
        <Footer />
      </div>
    </GameProvider>
  );
}

export default App
