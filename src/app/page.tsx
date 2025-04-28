'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, changeTurnColor] = useState(1);
  const [stonesNum, recordStonesNum] = useState([2, 2]);
  const [turn, recordTurnNum] = useState<number>(1);
  const [comPuted, recordComPuted] = useState([-1, -1]);
  const [comPassCount, stackComPassCount] = useState<number>(0);
  const [userPassCount, stackUserPassCount] = useState<number>(0);
  const [draw, setdraw] = useState<boolean>(true);

  const dirLst = useMemo(
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

  const whoWin = useCallback((stonesNum: number[]) => {
    const black = stonesNum[0];
    const white = stonesNum[1];
    if (black > white) {
      alert('黒の勝利!!!');
    } else if (white > black) {
      alert('白の勝利!!!');
    } else {
      alert('引き分け');
    }
  }, []);

  const checkFinish = useCallback((argBoard: number[][], stonesNum: number[]) => {
    const black = stonesNum[0];
    const white = stonesNum[1];
    if (black === 0 || white === 0) {
      return true;
    }
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        if (argBoard[y][x] < 0) {
          return false;
        }
      }
    }
    return true;
  }, []);

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

  const inversionCount = useCallback(
    (x: number, y: number, direction: number[], boardToNum: number[][], color: number) => {
      let count = 0;
      let targetX;
      let targetY;
      while (true) {
        count += 1;
        targetX = x + direction[0] * count;
        targetY = y + direction[1] * count;
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

  const searchCount = useCallback(
    (x: number, y: number, dirLst: number[][], argBoard: number[][], argColor: number) => {
      const count_lst = [];
      for (let i: number = 0; i < 8; i++) {
        const count = inversionCount(x, y, dirLst[i], argBoard, argColor);
        count_lst.push(count);
      }
      return count_lst;
    },
    [inversionCount],
  );

  const MarkCanPut = useCallback(
    (argBoard: number[][], color: number) => {
      const localboard = structuredClone(argBoard);
      let allcount = 0;
      for (let y: number = 0; y < 8; y++) {
        for (let x: number = 0; x < 8; x++) {
          allcount = 0;
          if (argBoard[y][x] <= 0) {
            for (let i: number = 0; i < 8; i++) {
              allcount += inversionCount(x, y, dirLst[i], argBoard, color);
            }
            localboard[y][x] = -allcount;
          }
        }
      }
      return localboard;
    },
    [inversionCount, dirLst],
  );

  const Inversionprocessing = useCallback(
    (x: number, y: number, count: number, dir: number[], argBoard: number[][], color: number) => {
      for (let n: number = 1; n <= count; n++) {
        argBoard[y + dir[1] * n][x + dir[0] * n] = color;
      }
    },
    [],
  );

  const increaseStoneNum = useCallback((count: number, color: number) => {
    recordStonesNum(([black, white]) => {
      if (color === 1) {
        return [black + count + 1, white - count];
      } else {
        return [black - count, white + count + 1];
      }
    });
  }, []);

  const decidePutCom = useCallback((argBoard: number[][]) => {
    let biggest = [-1, 0, 0];
    for (let y: number = 0; y < 8; y++) {
      for (let x: number = 0; x < 8; x++) {
        if (biggest[0] < -argBoard[y][x]) {
          biggest = [-argBoard[y][x], x, y];
        }
      }
    }
    return biggest;
  }, []);

  const totalPutProseccing = useCallback(
    (
      x: number,
      y: number,
      count_lst: number[],
      allcount: number,
      dirLst: number[][],
      argBoard: number[][],
      color: number,
    ) => {
      increaseStoneNum(allcount, color);
      argBoard[y][x] = color;
      for (let i: number = 0; i < 8; i++) {
        if (count_lst[i] > 0) {
          Inversionprocessing(x, y, count_lst[i], dirLst[i], argBoard, color);
        }
      }
    },
    [increaseStoneNum, Inversionprocessing],
  );

  const putComProcessing = useCallback(
    (argBoard: number[][]) => {
      const newBoard = structuredClone(argBoard);
      const comPut = decidePutCom(newBoard);
      const comX = comPut[1];
      const comY = comPut[2];
      const Color = 2;
      console.log(comPut);
      if (comPut[0] <= 0) {
        recordComPuted([-1, -1]);
        console.log('パスしました');
        stackComPassCount((prev) => prev + 1);
        return newBoard;
      } else {
        stackComPassCount(0);
      }

      recordComPuted([comX, comY]);

      const countLst = searchCount(comX, comY, dirLst, newBoard, Color);
      const allCount = countLst.reduce((acc, value) => acc + value, 0);

      totalPutProseccing(comX, comY, countLst, allCount, dirLst, newBoard, Color);
      changeTurnColor(2 / Color);
      return newBoard;
    },
    [dirLst, decidePutCom, searchCount, totalPutProseccing],
  );

  const comTurnProcessing = (argBoard: number[][]) => {
    setdraw(false);
    const comPutedBoard = putComProcessing(MarkCanPut(argBoard, 2));
    setBoard(comPutedBoard);
    recordTurnNum((prev) => prev + 1);
    return comPutedBoard;
  };

  const clickHandler = (x: number, y: number) => {
    setdraw(true);
    const newBoard = structuredClone(board);
    if (userPassjudge(board)) {
      stackUserPassCount((prev) => prev + 1);
      console.log('userがパスしました');
      alert('置けるところがないのでパスしました。');
    } else {
      stackComPassCount(0);
    }

    const count_lst = searchCount(x, y, dirLst, newBoard, turnColor);
    const allcount = count_lst.reduce((acc, value) => acc + value, 0);

    if (newBoard[y][x] <= 0 && allcount > 0) {
      totalPutProseccing(x, y, count_lst, allcount, dirLst, newBoard, turnColor);
      recordTurnNum((prev) => prev + 1);
      const markedboard = MarkCanPut(newBoard, turn % 2);
      setBoard(comTurnProcessing(markedboard));
    }
  };

  useEffect(() => {
    setdraw(true);
    const markedBoard = MarkCanPut(board, turn % 2);
    setBoard(markedBoard);
    console.log(stonesNum[0], stonesNum[1]);
    console.log(`${turn}ターン目`);
    if (
      (checkFinish(markedBoard, stonesNum) && turn !== 1) ||
      comPassCount >= 2 ||
      userPassCount >= 2
    ) {
      console.log('勝利判定通過');
      setTimeout(() => {
        whoWin(stonesNum);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

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
                    border: `${x === comPuted[0] && y === comPuted[1] ? '4px' : '1px'} solid ${x === comPuted[0] && y === comPuted[1] ? '#ff4444' : '#000'}`,
                  }}
                />
              )}

              {color < 0 && turnColor === 1 && draw === true && (
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
              <div className={styles.miniStone} style={{ background: `#000` }} />
              <p className={styles.scoreElement}>:{stonesNum[0]}</p>
            </div>
            <div className={styles.scorecontent}>
              <div className={styles.miniStone} style={{ background: `#ffffff` }} />
              <p className={styles.scoreElement}>:{stonesNum[1]}</p>
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
