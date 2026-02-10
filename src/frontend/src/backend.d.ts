import type { Principal } from "@dfinity/principal";

export interface CurrencyAggregatedAmount {
    currency: Currency;
    amount: bigint;
}

export type Timestamp = bigint;

export interface RecordingStudioSession {
    sessionType: string;
    sessionLengthInMinutes: bigint;
    recordingArtistsOrPodcasts: string;
    paymentAmount: MonetaryAmount;
    purposeOfSession: string;
}

export interface RoleRequest {
    passcode?: string;
    requestedRole: AppRole;
}

export interface Event {
    payedInFull: boolean;
    finalPaymentRequestSent: boolean;
    paymentAmount: MonetaryAmount;
    finalPaymentsConfirmed: boolean;
    eventName: string;
}

export interface IncomeRecordInput {
    serviceType: string;
    visitorPhoneNumber: string;
    podcast?: Podcast;
    email: string;
    payedInFull: boolean;
    event?: Event;
    recordingSession?: RecordingStudioSession;
    idNumber: string;
    visitorName: string;
    address: string;
    photoVideoShoots?: PhotoOrVideoShoots;
    paymentAmount: MonetaryAmount;
}

export interface PhotoOrVideoShoots {
    purposeOfShoot: string;
    primaryPhotographer: string;
    shootingHour: bigint;
    sessionLengthInMinutes: bigint;
    shootType: string;
    recordingArtistsOrPodcasts: string;
    primaryVideographer: string;
    paymentAmount: MonetaryAmount;
}

export interface IncomeRecord {
    serviceType: string;
    visitorPhoneNumber: string;
    podcast?: Podcast;
    email: string;
    payedInFull: boolean;
    event?: Event;
    recordingSession?: RecordingStudioSession;
    idNumber: string;
    visitorName: string;
    address: string;
    timestamp: Timestamp;
    photoVideoShoots?: PhotoOrVideoShoots;
    paymentAmount: MonetaryAmount;
}

export interface Guest {
    name: string;
    guestType: GuestType;
    phoneNumber: string;
}

export interface StudioReport {
    totalMonthIncomeEvents: Array<CurrencyAggregatedAmount>;
    totalVisitedCount: bigint;
    totalMonthIncomePhotoVideo: Array<CurrencyAggregatedAmount>;
    totalVisitsCountPhotoVideo: bigint;
    totalVisitsCountRecording: bigint;
    totalMonthIncomePodcast: Array<CurrencyAggregatedAmount>;
    totalMonthIncome: Array<CurrencyAggregatedAmount>;
    totalMonthIncomeRecording: Array<CurrencyAggregatedAmount>;
    totalVisitsCountEvents: bigint;
    totalVisitsCountPodcast: bigint;
}

export interface MonetaryAmount {
    currency: Currency;
    amount: bigint;
}

export interface UserProfile {
    name: string;
}

export interface Podcast {
    podcastName: string;
    hostName: string;
    guests: Array<Guest>;
}

export enum AppRole {
    Director = "Director",
    Reception = "Reception",
    Manager = "Manager"
}

export enum Currency {
    BWP = "BWP",
    EUR = "EUR",
    GBP = "GBP",
    USD = "USD",
    ZAR = "ZAR",
    ZMW = "ZMW",
    ZWG = "ZWG"
}

export enum GuestType {
    guest = "guest",
    cohost = "cohost",
    assistant = "assistant"
}

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createIncomeRecord(record: IncomeRecordInput): Promise<bigint>;
    deleteAllIncomeRecords(): Promise<void>;
    getAllIncomeRecords(): Promise<Array<IncomeRecord>>;
    getAllMonthlyReportsForYear(year: bigint): Promise<Array<StudioReport>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIncomeRecord(id: bigint): Promise<IncomeRecord | null>;
    getMonthlyReport(year: bigint, month: bigint): Promise<StudioReport>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestRole(roleRequest: RoleRequest): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePodcastDetails(recordId: bigint, podcast: Podcast): Promise<void>;
}
