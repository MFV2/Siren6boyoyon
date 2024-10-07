"use strict";
/**
 * @description ボヨヨンチェッカーツール グリッドエリア生成関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */
import { createSampleData } from "./byy01createSampleData.js";
import { clearPreviousResults } from "./byy90utilFunc.js";
import {
    ExcelColumnConverter,
    ManageFieldData,
    ManageFlag,
} from "./byy91utilClass.js";

/** ドラッグ時に要素へ付加するクラス名 */
let g_byy00_hoveredElementClass = null;

/**
 * @description グリッドエリア生成<br />
 * グリッドエリアを生成します。<br />
 * 生成前に既存の子要素を全て削除し、グリッドのプロパティとイベントを管理します。<br />
 */
export const createGridArea = () => {
    // 生成前に、既に存在するマス目を全て削除する。
    if (!deleteGridArea()) {
        // ダイアログでキャンセルを選んだ場合は処理を中止する。
        return;
    }

    // 前回の結果をクリアする。
    clearPreviousResults();

    // 生成前に、既に存在するマス目を全て削除する。
    setGridAreaSize();

    // グリッドを作成する。
    createGridRow();

    // グリッドエリアの設定を確定する。
    finalizeGridArea();
};

/**
 * @description グリッドエリア削除<br />
 * 生成前に既存の子要素を全て削除します。<br />
 * @return {Boolean} true: 削除実行, false: 削除中止
 */
const deleteGridArea = () => {
    /** グリッドマス目を表示する要素 */
    let elm = document.getElementById(`gridArea`);

    // 既にグリッドを生成済みである場合 (要素が存在する場合)
    if (elm.firstChild) {
        const confirmDelete = window.confirm(
            `現在のマス目はすべて消えます。再生成しても宜しいですか？`
        );

        // ダイアログでOKを選んだ場合は処理を実行する。
        if (confirmDelete) {
            // 既存の子要素を全て削除する。
            while (elm.firstChild) {
                elm.removeChild(elm.firstChild);
            }
            return true;
        }

        // ダイアログでキャンセルを選んだ場合は処理を中止する。
        else {
            return false;
        }
    }
    return true;
};

/**
 * @description グリッドエリアサイズ設定<br />
 * グリッドエリアのサイズを設定します。<br />
 */
const setGridAreaSize = () => {
    // サンプルデータを作成する。
    const sampleData = createSampleData();

    // サンプルデータの定義があればグリッドエリアの初期設定にする。
    const sampleDataName = document.getElementById(`sample`).value;
    const sampleCase = sampleData[sampleDataName];
    if (sampleCase) {
        // サンプルデータのマス数に変更する。
        document.getElementById(`gridAreaWidth`).value =
            sampleCase.field[0].length - 2;
        document.getElementById(`gridAreaHeight`).value =
            sampleCase.field.length - 2;
    }

    // マス数は、部屋外のことも考えて+2マスで設定する。
    const sizeData = {
        w: Number(document.getElementById(`gridAreaWidth`).value) + 2,
        h: Number(document.getElementById(`gridAreaHeight`).value) + 2,
    };
    ManageFieldData.setSize(sizeData);
};

/**
 * @description グリッド生成<br />
 * グリッドを生成します。<br />
 */
const createGridRow = () => {
    // グリッドマス目を表示する箱要素を取得する。
    let elm = document.getElementById(`gridArea`);

    // グリッドのマス数を取得する。
    const sizeData = ManageFieldData.getSize();

    for (let j = -1; j < sizeData.h; j++) {
        // グリッドの横列を作成する。
        const newDiv = document.createElement(`div`);
        newDiv.setAttribute(`class`, `column`);

        for (let i = -1; i < sizeData.w; i++) {
            // グリッドを作成する。
            const id = ManageFieldData.getFieldKey(i, j);
            const elmCls = setGridElementClass(i, j);

            ManageFieldData.setData(id, elmCls);

            const newSpan = document.createElement(`span`);
            newSpan.textContent = setGridElementString(i, j);
            newSpan.setAttribute(`id`, id);
            newSpan.setAttribute(`class`, `grid ${elmCls}`);
            newSpan.setAttribute(`posX`, i);
            newSpan.setAttribute(`posY`, j);
            setEventListeners(newSpan);

            // 生成したグリッドをグリッドの横列に追加する。
            newDiv.appendChild(newSpan);
        }
        // 生成したグリッドの横列を箱要素に追加する。
        elm.appendChild(newDiv);
    }
};

