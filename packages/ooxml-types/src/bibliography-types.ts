// bibliography-types.ts
import type { ST_String, ST_Lang } from "./shared-types";

export enum ST_SourceType {
  ArticleInAPeriodical = "ArticleInAPeriodical",
  Book = "Book",
  BookSection = "BookSection",
  JournalArticle = "JournalArticle",
  ConferenceProceedings = "ConferenceProceedings",
  Report = "Report",
  SoundRecording = "SoundRecording",
  Performance = "Performance",
  Art = "Art",
  DocumentFromInternetSite = "DocumentFromInternetSite",
  InternetSite = "InternetSite",
  Film = "Film",
  Interview = "Interview",
  Patent = "Patent",
  ElectronicSource = "ElectronicSource",
  Case = "Case",
  Misc = "Misc",
}

export interface CT_PersonType {
  Last?: ST_String[];
  First?: ST_String[];
  Middle?: ST_String[];
}

export interface CT_NameListType {
  Person: CT_PersonType[];
}

export interface CT_NameType {
  NameList: CT_NameListType;
}

export interface CT_NameOrCorporateType {
  NameList?: CT_NameListType;
  Corporate?: ST_String;
}

export interface CT_AuthorType {
  Artist?: CT_NameType[];
  Author?: CT_NameOrCorporateType[];
  BookAuthor?: CT_NameType[];
  Compiler?: CT_NameType[];
  Composer?: CT_NameType[];
  Conductor?: CT_NameType[];
  Counsel?: CT_NameType[];
  Director?: CT_NameType[];
  Editor?: CT_NameType[];
  Interviewee?: CT_NameType[];
  Interviewer?: CT_NameType[];
  Inventor?: CT_NameType[];
  Performer?: CT_NameOrCorporateType[];
  ProducerName?: CT_NameType[];
  Translator?: CT_NameType[];
  Writer?: CT_NameType[];
}

export interface CT_SourceType {
  AbbreviatedCaseNumber?: ST_String;
  AlbumTitle?: ST_String;
  Author?: CT_AuthorType;
  BookTitle?: ST_String;
  Broadcaster?: ST_String;
  BroadcastTitle?: ST_String;
  CaseNumber?: ST_String;
  ChapterNumber?: ST_String;
  City?: ST_String;
  Comments?: ST_String;
  ConferenceName?: ST_String;
  CountryRegion?: ST_String;
  Court?: ST_String;
  Day?: ST_String;
  DayAccessed?: ST_String;
  Department?: ST_String;
  Distributor?: ST_String;
  Edition?: ST_String;
  Guid?: ST_String;
  Institution?: ST_String;
  InternetSiteTitle?: ST_String;
  Issue?: ST_String;
  JournalName?: ST_String;
  LCID?: ST_Lang;
  Medium?: ST_String;
  Month?: ST_String;
  MonthAccessed?: ST_String;
  NumberVolumes?: ST_String;
  Pages?: ST_String;
  PatentNumber?: ST_String;
  PeriodicalTitle?: ST_String;
  ProductionCompany?: ST_String;
  PublicationTitle?: ST_String;
  Publisher?: ST_String;
  RecordingNumber?: ST_String;
  RefOrder?: ST_String;
  Reporter?: ST_String;
  SourceType?: ST_SourceType;
  ShortTitle?: ST_String;
  StandardNumber?: ST_String;
  StateProvince?: ST_String;
  Station?: ST_String;
  Tag?: ST_String;
  Theater?: ST_String;
  ThesisType?: ST_String;
  Title?: ST_String;
  Type?: ST_String;
  URL?: ST_String;
  Version?: ST_String;
  Volume?: ST_String;
  Year?: ST_String;
  YearAccessed?: ST_String;
}

export interface CT_Sources {
  Source?: CT_SourceType[];
  SelectedStyle?: ST_String;
  StyleName?: ST_String;
  URI?: ST_String;
}
