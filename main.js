"use strict";
/**
 * @description ボヨヨンチェッカーツール メイン関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成、関数群を目的に合わせて各ファイルに分離。<br />
 * 2024/09/30 / v0.30 / 土塊の杖を最低何回使うと破綻したボヨヨン壁でも成功するかチェックする機能を追加。<br />
 * 2024/09/24 / v0.20 / マス操作時にドラッグ移動するとなぞった部分も同じマスにする機能を追加。<br />
 * 2023/11/18 / v0.10 / 仮作成<br />
 *
 * https://github.com/MFV2/siren6boyoyon
 */
import { createGridArea } from "./byy00createGridArea.js";
import { getSampleDataKeys } from "./byy01createSampleData.js";
import { executeBoyoyonCheck } from "./byy10executeBoyoyonCheck.js";
import { manageFlag } from "./byy91utilClass.js";

// ===================================================================
/** デバッグ用フラグ */
manageFlag.setFlag(`test`, false);
/** ボヨヨンの腕輪装着フラグ */
manageFlag.setFlag(`bangle`, false);
/** 土塊の杖使用フラグ */
manageFlag.setFlag(`clod`, false);
/** スマホ閲覧フラグ */
manageFlag.setFlag(
    `ios`,
    /(iPhone|iPad|iPod|Android)/.test(navigator.userAgent)
);

// ===================================================================
/** マス目入力フィールドに、エンターキー押下時のイベントリスナを設定する。 */
document.getElementById(`gridAreaWidth`).addEventListener(`keypress`, (ev) => {
    if (ev.key === `Enter`) {
        onGridAreaButton();
    }
});
document.getElementById(`gridAreaHeight`).addEventListener(`keypress`, (ev) => {
    if (ev.key === `Enter`) {
        onGridAreaButton();
    }
});
/** ボタン押下時のイベントリスナを設定する。 */
document.getElementById(`gridAreaButton`).addEventListener(`click`, (ev) => {
    onGridAreaButton();
});
document.getElementById(`resultButton`).addEventListener(`click`, (ev) => {
    onRresultButton();
});
/** チェックボックス操作時のイベントリスナを設定する。 */
document.getElementById(`bangleCB`).addEventListener(`change`, (ev) => {
    manageFlag.setFlag(`bangle`, ev.currentTarget.checked);
});
document.getElementById(`clodCB`).addEventListener(`change`, (ev) => {
    manageFlag.setFlag(`clod`, ev.currentTarget.checked);
});

// ===================================================================
/**
 * @description グリッド生成ボタン押下<br />
 * グリッド生成ボタンを押下した時の処理です。<br />
 */
const onGridAreaButton = () => {
    // グリッドエリア生成処理を開始する。
    createGridArea();
};

// ===================================================================
/**
 * @description 計算開始ボタン押下<br />
 * 計算開始ボタンを押下した時の処理です。<br />
 */
const onRresultButton = () => {
    // グリッドエリア生成処理を開始する。
    executeBoyoyonCheck();
};

// ===================================================================
// サンプルマップ一覧プルダウン項目作成
getSampleDataKeys().forEach((key) => {
    // optionタグを作成する。
    let option = document.createElement(`option`);
    option.text = key;
    option.value = key;

    // selectタグの子要素にoptionタグを追加する。
    let select = document.getElementById(`sample`);
    select.appendChild(option);
});
