import ow from "ow"
import is from "@sindresorhus/is"
import omitEmpty from "omit-empty"

import request from "./request"

interface FullRecord {
	tsn?: string
	acceptedNameList?: {
		tsn?: string
		acceptedNames?: {
			acceptedName?: string
			acceptedTsn?: string
			author?: string
		}[]
	}
	commentList?: {
		tsn?: string
		comments?: {
			commentDetail?: string
			commentId?: string
			commentTimeStamp?: string
			commentator?: string
			updateDate?: string
		}[]
	}
	commonNameList?: {
		tsn?: string
		commonNames?: {
			commonName?: string
			language?: string
			tsn?: string
		}[]
	}
	completenessRating?: {
		tsn?: string
		completeness?: string
		rankId?: number
	}
	coreMetadata?: {
		tsn?: string
		credRating?: string
		rankId?: number
		taxonCoverage?: string
		taxonCurrency?: string
		taxonUsageRating?: string
		unacceptReason?: string
	}
	credibilityRating?: {
		tsn?: string
		credRating?: string
	}
	currencyRating?: {
		tsn?: string
		rankId?: number
		taxonCurrency?: string
	}
	dateData?: {
		tsn?: string
		initialTimeStamp?: string
		updateDate?: string
	}
	expertList?: {
		tsn?: string
		experts?: {
			comment?: string
			expert?: string
			referenceFor?: {
				name?: string
				refLanguage?: string
				referredTsn?: string
			}
			updateDate?: string
		}[]
	}
	geographicDivisionList?: {
		tsn?: string
		geoDivisions?: {
			geographicValue?: string
			updateDate?: string
		}[]
	}
	hierarchyUp?: {
		tsn?: string
		author?: string
		parentName?: string
		parentTsn?: string
		rankName?: string
		taxonName?: string
	}
	jurisdictionalOriginList?: {
		tsn?: string
		jurisdictionalOrigins?: {
			durisdictionValue?: string
			origin?: string
			updateDate?: string
		}[]
	}
	kingdom?: {
		tsn?: string
		kingdomId?: string
		kingdomName?: string
	}
	otherSourceList?: {
		tsn?: string
		otherSources?: {
			acquisitionDate?: string
			referenceFor?: {
				name?: string
				refLanguage?: string
				referredTsn?: string
			}
			source?: string
			sourceComment?: string
			sourceType?: string
			updateDate?: string
			version?: string
		}[]
	}
	parentTSN?: {
		tsn?: string
		parentTsn?: string
	}
	publicationList?: {
		tsn?: string
		publications?: {
			actualPubDate?: string
			isbn?: string
			issn?: string
			listedPubDate?: string
			pages?: string
			pubComment?: string
			pubPlace?: string
			publisher?: string
			referenceAuthor?: string
			referenceFor?: {
				name?: string
				refLanguage?: string
				referredTsn?: string
			}
			title?: string
			updateDate?: string
		}[]
		scientificName?: {
			tsn?: string
			author?: string
			combinedName?: string
			kingdom?: string
			unitInd1?: string
			unitInd2?: string
			unitInd3?: string
			unitInd4?: string
			unitName1?: string
			unitName2?: string
			unitName3?: string
			unitName4?: string
		}
		synonymList?: {
			tsn?: string
			synonyms?: {
				author?: string
				sciName?: string
				tsn?: string
			}[]
		}
		taxRank?: {
			tsn?: string
			kingdomId?: string
			kingdomName?: string
			rankId?: string
			rankName?: string
		}
		taxonAuthor?: {
			tsn?: string
			authorship?: string
			updateDate?: string
		}
		unacceptReason?: {
			tsn?: string
			unacceptReason?: string
		}
		usage?: {
			tsn?: string
			taxonUsageRating?: string
		}
	}
}

interface SearchResult {
	anyMatchList?: {
		author?: string
		commonNameList?: {
			tsn?: string
			commonNames?: {
				commonName?: string
				language?: string
				tsn?: string
			}[]
		}
		matchType?: string
		sciName?: string
		tsn?: string
	}[]
}

function maybeNullArray<ArrayType extends any[]>(array: ArrayType): ArrayType {
	return (array[0] === null ? [] : array) as any
}

export async function lookup(tsn: number) {
	ow(tsn, ow.number.integer)

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
	} = await request("getFullRecordFromTSN", { tsn }) as FullRecord

	return omitEmpty({
		acceptedNames: maybeNullArray(acceptedNameList.acceptedNames).map(({ acceptedName, author }) => ({
			name: acceptedName,
			author
		})),
		commonNames: maybeNullArray(commentList.comments).map(({ commentDetail, commentId, commentTimeStamp, commentator, updateDate }) => {
			const { type, comment } = commentDetail.match(/^(?<type>.+):  (?<comment>.+)/).groups
			const { name, year } = commentator.match(/(?<name>.+),.+(?<year>\d+)/).groups
			return {
				type,
				comment,
				id: Number(commentId),
				time: new Date(commentTimeStamp),
				name,
				year,
			}
		})
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

	const { anyMatchList } = await request(endpoint, { srchKey: keyword }) as SearchResult

	return maybeNullArray(anyMatchList).map(({ author, commonNameList, matchType, sciName, tsn }) => {
		const { name, year } = is.string(author) && author.match(/(?<name>.+), (?<year>\d+)/).groups
		return omitEmpty({
			author: name,
			year: Number(year),
			commonNames: maybeNullArray(commonNameList.commonNames).map(({ commonName, language }) => omitEmpty({
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
