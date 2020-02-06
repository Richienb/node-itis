import ow from "ow"
import is from "@sindresorhus/is"
import omitEmpty from "omit-empty"

import request from "./request"

export async function lookup(tsn: string) {
	ow(tsn, ow.string)

	// TODO: Complete this.

	const {
		acceptedNameList,
		commentList,
		commonNameList,
		completenessRating,
		coreMetadata,
		credibilityRating,
		currencyRating,
		dateData,
		expertList,
		geographicDivisionList,
		hierarchyUp,
		jurisdictionalOriginList,
		kingdom,
		otherSourceList,

	} = await request("getFullRecordFromTSN", { tsn })

	return omitEmpty({
		acceptedNames: !is.nullOrUndefined(acceptedNameList) && acceptedNameList.acceptedNames.map(({ acceptedName, author }) => ({
			name: acceptedName,
			author
		}))
	}, {
		omitZero: true
	})
}

export async function search(keyword: string, { type = "any", position = null }:
	{ type?: "any", position?: null } |
	{ type: "commonName", position?: "begins" | "ends" } |
	{ type: "scientificName", position?: "begins" | "contains" | "ends" | "exact" } = {}
): Promise<{
	author: string
	year: number
	commonNames?: {
		name: string
		language: string
	}[]
	scientificName: string
	tsn: number
}[]> {
	ow(keyword, ow.string)
	ow(type, ow.string.matches(/any|commonName|scientificName/))

	let endpoint: string
	if (type === "any") endpoint = "searchForAnyMatch"
	else if (type === "commonName") {
		if (position === null) endpoint = "searchByCommonName"
		else {
			ow(position, ow.string.matches(/begins|ends/))

			endpoint = position === "begins" ? "searchByCommonNameBeginsWith" : "searchByCommonNameEndsWith"
		}
	}
	else {
		if (position === null) endpoint = "searchByScientificName"
		else {
			ow(position, ow.string.matches(/begins|contains|ends|exact/))

			const endpoints = {
				begins: "searchByScientificNameBeginsWith",
				contains: "searchByScientificNameContains",
				ends: "searchByScientificNameEndsWith",
				exact: "searchByScientificNameExact"
			}

			endpoint = endpoints[position]
		}
	}

	const { anyMatchList } = await request(endpoint, { srchKey: keyword })

	if (is.nullOrUndefined(anyMatchList)) return []

	return anyMatchList.map(({ author, commonNameList, matchType, sciName, tsn }) => {
		const { name, year } = is.string(author) && author.match(/(?<name>.+), (?<year>\d+)/).groups
		return omitEmpty({
			author: name,
			year: Number(year),
			commonNames: !is.nullOrUndefined(commonNameList) && commonNameList.commonNames.map(({ commonName, language }) => omitEmpty({
				name: commonName,
				language
			})),
			matchType: matchType.toLowerCase(),
			scientificName: sciName,
			tsn: Number(tsn)
		}, {
			omitZero: true
		})
	}) as any
}
