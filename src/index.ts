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

/// <reference types="./sourceTypes" />
import fetch from "cross-fetch"
import Promise from "bluebird"

const generateSearchParams = (data: object): string => {
    const params = new URLSearchParams();
    Object.entries(data).map(val => params.append(val[0], val[1]))
    return params.toString()
}

const generateFetch = (endpoint: string, data: object) => fetch(`https://www.itis.gov/ITISWebService/jsonservice/${endpoint}?${generateSearchParams(data)}`).then(res => res.json())

const reduce = (arr, cb) => {
    if (arr === [null]) return []
    return arr.reduce((acc, curr) => {
        acc.push(cb(curr))
        return acc
    }, [])
}

const parseCommonNameList = ({
    commonNames
}: CommonNameList) => reduce(commonNames, ({
    commonName,
    language
}) => {
    name: commonName,
    language
})

const parseReferenceFor = (data: ReferenceFor[]) => reduce(data, ({
    name,
    refLanguage,
    tsn
}) => {
    name,
    language: refLanguage,
    tsn
})

const notNull = (val: any[]) => val === [null] ? [] : val

export default {
    search: (key: string) => new Promise((resolve, reject) => {
        generateFetch("searchForAnyMatch", {
                srchKey: key
            })
            .then(({
                anyMatchList
            }) => reduce(anyMatchList, {
                author,
                matchType,
                sciName,
                commonNameList
            } => {
                author,
                type: matchType.toLowerCase(),
                name: sciName,
                commonNames: parseCommonNameList(commonNameList)
            }))
            .catch(err => reject(err))
    }),
    tsn: (id: number) => new Promise((resolve, reject) => {
        generateFetch("getFullRecordFromTSN", {
                tsn: id
            })
            .then(({
                commentList,
                commonNameList,
                completenessRating,
                coreMetadata,
                dateData,
                expertList,
                geographicDivisionList,
                hierarchyUp,
                jurisdictionalOriginList,
                kingdom,
                otherSourceList,
                publicationList,
                scientificName,
                synonymList,
                taxRank,
                taxonAuthor,
                unacceptReason
            }: ITISTypeData) => {
                comments: reduce(commentList.comments, ({
                    commentDetail,
                    commentId,
                    commentTimeStamp,
                    commentator,
                    updateDate
                }) => {
                    name: commentator,
                    id: commentId,
                    lastUpdated: new Date(updateDate),
                    firstPosted: new Date(commentTimeStamp),
                    comment: commentDetail
                }),
                commonNames: parseCommonNameList(commonNameList),
                rank: coreMetadata.rankId,
                completeness: completenessRating.completeness,
                coverage: coreMetadata.taxonCoverage,
                currency: coreMetadata.taxonCurrency,
                validity: {
                    valid: coreMetadata.taxonUsageRating,
                    reason: unacceptReason.unacceptReason
                },
                firstAdded: new Date(dateData.initialTimeStamp),
                lastUpdated: new Date(dataData.updateDate),
                experts: reduce(expertList.experts, ({
                    expert,
                    comment,
                    referenceFor,
                    updateDate
                }) => {
                    expert,
                    comment,
                    referenceFor: parseReferenceFor(referenceFor),
                    lastUpdated: new Date(updateDate)
                }),
                geoDivisions: reduce(geographicDivisionList.geoDivisions, ({
                    geographicValue,
                    updateDate
                }) => {
                    name: geographicValue,
                    lastUpdated: new Date(updateDate)
                }),
                hierarhcyParent: {
                    name: hierarchyUp.parentName,
                    tsn: hierarchyUp.tsn,
                    rank: hierarchyUp.rankName
                },
                origins: reduce(jurisdictionalOriginList.jurisdictionalOrigins, ({
                    jurisdictionValue,
                    origin,
                    updateDate
                }) => {
                    name: jurisdictionalOriginList,
                    originType: origin,
                    lastUpdated: new Date(updateDate)
                }),
                kingdom: {
                    id: +taxRank.kingdomId,
                    name: taxRank.kingdomName.trim()
                },
                rank: {
                    id: +taxRank.rankId,
                    name: taxRank.rankName.trim()
                },
                otherSources: reduce(otherSourceList.otherSources, ({
                    acquisitionDate,
                    referenceFor,
                    source,
                    sourceComment,
                    sourceType,
                    updateDate,
                    version
                }) => {
                    acquisitionDate: new Date(acquisitionDate),
                    referenceFor: parseReferenceFor(referenceFor),
                    source: {
                        name: source,
                        comment: sourceComment,
                        type: sourceType
                    },
                    lastUpdated: new Date(updateDate),
                    version
                }),
                publications: reduce(publicationList.publications, ({actualPubDate, isbn, issn, listedPubDate, pages, pubComment, pubName, pubPlace, publisher, referenceAuthor, referenceFor, title, updateDate}) => {
                    date: {
                        listed: new Date(listedPubDate),
                        actual: new Date(actualPubDate)
                    },
                    isbn: isbn || undefined,
                    issn: issn || undefined,
                    pages,
                    comment: pubComment,
                    name: pubName,
                    location: pubPlace,
                    publisher,
                    referenceAuthor,
                    referenceFor: parseReferenceFor(referenceFor),
                    title,
                    lastUpdated: new Date(updateDate)
                }),
                name: scientificName.combinedName,
                synonyms: reduce(synonymList.synonyms, ({sciName, tsn}) => {
                    name: sciName,
                    tsn
                }),
                author: {
                    name: taxonAuthor.authorship,
                    lastUpdated: new Date(taxonAuthor.updateDate)
                }
            })
            .catch(err => reject(err))
    })
}