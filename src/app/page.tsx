'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [black, setblack] = useState<number>(0);
  const [white, setwhite] = useState<number>(0);

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

  // const CreateNewBoard = () => {
  //   const newboard = [
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //     [0, 0, 0, 0, 0, 0, 0, 0],
  //   ];
  //   return newboard;
  // };

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

          if (allcount !== 0) {
            console.log(allcount);
          }
          newcountboard[y][x] = allcount;
        }
      }
    }
    console.log(newcountboard);
    setCount(newcountboard);
  };

  const CountStone = (board: number[][]) => {
    let black = 0;
    let white = 0;
    for (let x: number = 0; x < 8; x++) {
      for (let y: number = 0; y < 8; y++) {
        if (board[y][x] === 1) {
          black += 1;
        } else if (board[y][x] === 2) {
          white += 1;
        }
      }
    }
    console.log(`黒:${black}\n白${white}`);
    setblack(black);
    setwhite(white);
  };

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
      }
      setTurnColor(2 / turnColor);
    }
    setBoard(newBoard);
    CountStone(newBoard);

    console.log(CountBoard);
  };

  useEffect(() => {
    CountStone(board);
    MarkCanPut();
  });

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
            黒:{black}白{white}
          </p>
        }
      </div>
    </div>
  );
};

export default Home;
