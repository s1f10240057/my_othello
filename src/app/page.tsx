'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';

///勝者判断処理
const whoWin = (stonesNum: number[]) => {
  const black = stonesNum[0];
  const white = stonesNum[1];
  setTimeout(() => {
    if (black > white) {
      alert('黒の勝利!!!');
    } else if (white > black) {
      alert('白の勝利!!!');
    } else {
      alert('引き分け');
    }
  }, 500);
};

///終了判断処理
///石のどちらかが全滅したとき、ボードにどこにも置ける場所がない(0以上の値がない)ときにtrueを返す。
const checkFinish = (argBoard: number[][], stonesNum: number[]) => {
  if (stonesNum.some((x) => x === 0)) {
    console.log('全滅end');
    return true;
  }

  if (argBoard.flat(2).some((x) => x >= 0)) {
    return false;
  } else {
    console.log('ノーマルend');
    return true;
  }
};

/// 引数の座標に引数の色を置いたときに、引数の方向に対して何個ひっくり返せるか判断する処理(user.com併用)
const inversionCount = (
  x: number,
  y: number,
  direction: number[],
  argBoard: number[][],
  color: number,
) => {
  let count = 0;
  while (true) {
    count += 1;
    const targetX = x + direction[0] * count;
    const targetY = y + direction[1] * count;
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
};

///ユーザーのおける石があるか確認し、置ける場所が無かったらパスする処理
const userPassjudge = (passToboard: number[][]) => {
  return passToboard.flat(2).every((x) => x >= 0);
};

/// 引数の座標に対してinversionCountを8方向に利用することで、
/// 引数の座標に置いたときひっくり返せる石の総合計数を数える処理(user.com併用)
const searchCount = (
  x: number,
  y: number,
  dirLst: number[][],
  argBoard: number[][],
  argColor: number,
) => {
  return dirLst.map((dir) => inversionCount(x, y, dir, argBoard, argColor));
};

/// 引数ボードから、引数カラーで置ける位置を特定し、ひっくり返せる場所と数を負数でマークする処理(user.com併用)
const MarkCanPut = (argBoard: number[][], dirLst: number[][], color: number) => {
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
};

/// 引数の座標を起点にして、引数の方向に石をひっくり返す処理(user.com併用)
const InversionProcessing = (
  x: number,
  y: number,
  count: number,
  dir: number[],
  argBoard: number[][],
  color: number,
) => {
  Array.from({ length: count }, (_, n) => {
    argBoard[y + dir[1] * (n + 1)][x + dir[0] * (n + 1)] = color;
  });
};

//石が全滅してるかor置ける場所がない場合、ゲームが終了し、勝利判定を行う
const checkFinishProcessing = (argBoard: number[][], argstonesNum: number[], argturn: number) => {
  if (checkFinish(argBoard, argstonesNum) && argturn > 2) {
    setTimeout(() => {
      whoWin(argstonesNum);
      return true;
    }, 500);
  }
  return false;
};

const Home = () => {
  const [turnColor, changeTurnColor] = useState(1); //カラー
  const [stonesNum, recordStonesNum] = useState([2, 2]); //カラー 石の数を数える。0:黒 1:白
  const [turn, recordTurnNum] = useState<number>(1); // ターン数計測
  const [comPassCount, stackComPassCount] = useState<number>(0); //コンピューターがパスした数をカウント
  const [userPassCount, stackUserPassCount] = useState<number>(0); //ユーザーがパスした数をカウント

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

  /// 石を置いたときに発生する石の増減をカウントする処理(user.com併用)
  const increaseStoneNum = useCallback((count: number, color: number, argstonesnum: number[]) => {
    if (color === 1) {
      return [argstonesnum[0] + count + 1, argstonesnum[1] - count];
    } else {
      return [argstonesnum[0] - count, argstonesnum[1] + count + 1];
    }
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
      const retstonesNum = increaseStoneNum(allcount, color, stonesNum);
      console.log(retstonesNum);
      argBoard[y][x] = color;

      count_lst.forEach((value, index) => {
        InversionProcessing(x, y, value, dirLst[index], argBoard, color);
      });
      recordStonesNum(retstonesNum);

      return retstonesNum;
    },
    [increaseStoneNum, stonesNum],
  );

  const passProcess = (
    argBoard: number[][],
    argcolor: number,
    argstonesNum: number[],
    arguserPassCount: number,
    argcomPassCount: number,
  ) => {
    /// 置ける場所がない場合に勝敗判定
    if (argBoard.flat(2).every((x) => x > 0 || argstonesNum.some((x) => x === 0))) {
      whoWin(argstonesNum);
      return 2;
    }
    if (userPassjudge(argBoard)) {
      if (argcolor === 1) {
        setTimeout(() => {
          stackUserPassCount((prev) => prev + 1);
          alert('置けるところがないのでパスしました。(黒)');
        }, 500);
      } else {
        setTimeout(() => {
          stackComPassCount((prev) => prev + 1);
          alert('置けるところがないのでパスしました。(白)');
        }, 500);
      }
      /// 二階連続でパスをしたら強制的に終了し勝敗判定
      if (arguserPassCount + 1 === 2 || argcomPassCount + 1 === 2) {
        whoWin(argstonesNum);
      }
      changeTurnColor((prev) => 2 / prev);
      return 0;
    } else {
      /// パスを行わない場合false
      if (argcolor === 1) {
        stackUserPassCount(0);
      } else {
        stackComPassCount(0);
      }
      return 1;
    }
  };

  const changeTurnProcessing = (
    argBoard: number[][],
    argturnColor: number,
    argstonesNum: number[],
  ) => {
    const markedBoard = MarkCanPut(argBoard, dirLst, argturnColor);
    setBoard(markedBoard);
    const result = passProcess(
      markedBoard,
      argturnColor,
      argstonesNum,
      userPassCount,
      comPassCount,
    );
    if (
      /// パスを行うか判断する。ついでに、Passcountの数値を確認し、勝利判定を行う
      result === 0
    ) {
      /// パスしたときの処理
      const markedBoard = MarkCanPut(argBoard, dirLst, 2 / argturnColor);
      setBoard(markedBoard);
    }
    if (result !== 2) {
      checkFinishProcessing(markedBoard, argstonesNum, turn);
      recordTurnNum((prev) => prev + 1);
    }
  };

  /// クリックしたときの総処理(user専用)
  const clickHandler = (x: number, y: number) => {
    const newBoard = structuredClone(board);
    passProcess(board, turnColor, stonesNum, userPassCount, comPassCount);
    const count_lst = searchCount(x, y, dirLst, newBoard, turnColor);
    const allcount = count_lst.reduce((acc, value) => acc + value, 0);
    if (newBoard[y][x] <= 0 && allcount > 0) {
      const newstonesNum = totalPutProseccing(
        x,
        y,
        count_lst,
        allcount,
        dirLst,
        newBoard,
        turnColor,
      );
      changeTurnProcessing(newBoard, 2 / turnColor, newstonesNum);
      changeTurnColor((prev) => 2 / prev);
    }
  };

  /// 起動時に行う処理
  const didInit = useRef(false);
  if (!didInit.current) {
    changeTurnProcessing(board, turn, stonesNum);
    didInit.current = true;
  }

  return (
    <div className={styles.container}>
      <div className={styles.smartphone}>
        {turn - 1}ターン目
        <br />{' '}
        <div>
          <img
            src="https://chicodeza.com/wordpress/wp-content/uploads/osero-illust1.png"
            width="20wv"
          />
          :{stonesNum[0]}{' '}
          <img
            src="https://chicodeza.com/wordpress/wp-content/uploads/osero-illust2.png"
            width="20wv"
          />
          :{stonesNum[1]}
        </div>
      </div>
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
                  }}
                />
              )}

              {color < 0 && (
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
              <p className={styles.scoreElement}>{turn - 1}ターン目</p>
            </div>
            <div className={styles.scorecontent}>
              <img
                src="https://chicodeza.com/wordpress/wp-content/uploads/osero-illust1.png"
                width="20wv"
              />
              <p className={styles.scoreElement}>:{stonesNum[0]}</p>
            </div>
            <div className={styles.scorecontent}>
              <img
                src="https://chicodeza.com/wordpress/wp-content/uploads/osero-illust2.png"
                width="20wv"
              />
              <p className={styles.scoreElement}>:{stonesNum[1]}</p>
            </div>
            <div className={styles.smartphone} />
          </div>
        }
      </div>
    </div>
  );
};
export default Home;
