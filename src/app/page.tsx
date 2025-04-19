'use client';

import { useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);

  const direction_lst = [
    [1, 0], //右
    [1, 1], //右上
    [0, 1], // 上
    [-1, 1], // 左上
    [-1, 0], //左
    [-1, -1], //左下
    [0, -1], //下
    [1, -1], //右下
  ];

  // const [board, setBoard] = useState([
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 1, 2, 2, 2, 0],
  //   [0, 0, 0, 2, 1, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  // ]);

  const [board, setBoard] = useState([
    [1, 0, 0, 1, 0, 0, 1, 0],
    [0, 2, 0, 2, 0, 2, 0, 0],
    [0, 0, 2, 2, 2, 0, 0, 0],
    [1, 2, 2, 0, 2, 2, 2, 1],
    [0, 0, 2, 2, 2, 0, 0, 0],
    [0, 2, 2, 2, 0, 2, 0, 0],
    [1, 2, 0, 2, 0, 0, 2, 0],
    [1, 0, 0, 1, 0, 0, 0, 1],
  ]);

  const Inversionprocessing = (
    x: number,
    y: number,
    count: number,
    direction: number[],
    newBoard: number[][],
  ) => {
    for (let n: number = 1; n <= count; n++) {
      newBoard[y + direction[1] * n][x + direction[0] * n] = turnColor;
    }
    setBoard(newBoard);
  };

  const Inversioncount = (x: number, y: number, direction: number[]) => {
    let n = 0;
    let count = 0;
    while (true) {
      n += 1;
      if (
        board[y + direction[1] * n] === undefined ||
        board[x + direction[0] * n] === undefined ||
        board[y + direction[1] * n][x + direction[0] * n] === 0
      ) {
        count = 0;
        break;
      } else if (board[y + direction[1] * n][x + direction[0] * n] === turnColor) {
        break;
      } else {
        count += 1;
      }
    }
    return count;
  };

  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    let allcount = 0;
    const count_lst = [];

    for (let i: number = 0; i < 8; i++) {
      const count = Inversioncount(x, y, direction_lst[i]);
      allcount += count;
      count_lst.push(count);
    }

    if (board[y][x] === 0 && allcount !== 0) {
      newBoard[y][x] = turnColor;
      for (let i: number = 0; i < 8; i++) {
        if (count_lst[i] !== 0) {
          Inversionprocessing(x, y, count_lst[i], direction_lst[i], newBoard);
        }
        setTurnColor(2 / turnColor);
        break;
      }
    }
    setBoard(newBoard);
  };

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