/**
 * @description グリッドクラス名設定<br />
 * グリッドのクラス名を設定します。<br />
 * @param {Number} i グリッドのX座標
 * @param {Number} j グリッドのY座標
 * @return {String} グリッド要素のクラス名
 */
const setGridElementClass = (i, j) => {
    // グリッドのマス数を取得する。
    const sizeData = ManageFieldData.getSize();

    // マス目ガイド用クラス名を追加する。
    if (i == -1 || j == -1) {
        return `guide`;
    }

    // 普通の壁用クラス名を追加する。
    if (i == 0 || i == sizeData.w - 1 || j == 0 || j == sizeData.h - 1) {
        return `kabe`;
    }

    // ボヨヨン壁用クラス名を追加する。
    if (i == 1 || i == sizeData.w - 2 || j == 1 || j == sizeData.h - 2) {
        return `boyo`;
    }

    return ``;
};

/**
 * @description グリッド文字列設定<br />
 * グリッドの文字列を設定します。<br />
 * @param {Number} i グリッドのX座標
 * @param {Number} j グリッドのY座標
 * @return {String} グリッド要素の文字列
 */
const setGridElementString = (i, j) => {
    // 縦列の場合、Excel番号を追加する。(e.g. "A", "Z", "AA")
    if (i == -1 && j >= 0) {
        return ExcelColumnConverter.numToStr(j + 1);
    }
    // 横列の場合、数字を追加する。(e.g. "1", "9", "10")
    if (i >= 0 && j == -1) {
        return i + 1;
    }
    return ``;
};

/**
 * @description イベントリスナ設定<br />
 * グリッド要素のイベントリスナを設定します。<br />
 * @return {Object} elm 要素
 */
const setEventListeners = (elm) => {
    // ドラッグ開始時のイベントリスナを設定する。
    elm.addEventListener(`mousedown`, (ev) => {
        onGridMouseDown(ev);
    });

    // ドラッグ中のイベントリスナを設定する。
    elm.addEventListener(`mousemove`, (ev) => {
        onGridMouseMove(ev);
    });

    // ドラッグ終了時のイベントリスナを設定する。
    elm.addEventListener(`mouseup`, (ev) => {
        onGridMouseUp(ev);
    });

    // タッチ開始時のイベントリスナを設定する。
    elm.addEventListener(
        `touchstart`,
        (ev) => {
            onGridMouseDown(ev);
            // タッチ開始時にスクロールを無効化する。
            ev.preventDefault();
        },
        { passive: false }
    );

    // タッチ中のイベントリスナを設定する。
    elm.addEventListener(
        `touchmove`,
        (ev) => {
            onGridTouchMove(ev);
            // スライド中にスクロールを無効化する。
            ev.preventDefault();
        },
        { passive: false }
    );

    // タッチ終了時のイベントリスナを設定する。
    elm.addEventListener(`touchend`, (ev) => {
        onGridMouseUp(ev);
    });
};

/**
 * @description グリッドマウスダウン処理<br />
 * グリッド要素でマウスダウンされた際に呼び出されるイベント処理です。<br />
 * @return {Object} ev mousedown/touchstartイベント
 */
const onGridMouseDown = (ev) => {
    const elm = ev.target;
    g_byy00_hoveredElementClass = getClickGridClass(elm, ev);
    changeGridClassName(elm);
};

/**
 * @description グリッドマウスムーブ処理<br />
 * グリッド要素でマウスムーブされた際に呼び出されるイベント処理です。<br />
 * @return {Object} ev mousemoveイベント
 */
const onGridMouseMove = (ev) => {
    const elm = ev.target;
    changeGridClassName(elm);
};

/**
 * @description グリッドタッチムーブ処理<br />
 * グリッド要素でタッチムーブされた際に呼び出されるイベント処理です。<br />
 * @return {Object} ev touchmoveイベント
 */
const onGridTouchMove = (ev) => {
    // タッチポイントを取得
    const touch = ev.touches[0];
    const elm = document.elementFromPoint(touch.clientX, touch.clientY);

    changeGridClassName(elm);
};

/**
 * @description グリッドマウスアップ処理<br />
 * グリッド要素でマウスアップされた際に呼び出されるイベント処理です。<br />
 * @return {Object} ev mouseup/touchendイベント
 */
const onGridMouseUp = (ev) => {
    g_byy00_hoveredElementClass = null;
};

