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
} from "./byy90utilFunc.js";
import { manageFieldData, manageFlag } from "./byy91utilClass.js";

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
    const bangleFlag = manageFlag.getFlag(`bangle`);
    const clodFlag = manageFlag.getFlag(`clod`);
    if (result.length == 0 && bangleFlag && clodFlag) {
        // 土塊使用マスを記録するリストを定義します。
        let clodList = [];

        // グリッドのマス数を取得する。
        const sizeData = manageFieldData.getSize();

        // グリッド全体を走査する。
        for (let j = 0; j < sizeData.h; j++) {
            for (let i = 0; i < sizeData.w; i++) {
                const id = manageFieldData.getFieldKey(i, j);
                const grid = manageFieldData.getData(id);
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
 */
export const simulationBoyoyon = (clodList = []) => {
    let okList = [];
    const reg = /"cnt":(.*?)\}/g;

    // 土塊マス生成前のオリジナルデータを保持する。
    const originFieldData = structuredClone(manageFieldData.getObject());

    // 土塊のマスを壁にする。
    clodList.forEach((clod) => {
        const id = manageFieldData.getFieldKey(clod.x, clod.y);
        manageFieldData.setData(id, `clod`);
    });

    // グリッド全体を走査する。
    const sizeData = manageFieldData.getSize();
    for (let j = 0; j < sizeData.h; j++) {
        for (let i = 0; i < sizeData.w; i++) {
            // シレンが立てない場所はスキップする。
            const id = manageFieldData.getFieldKey(i, j);
            if (manageFieldData.getData(id) != ``) {
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
                const result = calculateReflection(
                    i,
                    j,
                    manageFieldData,
                    vec,
                    clodList
                );

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
    manageFieldData.setObject(originFieldData);

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
const calculateReflection = (i, j, fieldData, startVec, clodList) => {
    let nowVec = structuredClone(startVec);
    let boundPos = [];
    let bound = [];
    let outFlag = false;
    let stopFlag = false;
    let nowGrid = { x: i, y: j };
    let nextGrid;
    let cnt = 0;
    let distance = 0;

    // グリッドのマス数を取得する。
    const sizeData = manageFieldData.getSize();

    while (1000 > cnt++) {
        nextGrid = { x: nowGrid.x + nowVec.x, y: nowGrid.y + nowVec.y };

        // 10マス飛んだら終了する。
        if (distance >= 10) {
            stopFlag = true;
        }

        // ブラジルに飛んでいったら終了する。
        if (
            nextGrid.x < 0 ||
            nextGrid.x >= sizeData.w ||
            nextGrid.y < 0 ||
            nextGrid.y >= sizeData.h
        ) {
            outFlag = true;
            stopFlag = true;
        }

        // 元の位置に戻ったら終了する。
        if (nextGrid.x === i && nextGrid.y === j) {
            stopFlag = true;
        }

        // 進行方向3方向のマス目の種類を取得する。
        const frontId = manageFieldData.getFieldKey(nextGrid.x, nextGrid.y);
        const frontGrid = manageFieldData.getData(frontId);
        const verticalId = manageFieldData.getFieldKey(nowGrid.x, nextGrid.y);
        const verticalGrid = manageFieldData.getData(verticalId);
        const horizontalId = manageFieldData.getFieldKey(nextGrid.x, nowGrid.y);
        const horizontalGrid = manageFieldData.getData(horizontalId);

        // 進行方向3方向の反射フラグを判定する。
        const frontReflection = existsBoyoyonFlag(frontGrid);
        const verticalReflection = existsBoyoyonFlag(verticalGrid);
        const horizontalReflection = existsBoyoyonFlag(horizontalGrid);

        // ボヨヨンの腕輪無しで壁に当たったら終了する。
        const bangleFlag = manageFlag.getFlag(`bangle`);
        if (existsWallFlag(frontGrid) && !bangleFlag) {
            stopFlag = true;
        }

        // 角に当たったら終了する。
        if (
            (frontReflection && verticalReflection && horizontalReflection) ||
            (frontReflection && !verticalReflection && !horizontalReflection)
        ) {
            stopFlag = true;
        }

        // 正面の壁に反射フラグが付いている場合
        if (!stopFlag && frontReflection) {
            // 角ではない場合 (垂直方向で反射)
            if (!verticalGrid && horizontalReflection) {
                logger(`bound!!`);

                distance = 0;
                boundPos.push({
                    cnt,
                    grid: { ...nowGrid },
                    vec: { ...nowVec },
                });

                // 成功判定を追加する。
                let boundVec = nowVec.x == 1 ? `right` : `left`;
                if (!bound.includes(boundVec) && frontGrid === `boyo`) {
                    bound.push(boundVec);
                }

                // ベクトルを反転する。
                nowVec.x *= -1;
                nextGrid.x = nowGrid.x;
            }

            // 角ではない場合 (水平方向で反射)
            else if (verticalGrid && !horizontalReflection) {
                logger(`bound!!`);

                distance = 0;
                boundPos.push({
                    cnt,
                    grid: { ...nowGrid },
                    vec: { ...nowVec },
                });

                // 成功判定を追加する。
                const boundVec = nowVec.y == 1 ? `down` : `up`;
                if (!bound.includes(boundVec) && frontGrid === `boyo`) {
                    bound.push(boundVec);
                }

                // ベクトルを反転する。
                nowVec.y *= -1;
                nextGrid.y = nowGrid.y;
            }
        }

        // 終了判定の場合
        if (stopFlag) {
            // 終了位置の座標情報を追加する。
            boundPos.push({
                cnt: cnt - 0.5,
                grid: { ...nowGrid },
                vec: { x: 0, y: 0 },
            });

            // 成功判定(上下左右で反射)の場合
            if (bound.length == 4) {
                // 最終地点が通常壁もしくは場外の場合、フラグを付与する。(警告文表示のため)
                let endFlag = ``;
                if (outFlag) {
                    endFlag = `out`;
                }
                if (existsWallFlag(frontGrid)) {
                    endFlag = `kabe`;
                }

                return {
                    stGrid: { x: i, y: j },
                    stVec: { ...startVec },
                    pos: boundPos,
                    endFlag: endFlag,
                    clodList: clodList,
                };
            }
        }

        // 次のマスに移動する。
        nowGrid = { ...nextGrid };
        distance++;
    }
    return null;
};
