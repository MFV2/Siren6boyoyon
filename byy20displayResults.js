"use strict";
/**
 * @description ボヨヨンチェッカーツール 計算結果表示関数群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */
import { logger, vecToStr } from "./byy90utilFunc.js";
import { excelColumnConverter, manageFieldData } from "./byy91utilClass.js";

/** 計算結果データ */
let g_byy20_resultData;

/**
 * @description 計算結果表示<br />
 * 計算結果を表示します。<br />
 * @param {Array} okList 成功した反射地点リスト
 */
export const displayResults = (okList) => {
    const targetElm = document.getElementById(`result`);
    targetElm.innerHTML = ``;

    const kabeStr = `※最終地点が壁なので壷投げ不可`;
    const outStr = `※最終地点が場外なので注意`;
    const okStr = `上下左右で反射できる場所が、${okList.length}ヶ所見つかりました！`;
    const ngStr = `上下左右で反射できる場所が見つかりませんでした……`;

    g_byy20_resultData = [];

    // 1行目に表示するテキストを作成する。
    const mainSpan = document.createElement(`span`);
    const mainText = document.createTextNode(okList.length > 0 ? okStr : ngStr);
    mainSpan.appendChild(mainText);
    targetElm.appendChild(mainSpan);

    if (okList.length > 0) {
        okList.forEach((data, i) => {
            g_byy20_resultData.push(data);

            // ボタンを作成する。
            const button = document.createElement(`input`);

            // ボタンの属性を設定する。
            button.type = `button`;
            button.value = `[${i}]`;
            button.className = `resultButton`;

            // イベントリスナを設定する。
            button.addEventListener(`click`, () => {
                createTraceAnm(i);
            });

            // 文字列を作成する。
            let clodStr = ``;
            if (data.clodList.length > 0) {
                clodStr = ` / 土塊: ${data.clodList.length}回使用`;
            }

            const str = `
                開始位置 [
                    ${excelColumnConverter.numToStr(data.stGrid.y + 1)} 
                    ${data.stGrid.x + 1}
                ]マス (
                    x${data.stGrid.x + 1}, 
                    y${data.stGrid.y + 1}
                ) / 
                方向: 
                    ${vecToStr(data.stVec)} 
                    ${data.endFlag === `kabe` ? kabeStr : ``}
                    ${data.endFlag === `out` ? outStr : ``}
                    ${clodStr}
            `;

            const subText = document.createTextNode(str);
            const subSpan = document.createElement(`span`);
            subSpan.appendChild(subText);

            // 要素を追加する。
            targetElm.appendChild(document.createElement(`br`));
            targetElm.appendChild(button);
            targetElm.appendChild(subSpan);
        });
    }
};

/**
 * @description 計算結果再生アニメーション作成<br />
 * 計算結果を再現する再生アニメーションを作成します。<br />
 * @param {Number} idx 再生結果番号
 */
const createTraceAnm = (idx) => {
    // -------------------------------------------------------------------
    const data = g_byy20_resultData[idx];
    const elmId = manageFieldData.getFieldKey(data.stGrid.x, data.stGrid.y);
    const gridElm = document.getElementById(elmId);
    const allCnt = data.pos[data.pos.length - 1].cnt + 3;
    let lastGrid = {};

    // -------------------------------------------------------------------
    // 画像要素を削除する。
    document.querySelectorAll(`#gridArea img`).forEach((elm) => {
        elm.remove();
    });

    // 土塊マスのクラス名を一度リセットする。
    document.querySelectorAll(`.clod`).forEach((elm) => {
        elm.classList.remove(`clod`);
    });

    // 土塊マスに対してクラス名をセットする。
    data.clodList.forEach((clod) => {
        const clodElmId = manageFieldData.getFieldKey(clod.x, clod.y);
        const clodGridElm = document.getElementById(clodElmId);
        clodGridElm.classList.add(`clod`);
    });

    // -------------------------------------------------------------------
    // 巻物の投擲アニメーションを定義する。
    let cssStr = ``;
    const offset_w = gridElm.offsetWidth;
    const offset_h = gridElm.offsetHeight;

    data.pos.forEach((obj) => {
        logger(`// -----------------------------`);
        logger(
            `${data.stGrid.x}, ${data.stGrid.y} / 
            ${obj.grid.x}, ${obj.grid.y} / 
            ${obj.vec.x / 2}, ${obj.vec.y / 2}
            `.replace(/[\r\n\t]/g, ``)
        );
        logger(obj.grid.x + obj.vec.x / 2 - data.stGrid.x);
        logger(obj.grid.y + obj.vec.y / 2 - data.stGrid.y);

        // -------------------------------------------------------------------
        // 座標情報および経過時間でcssアニメーションを動的に生成する。
        let per = Math.round((100 / allCnt) * obj.cnt * 100) / 100;
        let x = (obj.grid.x + obj.vec.x / 2 - data.stGrid.x) * offset_w;
        let y = (obj.grid.y + obj.vec.y / 2 - data.stGrid.y) * offset_h;
        lastGrid = { x: x, y: y };

        cssStr += `${per}% { transform: translate(${x}px, ${y}px); }`;
    });

    // 作成したcss構文を追加する。
    document.getElementById(`css`).innerHTML = `
        <style>
            .scroll {
                animation-timing-function: linear;
                animation-duration: ${allCnt / 8}s;
                animation-name: scroll;
            }
            @keyframes scroll {${cssStr}
                100% { transform: translate(${lastGrid.x}px, ${lastGrid.y}px);
            }
        </style>
    `;

    // -------------------------------------------------------------------
    // 画像追加: ベクトル
    let arrowImg = document.createElement(`img`);
    arrowImg.src = `img/arrow.svg`;
    if (data.stVec.x == 1 && data.stVec.y == 1) {
        arrowImg.style.transform = `rotate(${90}deg)`;
    }
    if (data.stVec.x == 1 && data.stVec.y == -1) {
        arrowImg.style.transform = `rotate(${0}deg)`;
    }
    if (data.stVec.x == -1 && data.stVec.y == 1) {
        arrowImg.style.transform = `rotate(${180}deg)`;
    }
    if (data.stVec.x == -1 && data.stVec.y == -1) {
        arrowImg.style.transform = `rotate(${-90}deg)`;
    }
    gridElm.appendChild(arrowImg);

    // -------------------------------------------------------------------
    // 画像追加: 巻物
    let scrollImg = document.createElement(`img`);
    scrollImg.src = `img/scroll.svg`;
    scrollImg.setAttribute(`class`, `scroll`);
    gridElm.appendChild(scrollImg);

    // -------------------------------------------------------------------
    // 画像追加: シレンくん
    let sirenImg = document.createElement(`img`);
    sirenImg.src = `img/siren.svg`;
    gridElm.appendChild(sirenImg);
};