/**
 * @description グリッドクラス名変更<br />
 * グリッド要素のクラス名を変更します。<br />
 * @return {Object} elm グリッド要素
 */
const changeGridClassName = (elm) => {
    const i = elm.getAttribute(`posX`);
    const j = elm.getAttribute(`posY`);

    // -------------------------------------------------------------------
    // ガイド用の文字列があるグリッドは処理をスキップする。
    if (i < 0 || j < 0) {
        return;
    }

    // -------------------------------------------------------------------
    // マウス操作中、タッチ操作中ではない場合は処理をスキップする。
    if (null === g_byy00_hoveredElementClass) {
        return;
    }

    // -------------------------------------------------------------------
    // 前回の結果をクリアする。
    clearPreviousResults();

    // -------------------------------------------------------------------
    // クリック/ドラッグした要素のクラス名を書き換える。
    elm.setAttribute(`class`, `grid ${g_byy00_hoveredElementClass}`);

    // -------------------------------------------------------------------
    ManageFieldData.setData(elm.id, g_byy00_hoveredElementClass);
};

/**
 * @description クリック時グリッドクラス名取得<br />
 * クリック時に設定するグリッドのクラス名を取得します。<br />
 * @param {Object} elm グリッド要素
 * @param {Number} ev グリッドのY座標
 * @return {String} グリッド要素のクラス名
 */
const getClickGridClass = (elm, ev) => {
    const shiftPush = (ev) => ev.shiftKey;
    const ctrlPush = (ev) => ev.ctrlKey || ev.metaKey; // metaKeyはMacOS用
    const bothPush = (ev) => shiftPush(ev) && ctrlPush(ev); // キー同時押し判定用

    if (elm.classList.length === 1) {
        // スマホ操作時はラジオボタンでクラス名を決定する。
        const iosFlag = ManageFlag.getFlag(`ios`);
        if (iosFlag) {
            return getWallClassForIos();
        }

        // PC操作時は押下キーでクラス名を決定する。
        else {
            if (shiftPush(ev)) {
                return `kabe`;
            }
            if (ctrlPush(ev)) {
                return `mizu`;
            }
            if (bothPush(ev)) {
                return `sora`;
            }
            return `boyo`;
        }
    }

    return ``;
};

/**
 * @description グリッドクラス名取得<br />
 * グリッドのクラス名を取得します。<br />
 * なお、iOS時のみ使用します。<br />
 * @return {String} グリッド要素のクラス名
 */
const getWallClassForIos = () => {
    const elm = document.getElementsByName(`iosWall`);

    // ラジオボタンでクラス名を決定する。
    for (let i = 0; i < elm.length; i++) {
        if (elm.item(i).checked) {
            return elm.item(i).value;
        }
    }
    return ``;
};

/**
 * @description グリッドエリア確定処理<br />
 * グリッドエリアの設定を確定します。<br />
 */
const finalizeGridArea = () => {
    // グリッドエリア生成時に各要素を書き換える。
    document.getElementById(`gridAreaButton`).value = `再生成`;
    document.getElementById(`resultButton`).style.opacity = 1;
    document.getElementById(`howTo`).style.opacity = 1;

    // PC用、スマホ用の操作説明をいずれか可視化させる。
    const iosFlag = ManageFlag.getFlag(`ios`);
    const howToElm = document.getElementById(iosFlag ? `PC` : `ios`);
    if (howToElm) {
        howToElm.remove();
    }

    // サンプルデータを作成する。
    const sampleData = createSampleData();

    const sampleDataName = document.getElementById(`sample`).value;
    const sampleCase = sampleData[sampleDataName];
    if (sampleCase) {
        fieldSetting(sampleCase);
    }
};

/**
 * @description テスト用データ作成<br />
 * テスト用データを作成します。<br />
 * @param {Object} sampleCase サンプルデータ
 */
const fieldSetting = (sampleCase) => {
    for (let j = 0; j < sampleCase.field.length; j++) {
        for (let i = 0; i < sampleCase.field[j].length; i++) {
            const elmId = ManageFieldData.getFieldKey(i, j);
            const elm = document.getElementById(elmId);
            const elmCls = [``, `kabe`, `boyo`, `mizu`, `sora`, `clod`][
                sampleCase.field[j][i]
            ];

            ManageFieldData.setData(elmId, elmCls);
            elm.setAttribute(`class`, `grid ${elmCls}`);
        }
    }
};
