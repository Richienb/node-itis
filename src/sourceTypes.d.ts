declare interface ITISTypeData {
    acceptedNameList: AcceptedNameList;
    class: string;
    commentList: CommentList;
    commonNameList: CommonNameList;
    completenessRating: Rating;
    coreMetadata: CoreMetadata;
    credibilityRating: CredibilityRating;
    currencyRating: Rating;
    dateData: DateData;
    expertList: ExpertList;
    geographicDivisionList: GeographicDivisionList;
    hierarchyUp: HierarchyUp;
    jurisdictionalOriginList: JurisdictionalOriginList;
    kingdom: Kingdom;
    otherSourceList: OtherSourceList;
    parentTSN: ParentTSN;
    publicationList: PublicationList;
    scientificName: { [key: string]: null | string };
    synonymList: SynonymList;
    taxRank: TaxRank;
    taxonAuthor: DateData;
    tsn: string;
    unacceptReason: UnacceptReason;
    usage: Usage;
}

declare interface AcceptedNameList {
    acceptedNames: null[];
    class: string;
    tsn: string;
}

declare interface CommentList {
    class: string;
    comments: Comment[];
    tsn: string;
}

declare interface Comment {
    class: string;
    commentDetail: string;
    commentId: string;
    commentTimeStamp: string;
    commentator: string;
    updateDate: string;
}

declare interface CommonNameList {
    class: string;
    commonNames: CommonName[];
    tsn: string;
}

declare interface CommonName {
    class: string;
    commonName: string;
    language: string;
    tsn: string;
}

declare interface Rating {
    class: string;
    completeness?: string;
    rankId: number;
    tsn: string;
    taxonCurrency?: string;
}

declare interface CoreMetadata {
    class: string;
    credRating: string;
    rankId: number;
    taxonCoverage: string;
    taxonCurrency: string;
    taxonUsageRating: string;
    tsn: string;
    unacceptReason: string;
}

declare interface CredibilityRating {
    class: string;
    credRating: string;
    tsn: string;
}

declare interface DateData {
    class: string;
    initialTimeStamp?: string;
    tsn: string;
    updateDate: string;
    authorship?: string;
}

declare interface ExpertList {
    class: string;
    experts: Expert[];
    tsn: string;
}

declare interface Expert {
    class: string;
    comment: string;
    expert: string;
    referenceFor: ReferenceFor[];
    updateDate: string;
}

declare interface ReferenceFor {
    class: string;
    name: string;
    refLanguage: null | string;
    referredTsn: string;
}

declare interface GeographicDivisionList {
    class: string;
    geoDivisions: GeoDivision[];
    tsn: string;
}

declare interface GeoDivision {
    class: string;
    geographicValue: string;
    updateDate: string;
}

declare interface HierarchyUp {
    author: null;
    class: string;
    parentName: string;
    parentTsn: string;
    rankName: string;
    taxonName: string;
    tsn: string;
}

declare interface JurisdictionalOriginList {
    class: string;
    jurisdictionalOrigins: JurisdictionalOrigin[];
    tsn: string;
}

declare interface JurisdictionalOrigin {
    class: string;
    jurisdictionValue: string;
    origin: string;
    updateDate: string;
}

declare interface Kingdom {
    class: string;
    kingdomId: string;
    kingdomName: string;
    tsn: string;
}

declare interface OtherSourceList {
    class: string;
    otherSources: OtherSource[];
    tsn: string;
}

declare interface OtherSource {
    acquisitionDate: string;
    class: string;
    referenceFor: ReferenceFor[];
    source: string;
    sourceComment: string;
    sourceType: string;
    updateDate: string;
    version: string;
}

declare interface ParentTSN {
    class: string;
    parentTsn: string;
    tsn: string;
}

declare interface PublicationList {
    class: string;
    publications: Publication[];
    tsn: string;
}

declare interface Publication {
    actualPubDate: string;
    class: string;
    isbn: string;
    issn: string;
    listedPubDate: string;
    pages: string;
    pubComment: string;
    pubName: string;
    pubPlace: string;
    publisher: string;
    referenceAuthor: string;
    referenceFor: ReferenceFor[];
    title: string;
    updateDate: string;
}

declare interface SynonymList {
    class: string;
    synonyms: Synonym[];
    tsn: string;
}

declare interface Synonym {
    author: null;
    class: Class;
    sciName: string;
    tsn: string;
}

declare enum Class {
    GovUsgsItisItisServiceDataSVCTaxonName = "gov.usgs.itis.itis_service.data.SvcTaxonName",
}

declare interface TaxRank {
    class: string;
    kingdomId: string;
    kingdomName: string;
    rankId: string;
    rankName: string;
    tsn: string;
}

declare interface UnacceptReason {
    class: string;
    tsn: string;
    unacceptReason: null;
}

declare interface Usage {
    class: string;
    taxonUsageRating: string;
    tsn: string;
}