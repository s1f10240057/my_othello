'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [stornsNum, setstornsNum] = useState([2, 2]);
  const [turn, setTrunNum] = useState<number>(0);

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
    const newcountboard = structuredClone(board);
    let allcount = 0;
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        allcount = 0;
        if (board[y][x] <= 0) {
          for (let i: number = 0; i < 8; i++) {
            allcount += inversionCount(x, y, direction_lst[i]);
          }
          newcountboard[y][x] = -allcount;
        }
      }
    }
    setBoard(newcountboard);
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
  };

  const inversionCount = (x: number, y: number, direction: number[]) => {
    let count = 0;
    while (true) {
      count += 1;
      const targetX = x + direction[0] * count;
      const targetY = y + direction[1] * count;
      if (
        board[targetY] === undefined ||
        board[targetX] === undefined ||
        board[targetY][targetX] <= 0
      ) {
        count = 0;
        break;
      } else if (board[targetY][targetX] === turnColor) {
        count -= 1;
        break;
      }
    }
    return count;
  };

  const increassStoneNum = (count: number) => {
    const black = stornsNum[0];
    const white = stornsNum[1];
    if (turnColor === 1) {
      setstornsNum([black + count + 1, white - count]);
    } else {
      setstornsNum([black - count, white + count + 1]);
    }
  };

  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    const count_lst = [];
    let allcount = 0;

    for (let i: number = 0; i < 8; i++) {
      const count = inversionCount(x, y, direction_lst[i]);
      allcount += count;
      count_lst.push(count);
    }

    if (board[y][x] <= 0 && allcount > 0) {
      increassStoneNum(allcount);
      newBoard[y][x] = turnColor;
      for (let i: number = 0; i < 8; i++) {
        if (count_lst[i] > 0) {
          Inversionprocessing(x, y, count_lst[i], direction_lst[i], newBoard);
        }
      }
      setTurnColor(2 / turnColor);
      setTrunNum(turn + 1);
    }
    setBoard(newBoard);
  };

  useEffect(() => {
    MarkCanPut();
  }, [turn]);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} onClick={() => clickHandler(x, y)}>
              {color === 1 && <div className={styles.stone} style={{ background: `#000` }} />}

              {color === 2 && <div className={styles.stone} style={{ background: `#fff` }} />}

              {color < 0 && <div className={styles.num}>{-board[y][x]}</div>}
            </div>
          )),
        )}
        {
          <p>
            黒:{stornsNum[0]}白{stornsNum[1]}ターン{turn}
          </p>
        }
      </div>
    </div>
  );
};

export default Home;

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
