"use strict";
/**
 * @description ボヨヨンチェッカーツール ボヨヨン壁チェック実行関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */
import { findValidCombination } from "./byy11findValidCombination.js";
import { displayResults } from "./byy20displayResults.js";
import {
    clearPreviousResults,
    existsBoyoyonFlag,
    existsUseClodFlag,
    existsWallFlag,
    logger,
    vecToStr,
} from "./byy90utilFunc.js";
import { ManageFieldData, ManageFlag } from "./byy91utilClass.js";

/**
 * @description ボヨヨン壁チェック実行<br />
 * ボヨヨン壁チェックを実行しますです。<br />
 */
export const executeBoyoyonCheck = () => {
    // 前回の結果をクリアする。
    clearPreviousResults();

    // ボヨヨン壁チェックを実行する。
    let result = simulationBoyoyon();

    // 土塊の杖使用フラグがOnの場合
    const bangleFlag = ManageFlag.getFlag(`bangle`);
    const clodFlag = ManageFlag.getFlag(`clod`);
    if (result.length == 0 && bangleFlag && clodFlag) {
        // 土塊使用マスを記録するリストを定義します。
        let clodList = [];

        // グリッドのマス数を取得する。
        const sizeData = ManageFieldData.getSize();

        // グリッド全体を走査する。
        for (let j = 0; j < sizeData.h; j++) {
            for (let i = 0; i < sizeData.w; i++) {
                const id = ManageFieldData.getFieldKey(i, j);
                const grid = ManageFieldData.getData(id);
                if (existsUseClodFlag(grid)) {
                    clodList.push({ x: i, y: j });
                }
            }
        }

        // 土塊使用ありで、ボヨヨン壁チェックを実行する。
        result = findValidCombination(clodList);

        if (result.length > 0) {
            // 結果を表示する。
            displayResults(result);
        }
    }

    // 結果を表示する。
    displayResults(result);
};

/**
 * @description ボヨヨン壁シミュレーション実行<br />
 * ボヨヨン壁シミュレーション処理を実行します。<br />
 * @param {Array<Object>} clodList 土塊の杖使用マスリスト
 * @return {Array<Object>} 成功例(反射情報オブジェクト)リスト, 見つからない場合は空配列を返却
 */
export const simulationBoyoyon = (clodList = []) => {
    let okList = [];
    const reg = /"cnt":(.*?)\}/g;

    // 土塊マス生成前のオリジナルデータを保持する。
    const originFieldData = structuredClone(ManageFieldData.getObject());

    // 土塊のマスを壁にする。
    clodList.forEach((clod) => {
        const id = ManageFieldData.getFieldKey(clod.x, clod.y);
        ManageFieldData.setData(id, `clod`);
    });

    // グリッド全体を走査する。
    const sizeData = ManageFieldData.getSize();
    for (let j = 0; j < sizeData.h; j++) {
        for (let i = 0; i < sizeData.w; i++) {
            // シレンが立てない場所はスキップする。
            const id = ManageFieldData.getFieldKey(i, j);
            if (ManageFieldData.getData(id) != ``) {
                continue;
            }

            // 斜め4方向に対して反射の計算を行う。(縦横のみは省略)
            const directions = [
                { x: 1, y: 1 },
                { x: 1, y: -1 },
                { x: -1, y: 1 },
                { x: -1, y: -1 },
            ];

            directions.forEach((vec) => {
                // 反射計算を行う。
                const result = calculateReflection(i, j, vec, clodList);

                // 結果が存在する場合
                if (result) {
                    // 同じ場所を反射に利用した結果は出さない。
                    const listStr = JSON.stringify(okList).replace(reg, `}`);
                    const calcStr = JSON.stringify(result.pos).replace(
                        reg,
                        `}`
                    );
                    if (!listStr.includes(calcStr)) {
                        // 成功例リストに追加する。
                        okList.push(result);
                    }
                }
            });
        }
    }

    // 保持したオリジナルデータを設定する。(土塊マスをリセットする)
    ManageFieldData.setObject(originFieldData);

    return okList;
};

/**
 * @description 反射計算<br />
 * グリッド上の反射を計算します。<br />
 * @param {Number} i 開始グリッドのx座標
 * @param {Number} j 開始グリッドのy座標
 * @param {Object} startVec 開始時の方向を表すベクトル
 * @param {Object} clodList 土塊の杖を振ったマス
 * @return {Object|null} - 反射情報オブジェクト（反射が成功した場合）またはnull
 */
