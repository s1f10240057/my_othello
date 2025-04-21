'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [stornsNum, setstonesNum] = useState([2, 2]);
  const [turn, setTurnNum] = useState<number>(0);

  const direction_lst = useMemo(
    () => [
      [1, 0], //右
      [1, 1], //右上
      [0, 1], // 上
      [-1, 1], // 左上
      [-1, 0], //左
      [-1, -1], //左下
      [0, -1], //下
      [1, -1], //右下
    ],
    [],
  );

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

  const inversionCount = useCallback(
    (x: number, y: number, direction: number[], boardToNum: number[][], color: number) => {
      let count = 0;
      while (true) {
        count += 1;
        const targetX = x + direction[0] * count;
        const targetY = y + direction[1] * count;
        if (
          boardToNum[targetY] === undefined ||
          boardToNum[targetX] === undefined ||
          boardToNum[targetY][targetX] <= 0
        ) {
          count = 0;
          break;
        } else if (boardToNum[targetY][targetX] === color) {
          count -= 1;
          break;
        }
      }
      return count;
    },
    [],
  );

  const MarkCanPut = useCallback(
    (boardToMark: number[][], color: number) => {
      const newcountboard = structuredClone(boardToMark);
      let allcount = 0;
      for (let y: number = 0; y < 8; y++) {
        for (let x: number = 0; x < 8; x++) {
          allcount = 0;
          if (boardToMark[y][x] <= 0) {
            for (let i: number = 0; i < 8; i++) {
              allcount += inversionCount(x, y, direction_lst[i], boardToMark, color);
            }
            newcountboard[y][x] = -allcount;
          }
        }
      }
      return newcountboard;
    },
    [inversionCount, direction_lst],
  );

  const Inversionprocessing = useCallback(
    (
      x: number,
      y: number,
      count: number,
      direction: number[],
      newBoard: number[][],
      color: number,
    ) => {
      for (let n: number = 1; n <= count; n++) {
        newBoard[y + direction[1] * n][x + direction[0] * n] = color;
      }
    },
    [],
  );

  const increaseStoneNum = useCallback((count: number, color: number) => {
    setstonesNum(([black, white]) => {
      if (color === 1) {
        return [black + count + 1, white - count];
      } else {
        return [black - count, white + count + 1];
      }
    });
  }, []);

  const decidePutCom = useCallback((boardToDecide: number[][]) => {
    const biggest = [-1, 0, 0];
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        if (biggest[0] < -boardToDecide[y][x]) {
          biggest[0] = -boardToDecide[y][x];
          biggest[1] = x;
          biggest[2] = y;
        }
      }
    }
    return biggest;
  }, []);

  const putComProcessing = useCallback(
    (ToBoard: number[][], turn: number) => {
      const newBoard = structuredClone(ToBoard);
      let allcount = 0;
      const ePut = decidePutCom(newBoard);
      const ex = ePut[1];
      const ey = ePut[2];
      const count_lst = [];
      const color = 2;

      console.log(ex, ey);

      for (let i: number = 0; i < 8; i++) {
        const count = inversionCount(ex, ey, direction_lst[i], newBoard, color);
        allcount += count;
        count_lst.push(count);
      }

      increaseStoneNum(allcount, color);
      newBoard[ey][ex] = color;

      for (let i: number = 0; i < 8; i++) {
        if (count_lst[i] > 0) {
          Inversionprocessing(ex, ey, count_lst[i], direction_lst[i], newBoard, color);
        }
      }
      setTurnColor(2 / color);
      console.log(newBoard);
      setBoard(newBoard);
      setTurnNum(turn + 1);
    },
    [Inversionprocessing, direction_lst, increaseStoneNum, decidePutCom, inversionCount],
  );

  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    const count_lst = [];
    let allcount = 0;
    if (turn % 2 === 0) {
      for (let i: number = 0; i < 8; i++) {
        const count = inversionCount(x, y, direction_lst[i], board, turnColor);
        allcount += count;
        count_lst.push(count);
      }

      if (board[y][x] <= 0 && allcount > 0) {
        increaseStoneNum(allcount, turnColor);
        newBoard[y][x] = turnColor;
        for (let i: number = 0; i < 8; i++) {
          if (count_lst[i] > 0) {
            Inversionprocessing(x, y, count_lst[i], direction_lst[i], newBoard, turnColor);
          }
        }
        setTurnColor((prev) => 2 / prev);
        setTurnNum((prev) => prev + 1);
        setBoard(newBoard);

        console.log(turnColor);

        setBoard((prev) => MarkCanPut(prev, 2));
        const newBoard2 = MarkCanPut(newBoard, 2);
        putComProcessing(newBoard2, turn + 1);
      }
    } else {
      // 敵のターン
      // putComProcessing(board, turn);
      console.log('敵のターン');
    }
  };

  useEffect(() => {
    setBoard((prev) => MarkCanPut(prev, (turn % 2) + 1));
  }, [turn, MarkCanPut]);

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
