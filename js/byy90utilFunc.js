"use strict";
/**
 * @description ボヨヨンチェッカーツール ユーティリティ関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */
import { manageFlag } from "./byy91utilClass.js";

/**
 * @description 前回結果クリア<br />
 * 前回の結果をクリアします。<br />
 */
export const clearPreviousResults = () => {
    // 画像を削除する。
    document.querySelectorAll(`#gridArea img`).forEach((elm) => {
        elm.remove();
    });
    // 結果テキストを削除する。
    document.getElementById(`result`).innerText = ``;
};

/**
 * @description ベクトル文字列取得<br />
 * ベクトルから方向を文字列に変換します。<br />
 * @param {Object} vec ベクトルオブジェクト {x: number, y: number}
 * @return {String} 方向を表す文字列
 */
export const vecToStr = (vec) => {
    return `${vec.x == 1 ? "右" : "左"}${vec.y == 1 ? "下" : "上"}`;
};

/**
 * @description 壁反射判定<br />
 * 壁が反射可能か判定します。<br />
 * @param {String} wall マスの状態（`boyo`, `kabe` など）
 * @return {Boolean} true: 反射可能, false: 反射不可能
 */
export const existsBoyoyonFlag = (wall) => {
    const bangleFlag = manageFlag.getFlag(`bangle`);
    return wall === `boyo` || (existsWallFlag(wall) && bangleFlag);
};

/**
 * @description 通常壁判定<br />
 * 壁か判定します。<br />
 * @param {String} wall マスの状態（`boyo`, `kabe` など）
 * @return {Boolean} true: 通常壁, false: 通常壁以外
 */
export const existsWallFlag = (wall) => {
    return wall === `kabe` || wall === `clod`;
};

/**
 * @description 土塊使用可能マス判定<br />
 * 壁か判定します。<br />
 * @param {String} wall マスの状態（`boyo`, `kabe` など）
 * @return {Boolean} true: 使用可能, false: 使用不可能
 */
export const existsUseClodFlag = (wall) => {
    return wall === `` || wall === `mizu`;
};

/**
 * @description ログ出力<br />
 * ログを出力します。<br />
 * @param {String} _str ログ文章
 */
export const logger = (_str) => {
    const testFlag = manageFlag.getFlag(`test`);
    if (testFlag) {
        console.log(_str);
    }
};
