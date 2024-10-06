"use strict";
/**
 * @description ボヨヨンチェッカーツール 配列組み合わせ検索関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */
import { simulationBoyoyon } from "./byy10executeBoyoyonCheck.js";

/**
 * @description 配列組み合わせ検索<br />
 * 指定した配列の組み合わせを、1つから順に選択し、条件に一致するものを見つけるまでループします。<br />
 * 条件に一致する組み合わせが見つからない場合、要素数を増やして再度組み合わせを確認します。<br />
 * @param {Array} clodList 組み合わせを生成するための元の配列
 * @return {Array} 条件に一致する組み合わせ 見つからない場合は空配列を返却
 */
export const findValidCombination = (clodList) => {
    let okList = [];

    // 1つから配列の長さまでの要素数をループする。
    for (let i = 1; i <= clodList.length; i++) {
        // 現在の要素数での全ての組み合わせを生成する。
        const combinations = getCombinations(clodList, i);

        // 土塊の最大使用回数に達した場合、処理を中断する。
        const clodMaxUse = document.getElementById(`clodMaxUse`).value;
        if (combinations[0].length > clodMaxUse) {
            return okList;
        }

        // 各組み合わせについて条件チェックする。
        for (let combination of combinations) {
            // ボヨヨン壁チェックを実行する。
            const result = simulationBoyoyon(combination);

            if (result.length > 0) {
                // 条件に一致する組み合わせを結果に追加する。
                okList = okList.concat(result);
            }
        }

        // 条件に一致する組み合わせが見つかれば結果を返却する。
        if (okList.length > 0) {
            return okList;
        }
    }
    // 見つからない場合は空配列を返却する。
    return okList;
};

/**
 * @description 配列組み合わせ生成<br />
 * 配列から指定した数の要素の組み合わせを再帰的に生成します。
 * @param {Array} array 元の配列
 * @param {Number} n 選択する要素の数
 * @return {Array} 生成された全ての組み合わせを含む配列
 */
const getCombinations = (array, n) => {
    // 基本ケース: 選択する要素が1つの場合、その要素を単独の配列にして返却する。
    if (n === 1) {
        return array.map((el) => [el]);
    }

    let combinations = [];

    // 各要素に対して、残りの要素からの組み合わせを生成する。
    array.forEach((el, i) => {
        // 現在の要素を固定し、残りの要素からn-1個の組み合わせを取得する。
        const smallerComb = getCombinations(array.slice(i + 1), n - 1);
        // 取得した組み合わせに現在の要素を追加する。
        smallerComb.forEach((comb) => combinations.push([el, ...comb]));
    });

    return combinations;
};
