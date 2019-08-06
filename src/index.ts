/**
 * @license
 *
 * MIT License
 *
 * Copyright (c) 2019 Richie Bendall
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import initSQL = require("sql.js")
import fetch from "cross-fetch"
import zip from "jszip"
import Promise from "bluebird"

class _itis {
    private data: object

    private load() {
        initSQL().then(sql => {
            fetch("https://itis.gov/downloads/itisSqlite.zip")
                .then(res => res.arrayBuffer())
                .then(buffer => zip.loadAsync(buffer))
                .then(data => data.folder(/itisSqlite\d+/).file("ITIS.sqlite").async("uint8array"))
                .then(data => {
                    const db = new sql.Database(data)
                    this.data = db.exec("SELECT *")
                });
        });
    }

    constructor() {
        this.load()
    }

    public refresh() {
        this.load()
    }

    get data() {
        return this.data
    }
}

export var itis = new _itis()