const calculateReflection = (i, j, startVec, clodList) => {
    /** 反射計算変数管理オブジェクト */
    let calcObj = {
        /** 現在のベクトル */
        nowVec: structuredClone(startVec),
        /** 反射したマス情報 */
        boundPos: [],
        /** 反射済の方角 */
        bouncedDirections: [],
        /** 場外判定 */
        outFlag: false,
        /** 終了判定 */
        stopFlag: false,
        /** 開始時のマス位置 */
        startGrid: { x: i, y: j },
        /** 現在のマス位置 */
        nowGrid: { x: i, y: j },
        /** 次回のマス位置 */
        nextGrid: null,
        /** 飛んだマス数(総計) */
        cnt: 0,
        /** 飛んだマス数(10マスカウント) */
        distance: 0,
        /** ログ出力用 */
        log: null,
    };

    // グリッドのマス数を取得する。
    const sizeData = ManageFieldData.getSize();

    // ログを出力する。
    calcObj.log = `// --start:_
        x${calcObj.nowGrid.x},_
        y${calcObj.nowGrid.y},_
        vec{${vecToStr(startVec)}}
        -----
    `.replace(/[\r\n\t ]/g, ``);
    logger(calcObj.log);

    while (1000 > calcObj.cnt++) {
        calcObj.nextGrid = {
            x: calcObj.nowGrid.x + calcObj.nowVec.x,
            y: calcObj.nowGrid.y + calcObj.nowVec.y,
        };

        // ログを出力する。
        calcObj.log = `now:_
            x${calcObj.nowGrid.x},_
            y${calcObj.nowGrid.y}_/_
            next:_
            x${calcObj.nextGrid.x},_
            y${calcObj.nextGrid.y}
        `.replace(/[\r\n\t ]/g, ``);
        logger(calcObj.log);

        // ブラジルに飛んでいったら終了する。
        if (isOutOfBounds(calcObj.nextGrid, sizeData)) {
            calcObj.outFlag = true;
            calcObj.stopFlag = true;
        }

        // 進行方向3方向のマス目の種類を取得する。
        const grids = getGridInfo(calcObj.nowGrid, calcObj.nextGrid);

        // 進行方向3方向の反射フラグを判定する。
        const reflections = getReflectionFlag(grids);

        // 終了判定を行う。
        calcObj.stopFlag =
            calcObj.stopFlag || isStopConditionMet(calcObj, grids);

        // 正面の壁に反射フラグが付いている場合
        if (!calcObj.stopFlag && reflections.front) {
            // 角に当たったら終了する。
            if (isHitCorner(reflections)) {
                calcObj.stopFlag = true;
            }

            // 斜め反射判定を行う。
            addBound(calcObj, grids, reflections);
        }

        // 終了判定の場合
        if (calcObj.stopFlag) {
            // 計算判定結果を返却する。
            return stopBound(calcObj, grids, startVec, clodList);
        }

        // 次のマスに移動する。
        calcObj.nowGrid = structuredClone(calcObj.nextGrid);
        calcObj.distance++;
    }

    // 計算判定結果を失敗で返却する。
    return null;
};

/**
 * @description 場外チェック
 * グリッドがフィールド外かを判定します。
 * @param {Object} grid 判定するグリッド座標
 * @param {Object} sizeData フィールドのサイズデータ
 * @return {Boolean} true: 場外, false: 場内
 */
const isOutOfBounds = (grid, sizeData) => {
    return (
        grid.x < 0 || grid.x >= sizeData.w || grid.y < 0 || grid.y >= sizeData.h
    );
};

/**
 * @description 角チェック
 * 次のマスが角かを判定します。
 * @param {Object} reflections 進行方向3方向の反射フラグ
 * @return {Boolean} true: 角, false: 角じゃない
 */
const isHitCorner = (reflections) => {
    return (
        (reflections.vertical && reflections.horizontal) ||
        (!reflections.vertical && !reflections.horizontal)
    );
};

/**
 * @description 反射終了チェック
 * グリッドの終了条件を判定します。
 * @param {Object} calcObj 反射計算変数管理オブジェクト
 * @param {Object} grids 進行方向3方向のグリッド情報
 * @return {Boolean} true: 終了, false: 継続
 */
const isStopConditionMet = (calcObj, grids) => {
    let stopFlag = false;

    // 10マス飛んだら終了する。
    if (calcObj.distance >= 10) {
        stopFlag = true;
    }

    // 元の位置に戻ったら終了する。
    if (
        calcObj.nextGrid.x === calcObj.startGrid.x &&
        calcObj.nextGrid.y === calcObj.startGrid.y
    ) {
        stopFlag = true;
    }

    // ボヨヨンの腕輪無しで壁に当たったら終了する。
    const bangleFlag = ManageFlag.getFlag(`bangle`);
    if (existsWallFlag(grids.front) && !bangleFlag) {
        stopFlag = true;
    }

    return stopFlag;
};

