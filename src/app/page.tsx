'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [stonesNum, setstonesNum] = useState([2, 2]);
  const [turn, setTurnNum] = useState<number>(1);
  const [comPuted, setcomPuted] = useState([-1, -1]);
  const [comPassCount, setcomPassCount] = useState<number>(0);
  const [userPassCount, setuserPassCount] = useState<number>(0);
  const [draw, setdraw] = useState<number>(0);

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

  const whoWin = useCallback((stonesNum: number[]) => {
    if (stonesNum[0] > stonesNum[1]) {
      alert('黒の勝利!!!');
    } else if (stonesNum[1] > stonesNum[0]) {
      alert('白の勝利!!!');
    } else {
      alert('引き分け');
    }
  }, []);

  const checkFinish = useCallback((checkToBoard: number[][], stonesNum: number[]) => {
    if (stonesNum[0] === 0 || stonesNum[1] === 0) {
      return true;
    }
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        if (checkToBoard[y][x] < 0) {
          return false;
        }
      }
    }
    console.log(checkToBoard);
    return true;
  }, []);

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
    let biggest = [-1, 0, 0];
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        if (biggest[0] < -boardToDecide[y][x]) {
          biggest = [-boardToDecide[y][x], x, y];
        }
      }
    }
    return biggest;
  }, []);

  const searchCount = useCallback(
    (x: number, y: number, direction_lst: number[][], board: number[][], turnColor: number) => {
      const count_lst = [];
      for (let i: number = 0; i < 8; i++) {
        const count = inversionCount(x, y, direction_lst[i], board, turnColor);
        count_lst.push(count);
      }
      return count_lst;
    },
    [inversionCount],
  );

  const totalPutProseccing = useCallback(
    (
      x: number,
      y: number,
      count_lst: number[],
      allcount: number,
      direction_lst: number[][],
      newBoard: number[][],
      color: number,
    ) => {
      increaseStoneNum(allcount, color);
      newBoard[y][x] = color;
      for (let i: number = 0; i < 8; i++) {
        if (count_lst[i] > 0) {
          Inversionprocessing(x, y, count_lst[i], direction_lst[i], newBoard, color);
        }
      }
    },
    [increaseStoneNum, Inversionprocessing],
  );

  const putComProcessing = useCallback(
    (ToBoard: number[][]) => {
      const newBoard = structuredClone(ToBoard);
      const ePut = decidePutCom(newBoard);
      const ex = ePut[1];
      const ey = ePut[2];
      const color = 2;
      console.log(ePut);
      if (ePut[0] <= 0) {
        setcomPuted([-1, -1]);
        console.log('パスしました');
        setcomPassCount((prev) => prev + 1);
        return newBoard;
      } else {
        setcomPassCount(0);
      }
      setcomPuted([ePut[1], ePut[2]]);

      const count_lst = searchCount(ex, ey, direction_lst, newBoard, color);
      const allcount = count_lst.reduce((acc, value) => acc + value, 0);

      totalPutProseccing(ex, ey, count_lst, allcount, direction_lst, newBoard, color);
      setTurnColor(2 / color);
      return newBoard;
    },
    [direction_lst, decidePutCom, searchCount, totalPutProseccing],
  );

  const comTurnProcessing = (newBoard: number[][]) => {
    setdraw(1);
    const comPutedBoard = putComProcessing(MarkCanPut(newBoard, 2));
    setBoard(comPutedBoard);
    setTurnNum((prev) => prev + 1);
    return comPutedBoard;
  };

  const userPassjudge = useCallback((passToboard: number[][]) => {
    for (let x: number = 0; x < 8; x++) {
      for (let y: number = 0; y < 8; y++) {
        if (passToboard[y][x] < 0) {
          return false;
        }
      }
    }
    return true;
  }, []);

  const clickHandler = (x: number, y: number) => {
    setdraw(0);
    const newBoard = structuredClone(board);
    if (userPassjudge(board)) {
      setuserPassCount((prev) => prev + 1);
      console.log('userがパスしました');
    } else {
      setcomPassCount(0);
    }

    const count_lst = searchCount(x, y, direction_lst, newBoard, turnColor);
    const allcount = count_lst.reduce((acc, value) => acc + value, 0);

    if (newBoard[y][x] <= 0 && allcount > 0) {
      totalPutProseccing(x, y, count_lst, allcount, direction_lst, newBoard, turnColor);
      setTurnNum((prev) => prev + 1);
      const markedboard = MarkCanPut(newBoard, turn % 2);
      setBoard(comTurnProcessing(markedboard));
    }
  };
  useEffect(() => {
    setdraw(0);
    const markedboard = MarkCanPut(board, turn % 2);
    setBoard(markedboard);
    console.log(stonesNum[0], stonesNum[1]);
    console.log(`${turn}ターン目`);
    if (
      (checkFinish(markedboard, stonesNum) && turn !== 1) ||
      comPassCount >= 2 ||
      userPassCount >= 2
    ) {
      setTimeout(() => {
        console.log('1 秒待ちました。');
        whoWin(stonesNum);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, MarkCanPut, whoWin]);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} onClick={() => clickHandler(x, y)}>
              {color === 1 && <div className={styles.stone} style={{ background: `#000` }} />}

              {color === 2 && (
                <div
                  className={styles.stone}
                  style={{
                    background: `#fff`,
                    border: `${x === comPuted[0] && y === comPuted[1] ? '4px' : '1px'} solid ${x === comPuted[0] && y === comPuted[1] ? '#1258d1' : '#000'}`,
                  }}
                />
              )}

              {color < 0 && turnColor === 1 && draw === 0 && (
                <div className={styles.numBox}>
                  <span className={styles.num}>{-board[y][x]}</span>
                </div>
              )}
            </div>
          )),
        )}
        {
          <div className={styles.scoreContainer}>
            <div className={styles.scorecontent}>
              <p className={styles.scoreElement}>{turn}ターン目</p>
            </div>
            <div className={styles.scorecontent}>
              <p className={styles.scoreElement}>black:{stonesNum[0]}</p>
            </div>
            <div className={styles.scorecontent}>
              <p className={styles.scoreElement}>white:{stonesNum[1]}</p>
            </div>
          </div>
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
