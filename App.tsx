import * as React from 'react';
import { useState, useRef } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Jumpingjack } from './games/jumpingjack';
import { Jaggedrunner } from './games/jaggedrunner';
import { Plumbertower } from './games/plumbertower';
import './style.css';
import { test } from './games/exp';
import { Flappybird } from './games/flappybird';
import { Jumper } from './games/Jumper';
import { Doodlejump } from './games/Doodlejump';

export default function App() {
  return (
    <div>
      <Games />
    </div>
  );
}

const gameclass = {
  // test: test,
  // 'test-2': Jumper,
  // 'test-3': Plumbertower,
  'Doodle Jump': Doodlejump,
  'Flappy Bird': Flappybird,
  'Jumping Jack': Jumpingjack,
  'Jagged Runner': Jaggedrunner,
};

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(Object.keys(gameclass)[-10]);
  const canvas = useRef();
  const HUD = useRef();
  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  const handleBackClick = () => {
    setSelectedGame(null);
  };

  React.useEffect(() => {
    selectedGame && run(canvas.current, HUD.current, selectedGame);
  }, [selectedGame]);

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <header className="flex justify-center contents-center h-6 bg-gray-900">
        <span className="font-bold">
          {selectedGame ? selectedGame : 'JS ARCADE COLLECTION'}
        </span>
      </header>
      {selectedGame ? (
        <div className="flex flex-1 flex-col">
          <canvas
            ref={canvas}
            className="bg-gray-600 w-auto h-auto"
            style={{ imageRendering: 'pixelated', maxHeight: '100%' }}
          />
          <div ref={HUD} className="bg-green-800 text-center">
            {' '}
            HUD{' '}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-wrap items-center justify-center overflow-y-auto">
          {Object.keys(gameclass).map((name) => (
            <div
              className="bg-gray-900 m-1 p-5"
              key={name}
              onClick={() => handleGameClick(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
      <footer className="flex justify-between items-center h-6 bg-gray-900">
        {selectedGame && (
          <button className="mx-4" onClick={handleBackClick}>
            <IoIosArrowBack size={24} />
          </button>
        )}
        <p className="text-gray-500 text-sm">10xvick © 2023</p>
      </footer>
    </div>
  );
};

function run(canvas, HUD, game) {
  canvas.width = canvas.height = 50;
  new gameclass[game]({
    element: canvas,
    context: canvas.getContext('2d'),
    width: 50,
    height: 50,
    HUD: HUD,
  });
}