/**
 * @description 斜め反射成功判定追加<br />
 * 斜め反射成功判定を追加します。<br />
 * @param {Object} calcObj 反射計算変数管理オブジェクト
 * @param {Object} grids 進行方向3方向のグリッド情報
 * @param {Object} reflections 進行方向3方向の反射フラグ
 */
const addBound = (calcObj, grids, reflections) => {
    // 角ではない場合 (垂直方向で反射)
    if (!grids.vertical && reflections.horizontal) {
        logger(`bound!!`);

        calcObj.distance = 0;
        calcObj.boundPos.push({
            cnt: structuredClone(calcObj.cnt),
            grid: structuredClone(calcObj.nowGrid),
            vec: structuredClone(calcObj.nowVec),
        });

        // 成功判定を追加する。
        const boundVec = calcObj.nowVec.x == 1 ? `right` : `left`;
        if (
            !calcObj.bouncedDirections.includes(boundVec) &&
            grids.front === `boyo`
        ) {
            calcObj.bouncedDirections.push(boundVec);
        }

        // ベクトルを反転する。
        calcObj.nowVec.x *= -1;
        calcObj.nextGrid.x = calcObj.nowGrid.x;

        return true;
    }

    // 角ではない場合 (水平方向で反射)
    if (grids.vertical && !reflections.horizontal) {
        logger(`bound!!`);

        calcObj.distance = 0;
        calcObj.boundPos.push({
            cnt: structuredClone(calcObj.cnt),
            grid: structuredClone(calcObj.nowGrid),
            vec: structuredClone(calcObj.nowVec),
        });

        // 成功判定を追加する。
        const boundVec = calcObj.nowVec.y == 1 ? `down` : `up`;
        if (
            !calcObj.bouncedDirections.includes(boundVec) &&
            grids.front === `boyo`
        ) {
            calcObj.bouncedDirections.push(boundVec);
        }

        // ベクトルを反転する。
        calcObj.nowVec.y *= -1;
        calcObj.nextGrid.y = calcObj.nowGrid.y;
    }
};

/**
 * @description 反射終了<br />
 * 反射成功判定を追加します。<br />
 * @param {Object} calcObj 反射計算変数管理オブジェクト
 * @param {Object} grids 進行方向3方向のグリッド情報
 * @param {Object} startVec 開始時の方向を表すベクトル
 * @param {Object} clodList 土塊の杖を振ったマス
 * @return {Object|null} 計算判定結果
 */
const stopBound = (calcObj, grids, startVec, clodList) => {
    // 終了位置の座標情報を追加する。
    calcObj.boundPos.push({
        cnt: structuredClone(calcObj.cnt) - 0.5,
        grid: structuredClone(calcObj.nowGrid),
        vec: { x: 0, y: 0 },
    });

    // 成功判定(上下左右で反射)の場合
    if (calcObj.bouncedDirections.length == 4) {
        // 最終地点が通常壁もしくは場外の場合、フラグを付与する。(警告文表示のため)
        let endFlag = ``;
        if (calcObj.outFlag) {
            endFlag = `out`;
        }
        if (existsWallFlag(grids.front)) {
            endFlag = `kabe`;
        }

        return {
            stGrid: calcObj.startGrid,
            stVec: structuredClone(startVec),
            pos: calcObj.boundPos,
            endFlag: endFlag,
            clodList: clodList,
        };
    }

    return null;
};

/**
 * @description グリッド情報取得<br />
 * 進行方向3方向のマスの種類を取得します。<br />
 * @param {Object} nowGrid 現在のグリッド座標
 * @param {Object} nextGrid 次のグリッド座標
 * @return {Object} 進行方向3方向のグリッド情報
 */
const getGridInfo = (nowGrid, nextGrid) => {
    const frontId = ManageFieldData.getFieldKey(nextGrid.x, nextGrid.y);
    const frontGrid = ManageFieldData.getData(frontId);
    const verticalId = ManageFieldData.getFieldKey(nowGrid.x, nextGrid.y);
    const verticalGrid = ManageFieldData.getData(verticalId);
    const horizontalId = ManageFieldData.getFieldKey(nextGrid.x, nowGrid.y);
    const horizontalGrid = ManageFieldData.getData(horizontalId);

    return {
        front: frontGrid,
        vertical: verticalGrid,
        horizontal: horizontalGrid,
    };
};

/**
 * @description 反射フラグ取得<br />
 * 進行方向3方向の反射フラグを取得します。<br />
 * @param {Object} grids 進行方向3方向のグリッド情報
 * @return {Object} 進行方向3方向の反射フラグ
 */
const getReflectionFlag = (grids) => {
    return {
        front: existsBoyoyonFlag(grids.front),
        vertical: existsBoyoyonFlag(grids.vertical),
        horizontal: existsBoyoyonFlag(grids.horizontal),
    };
};
