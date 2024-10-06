"use strict";
/**
 * @description ボヨヨンチェッカーツール ユーティリティクラス群
 * @author マムルファイターV2 / MFV2
 * @version 1.00<br />
 * 2024/10/06 / v1.00 / 初版作成<br />
 */

/**
 * @description グリッドマス目データ管理クラス<br />
 * グリッドマス目データを管理するクラスです。<br />
 */
export class ManageFlag {
    static list = {};

    /**
     * @description フラグ設定<br />
     * フラグを設定します。<br />
     * @param {String} key フラグ名
     * @param {Boolean} flag フラグ: true/false
     */
    static setFlag(key, flag) {
        this.list[key] = flag;
    }

    /**
     * @description フラグ取得<br />
     * フラグを取得します。<br />
     * @param {String} key フラグ名
     * @return {Boolean} フラグ: true/false
     */
    static getFlag(key) {
        return this.list[key];
    }
}

/**
 * @description グリッドマス目データ管理クラス<br />
 * グリッドマス目データを管理するクラスです。<br />
 */
export class ManageFieldData {
    static data = {};
    static size = {};

    /**
     * @description グリッドデータ設定<br />
     * グリッドのデータを設定します。<br />
     * @param {String} key グリッドのキー値
     * @param {String} data データ
     */
    static setData(key, data) {
        this.data[key] = data;
    }

    /**
     * @description グリッドデータ取得<br />
     * グリッドのデータを取得します。<br />
     * @param {String} key グリッドのキー値
     * @return {String} グリッドのデータ
     */
    static getData(key) {
        return this.data[key];
    }

    /**
     * @description グリッドキー値取得<br />
     * 座標からグリッドのキー値を取得します。<br />
     * @param {Number} x グリッドのx座標
     * @param {Number} y グリッドのy座標
     * @return {String} グリッドのキー値
     */
    static getFieldKey = (x, y) => {
        return `grid${x}_${y}`;
    };

    /**
     * @description グリッドマス数設定<br />
     * グリッドのマス数を設定します。<br />
     * @param {Object} data マス数データ
     */
    static setSize(data) {
        this.size = data;
    }

    /**
     * @description グリッドマス数取得<br />
     * グリッドのマス数を取得します。<br />
     * @return {Object} マス数データ
     */
    static getSize() {
        return this.size;
    }

    /**
     * @description グリッドマス目データ設定<br />
     * グリッドマス目データ全体のObjectを設定します。<br />
     * @param {Object} obj グリッドマス目データ
     */
    static setObject(obj) {
        this.data = obj;
    }

    /**
     * @description グリッドマス目データ取得<br />
     * グリッドマス目データ全体のObjectを取得します。<br />
     * @return {Object} グリッドマス目データ
     */
    static getObject() {
        return this.data;
    }
}

/**
 * @description Excel列番号変換管理クラス<br />
 * Excelの列番号風のアルファベット表記の相互変換を管理するクラスです。<br />
 * 参考: https://penult.hatenablog.com/entry/20110329/1301410546
 */
export class ExcelColumnConverter {
    /** 英字数 */
    static radix = 26;
    /** UTF-16コード */
    static startCode = `A`.charCodeAt(0);

    /**
     * @description 列番号→数値変換<br />
     * 列番号を数値に変換します。<br />
     * @param {String} str 列番号
     * @return {Number} 数値
     */
    static strToNum(str) {
        let s = str.toUpperCase();
        let n = 0;

        for (let i = 0, len = s.length; i < len; i++) {
            n = n * this.radix + (s.charCodeAt(i) - this.startCode + 1);
        }
        return n;
    }

    /**
     * @description 列番号→数値変換<br />
     * 列番号を数値に変換します。<br />
     * @param {Number} num 数値
     * @return {String} 列番号
     */
    static numToStr(num) {
        let n = num;
        let s = ``;
        while (n >= 1) {
            n--;
            s = String.fromCharCode(this.startCode + (n % this.radix)) + s;
            n = Math.floor(n / this.radix);
        }
        return s;
    }
}
