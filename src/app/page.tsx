'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// fawfe
const Home = () => {
  const [turnColor, changeTurnColor] = useState(1); //カラー
  const [stonesNum, recordStonesNum] = useState([2, 2]); //カラー 石の数を数える。0:黒 1:白
  const [turn, recordTurnNum] = useState<number>(1); // ターン数計測
  const [comPuted, recordComPuted] = useState([-1, -1]); // コンピューターが置いた位置を記憶
  const [comPassCount, stackComPassCount] = useState<number>(0); //コンピューターがパスした数をカウント
  const [userPassCount, stackUserPassCount] = useState<number>(0); //ユーザーがパスした数をカウント
  const [draw, setdraw] = useState<boolean>(true); // 評価値の表示許可

  // 方向リスト
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

  ///勝者判断処理
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

  ///終了判断処理
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

  ///ユーザーのおける石があるか確認し、置ける場所が無かったらパスする処理
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

  /// 引数の座標に引数の色を置いたときに、引数の方向に対して何個ひっくり返せるか判断する処理(user.com併用)
  const inversionCount = useCallback(
    (x: number, y: number, direction: number[], argBoard: number[][], color: number) => {
      let count = 0;
      let targetX;
      let targetY;
      while (true) {
        count += 1;
        targetX = x + direction[0] * count;
        targetY = y + direction[1] * count;
        if (
          argBoard[targetY] === undefined ||
          argBoard[targetX] === undefined ||
          argBoard[targetY][targetX] <= 0
        ) {
          count = 0;
          break;
        } else if (argBoard[targetY][targetX] === color) {
          count -= 1;
          break;
        }
      }
      return count;
    },
    [],
  );

  /// 引数の座標に対してinversionCountを8方向に利用することで、
  /// 引数の座標に置いたときひっくり返せる石の総合計数を数える処理(user.com併用)
  const searchCount = useCallback(
    (x: number, y: number, dirLst: number[][], argBoard: number[][], argColor: number) => {
      const count_lst = [];
      let count = 0;
      for (let i: number = 0; i < 8; i++) {
        count = inversionCount(x, y, dirLst[i], argBoard, argColor);
        count_lst.push(count);
      }
      return count_lst;
    },
    [inversionCount],
  );

  /// 引数ボードから、引数カラーで置ける位置を特定し、ひっくり返せる場所と数を負数でマークする処理(user.com併用)
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

  /// 引数の座標を起点にして、引数の方向に石をひっくり返す処理(user.com併用)
  const InversionProcessing = useCallback(
    (x: number, y: number, count: number, dir: number[], argBoard: number[][], color: number) => {
      for (let n: number = 1; n <= count; n++) {
        argBoard[y + dir[1] * n][x + dir[0] * n] = color;
      }
    },
    [],
  );

  /// 石を置いたときに発生する石の増減をカウントする処理(user.com併用)
  const increaseStoneNum = useCallback((count: number, color: number) => {
    recordStonesNum(([black, white]) => {
      if (color === 1) {
        return [black + count + 1, white - count];
      } else {
        return [black - count, white + count + 1];
      }
    });
  }, []);

  /// comの石を置く位置を決定する処理(com専用)
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

  /// 石を置くときの総処理(user,com併用)
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
          InversionProcessing(x, y, count_lst[i], dirLst[i], argBoard, color);
        }
      }
    },
    [increaseStoneNum, InversionProcessing],
  );

  /// comの石を置く総処理(com専用)
  const putComProcessing = useCallback(
    (argBoard: number[][]) => {
      const newBoard = structuredClone(argBoard);
      const comPut = decidePutCom(newBoard);
      const comX = comPut[1];
      const comY = comPut[2];
      const Color = 2;
      let countLst = [];
      let allCount = 0;
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

      countLst = searchCount(comX, comY, dirLst, newBoard, Color);
      allCount = countLst.reduce((acc, value) => acc + value, 0);

      totalPutProseccing(comX, comY, countLst, allCount, dirLst, newBoard, Color);
      changeTurnColor(2 / Color);
      return newBoard;
    },
    [dirLst, decidePutCom, searchCount, totalPutProseccing],
  );

  /// comのターンの総処理(com専用)
  const comTurnProcessing = (argBoard: number[][]) => {
    setdraw(false);
    const comPutedBoard = putComProcessing(MarkCanPut(argBoard, 2));
    setBoard(comPutedBoard);
    recordTurnNum((prev) => prev + 1);
    return comPutedBoard;
  };

  /// クリックしたときの総処理(user専用)
  const clickHandler = (x: number, y: number) => {
    setdraw(true);
    let count_lst = [];
    let allcount = 0;
    let markedboard = [];
    const newBoard = structuredClone(board);
    if (userPassjudge(board)) {
      stackUserPassCount((prev) => prev + 1);
      console.log('userがパスしました');
      alert('置けるところがないのでパスしました。');
    } else {
      stackComPassCount(0);
    }

    count_lst = searchCount(x, y, dirLst, newBoard, turnColor);
    allcount = count_lst.reduce((acc, value) => acc + value, 0);

    if (newBoard[y][x] <= 0 && allcount > 0) {
      totalPutProseccing(x, y, count_lst, allcount, dirLst, newBoard, turnColor);
      recordTurnNum((prev) => prev + 1);
      markedboard = MarkCanPut(newBoard, turn % 2);
      setBoard(comTurnProcessing(markedboard));
    }
  };

  /// 起動時・ターン終了時に行う処理
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

/// 石をリアルタイムでカウントする処理

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
