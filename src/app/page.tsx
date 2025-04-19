'use client';

import { useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);

  const direction_lst = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];

  const [board, setBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);

    if (board[y][x] === 0) {
      for (let i: number = 0; i < 7; i++) {
        if (board[y + direction_lst[i][1]][x + direction_lst[i][0]] === 2 / turnColor) {
          newBoard[y][x] = turnColor;
          setTurnColor(2 / turnColor);
          break;
        }
      }
    }
    setBoard(newBoard);
  };

  // let target_x = x + direction_lst[i][0]
  // let target_y = y + direction_lst[i][1]
  // for (let i: number = 0; i < 7; i++) {
  //   if (
  //     board[y] !== undefined &&
  //     board[x] !== undefined &&
  //     board[y][x] === 0 &&

  //   ) {
  //     newBoard[y][x] = turnColor;
  //     setTurnColor(2 / turnColor);
  //   }
  // }
  // setBoard(newBoard);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} onClick={() => clickHandler(x, y)}>
              {color !== 0 && (
                <div
                  className={styles.stone}
                  style={{ background: color === 1 ? `#000` : `#fff` }}
                />
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Home;
