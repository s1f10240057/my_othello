'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [black, setblack] = useState<number>(2);
  const [white, setwhite] = useState<number>(2);
  const [turn, setTrunNum] = useState<number>(0);
  const [CountBoard, setCount] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

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

  const MarkCanPut = () => {
    const newcountboard = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    let allcount = 0;
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        allcount = 0;
        if (board[y][x] === 0) {
          for (let i: number = 0; i < 8; i++) {
            allcount += Inversioncount(x, y, direction_lst[i]);
          }
          newcountboard[y][x] = allcount;
        }
      }
    }

    setCount(newcountboard);
  };

  // const CountStone = () => {
  //   let black = 0;
  //   let white = 0;
  //   for (let x: number = 0; x < 8; x++) {
  //     for (let y: number = 0; y < 8; y++) {
  //       if (board[y][x] === 1) {
  //         black += 1;
  //       } else if (board[y][x] === 2) {
  //         white += 1;
  //       }
  //     }
  //   }
  //   setblack(black);
  //   setwhite(white);
  // };

  const Inversionprocessing = (
    x: number,
    y: number,
    count: number,
    direction: number[],
    newBoard: number[][],
  ) => {
    let newblack = black;
    let newwhite = white;
    for (let n: number = 1; n <= count; n++) {
      newBoard[y + direction[1] * n][x + direction[0] * n] = turnColor;
    }
    if (turnColor === 1) {
      newblack += count + 1;
      newwhite -= count;
    } else {
      newwhite += count + 1;
      newblack -= count;
    }
    setblack(newblack);
    setwhite(newwhite);
    setBoard(newBoard);
  };

  const Inversioncount = (x: number, y: number, direction: number[]) => {
    let n = 0;
    let count = 0;
    while (true) {
      n += 1;
      const targetX = x + direction[0] * n;
      const targetY = y + direction[1] * n;
      if (
        board[targetY] === undefined ||
        board[targetX] === undefined ||
        board[targetY][targetX] === 0
      ) {
        count = 0;
        break;
      } else if (board[targetY][targetX] === turnColor) {
        break;
      }
      count += 1;
    }
    return count;
  };

  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    const count_lst = [];
    let allcount = 0;

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
      }
      setTurnColor(2 / turnColor);
      setTrunNum(turn + 1);
    }
    setBoard(newBoard);
  };

  useEffect(() => {
    // CountStone();
    MarkCanPut();
  }, [turn]);

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

              {color === 0 && CountBoard[y][x] !== 0 && (
                <div className={styles.num}>{CountBoard[y][x]}</div>
              )}
            </div>
          )),
        )}
        {
          <p>
            黒:{black}白{white}ターン{turn}
          </p>
        }
      </div>
    </div>
  );
};

export default Home;
