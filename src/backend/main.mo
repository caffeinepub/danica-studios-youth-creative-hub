import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type Timestamp = Time.Time;

  type Currency = {
    #USD;
    #ZAR;
    #EUR;
    #GBP;
    #BWP;
    #ZMW;
    #ZWG;
  };

  module Currency {
    public func compare(a : Currency, b : Currency) : Order.Order {
      switch (a, b) {
        case (#USD, #USD) { #equal };
        case (#USD, _) { #less };
        case (_, #USD) { #greater };
        case (#ZWG, #ZWG) { #equal };
        case (#ZWG, _) { #less };
        case (_, #ZWG) { #greater };
        case (#ZAR, #ZAR) { #equal };
        case (#ZAR, _) { #less };
        case (_, #ZAR) { #greater };
        case (#EUR, #EUR) { #equal };
        case (#EUR, _) { #less };
        case (_, #EUR) { #greater };
        case (#GBP, #GBP) { #equal };
        case (#GBP, _) { #less };
        case (_, #GBP) { #greater };
        case (#BWP, #BWP) { #equal };
        case (#BWP, _) { #less };
        case (_, #BWP) { #greater };
        case (#ZMW, #ZMW) { #equal };
      };
    };
  };

  type MonetaryAmount = {
    amount : Nat;
    currency : Currency;
  };

  type RecordingStudioSession = {
    recordingArtistsOrPodcasts : Text;
    sessionType : Text;
    paymentAmount : MonetaryAmount;
    sessionLengthInMinutes : Int;
    purposeOfSession : Text;
  };

  type PhotoOrVideoShoots = {
    recordingArtistsOrPodcasts : Text;
    shootType : Text;
    shootingHour : Nat;
    primaryPhotographer : Text;
    primaryVideographer : Text;
    paymentAmount : MonetaryAmount;
    sessionLengthInMinutes : Int;
    purposeOfShoot : Text;
  };

  type Event = {
    eventName : Text;
    paymentAmount : MonetaryAmount;
    payedInFull : Bool;
    finalPaymentRequestSent : Bool;
    finalPaymentsConfirmed : Bool;
  };

  public type GuestType = {
    #guest;
    #cohost;
    #assistant;
  };

  public type Guest = {
    name : Text;
    phoneNumber : Text;
    guestType : GuestType;
  };

  public type Podcast = {
    podcastName : Text;
    hostName : Text;
    guests : [Guest];
  };

  type IncomeRecord = {
    timestamp : Timestamp;
    visitorName : Text;
    visitorPhoneNumber : Text;
    serviceType : Text;
    recordingSession : ?RecordingStudioSession;
    photoVideoShoots : ?PhotoOrVideoShoots;
    event : ?Event;
    podcast : ?Podcast;
    paymentAmount : MonetaryAmount;
    payedInFull : Bool;
    address : Text;
    idNumber : Text;
    email : Text;
  };

  module IncomeRecord {
    public func compare(a : IncomeRecord, b : IncomeRecord) : Order.Order {
      Text.compare(a.visitorName, b.visitorName);
    };
  };

  type CurrencyAggregatedAmount = {
    currency : Currency;
    amount : Nat;
  };

  type StudioReport = {
    totalMonthIncome : [CurrencyAggregatedAmount];
    totalMonthIncomeRecording : [CurrencyAggregatedAmount];
    totalMonthIncomePhotoVideo : [CurrencyAggregatedAmount];
    totalMonthIncomeEvents : [CurrencyAggregatedAmount];
    totalMonthIncomePodcast : [CurrencyAggregatedAmount];
    totalVisitedCount : Nat;
    totalVisitsCountRecording : Nat;
    totalVisitsCountPhotoVideo : Nat;
    totalVisitsCountEvents : Nat;
    totalVisitsCountPodcast : Nat;
  };

  public type IncomeRecordInput = {
    visitorName : Text;
    visitorPhoneNumber : Text;
    serviceType : Text;
    paymentAmount : MonetaryAmount;
    payedInFull : Bool;
    recordingSession : ?RecordingStudioSession;
    photoVideoShoots : ?PhotoOrVideoShoots;
    event : ?Event;
    podcast : ?Podcast;
    address : Text;
    idNumber : Text;
    email : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // Application-Specific Role Types
  public type AppRole = {
    #Director;
    #Manager;
    #Reception;
  };

  public type RoleRequest = {
    requestedRole : AppRole;
    passcode : ?Text;
  };

  let incomeRecords = Map.empty<Nat, IncomeRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let directorPrincipals = List.empty<Principal>();
  let managerPrincipals = Map.empty<Principal, Bool>();
  let receptionPrincipals = Map.empty<Principal, Bool>();
  var nextId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if caller has Director role
  func isDirector(caller : Principal) : Bool {
    directorPrincipals.toArray().any(func(p : Principal) : Bool { p == caller });
  };

  // Helper function to check if caller has Manager role
  func isManager(caller : Principal) : Bool {
    switch (managerPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  // Helper function to check if caller has Reception role
  func isReception(caller : Principal) : Bool {
    switch (receptionPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  // Helper function to check if caller has any staff role
  func hasStaffRole(caller : Principal) : Bool {
    isDirector(caller) or isManager(caller) or isReception(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access profiles");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access profiles");
    };
    if (caller != user and not isDirector(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be Director");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createIncomeRecord(record : IncomeRecordInput) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot create income records");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can create income records");
    };

    let id = nextId;
    nextId += 1;

    let incomeRecord : IncomeRecord = {
      visitorName = record.visitorName;
      visitorPhoneNumber = record.visitorPhoneNumber;
      serviceType = record.serviceType;
      paymentAmount = record.paymentAmount;
      payedInFull = record.payedInFull;
      timestamp = Time.now();
      recordingSession = record.recordingSession;
      photoVideoShoots = record.photoVideoShoots;
      event = record.event;
      podcast = record.podcast;
      address = record.address;
      idNumber = record.idNumber;
      email = record.email;
    };

    incomeRecords.add(id, incomeRecord);
    id;
  };

  public shared ({ caller }) func updatePodcastDetails(recordId : Nat, podcast : Podcast) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot update podcast details");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can update podcast details");
    };

    switch (incomeRecords.get(recordId)) {
      case (null) {
        Runtime.trap("Income record not found");
      };
      case (?existingRecord) {
        let updatedRecord = { existingRecord with podcast = ?podcast };
        incomeRecords.add(recordId, updatedRecord);
      };
    };
  };

  public query ({ caller }) func getIncomeRecord(id : Nat) : async ?IncomeRecord {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view income records");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can view income records");
    };
    incomeRecords.get(id);
  };

  public query ({ caller }) func getAllIncomeRecords() : async [IncomeRecord] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view income records");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can view income records");
    };
    incomeRecords.values().toArray().sort();
  };

  func daysInMonth(year : Nat, month : Nat) : Int {
    let isLeapYear = (year % 4 == 0) and (year % 100 != 0 or year % 400 == 0);
    switch (month) {
      case (2) { if (isLeapYear) { 29 } else { 28 } };
      case (4 or 6 or 9 or 11) { 30 };
      case (_) { 31 };
    };
  };

  func createTime(year : Nat, month : Nat, day : Nat) : Time.Time {
    let baseYear = 1970;
    let yearDiff = (year - baseYear) : Int;
    let monthDiff = (month - 1) : Int;
    let dayDiff = (day - 1) : Int;

    let secondsInYear = 365 * 24 * 60 * 60;
    let secondsInMonth = 30 * 24 * 60 * 60;
    let secondsInDay = 24 * 60 * 60;

    let totalSeconds = yearDiff * secondsInYear + monthDiff * secondsInMonth + dayDiff * secondsInDay;
    (totalSeconds * 1_000_000_000) : Timestamp;
  };

  func aggregateByCurrency(records : [MonetaryAmount]) : [CurrencyAggregatedAmount] {
    let currencyTotals = Map.empty<Currency, Nat>();

    for (record in records.values()) {
      switch (record) {
        case ({
          amount;
          currency;
        }) {
          let currentAmount = switch (currencyTotals.get(currency)) {
            case (?value) { value };
            case (null) { 0 };
          };
          currencyTotals.add(currency, currentAmount + amount);
        };
      };
    };

    currencyTotals.toArray().map<(Currency, Nat), CurrencyAggregatedAmount>(
      func((currency, amount)) {
        { currency; amount };
      }
    );
  };

  func filterAndAggregate(records : [IncomeRecord], serviceType : ?Text) : [MonetaryAmount] {
    records.filter(
      func(record) {
        switch (serviceType) {
          case (?stype) { record.serviceType == stype };
          case (null) { true };
        };
      }
    ).map(
      func(record) { record.paymentAmount }
    );
  };

  func computeMonthlyReport(year : Nat, month : Nat) : StudioReport {
    let startOfMonth = createTime(year, month, 1);
    let endOfMonth = createTime(year, month + 1, 1);

    let monthlyRecords = incomeRecords.values().toArray().filter(
      func(record) { record.timestamp >= startOfMonth and record.timestamp < endOfMonth }
    );

    let totalMonthIncome = aggregateByCurrency(
      filterAndAggregate(monthlyRecords, null)
    );
    let totalMonthIncomeRecording = aggregateByCurrency(
      filterAndAggregate(monthlyRecords, ?"Recording Studio")
    );
    let totalMonthIncomePhotoVideo = aggregateByCurrency(
      filterAndAggregate(monthlyRecords, ?"Photo/Video Studio")
    );
    let totalMonthIncomeEvents = aggregateByCurrency(
      filterAndAggregate(monthlyRecords, ?"Event")
    );
    let totalMonthIncomePodcast = aggregateByCurrency(
      filterAndAggregate(monthlyRecords, ?"Podcast Studio")
    );

    let totalVisitedCount = monthlyRecords.size();
    let totalVisitsCountRecording = monthlyRecords.filter(
      func(record) { record.serviceType == "Recording Studio" }
    ).size();
    let totalVisitsCountPhotoVideo = monthlyRecords.filter(
      func(record) { record.serviceType == "Photo/Video Studio" }
    ).size();
    let totalVisitsCountEvents = monthlyRecords.filter(
      func(record) { record.serviceType == "Event" }
    ).size();
    let totalVisitsCountPodcast = monthlyRecords.filter(
      func(record) { record.serviceType == "Podcast Studio" }
    ).size();

    {
      totalMonthIncome;
      totalMonthIncomeRecording;
      totalMonthIncomePhotoVideo;
      totalMonthIncomeEvents;
      totalMonthIncomePodcast;
      totalVisitedCount;
      totalVisitsCountRecording;
      totalVisitsCountPhotoVideo;
      totalVisitsCountEvents;
      totalVisitsCountPodcast;
    };
  };

  public query ({ caller }) func getMonthlyReport(year : Nat, month : Nat) : async StudioReport {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access monthly reports");
    };
    if (not hasStaffRole(caller)) {
      Runtime.trap("Unauthorized: Only staff members can access monthly reports");
    };
    computeMonthlyReport(year, month);
  };

  public query ({ caller }) func getAllMonthlyReportsForYear(year : Nat) : async [StudioReport] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access yearly reports");
    };
    if (not isDirector(caller)) {
      Runtime.trap("Unauthorized: Only Directors can access all monthly reports for a year");
    };

    var reports : [StudioReport] = [];
    var month = 1;

    while (month <= 12) {
      let report = computeMonthlyReport(year, month);
      reports := reports.concat([report]);
      month += 1;
    };

    reports;
  };

  public shared ({ caller }) func deleteAllIncomeRecords() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot delete income records");
    };
    if (not isDirector(caller)) {
      Runtime.trap("Unauthorized: Only Directors can delete all income records");
    };
    incomeRecords.clear();
  };

  public shared ({ caller }) func requestRole(roleRequest : RoleRequest) : async () {
    // Authorization: Only authenticated users can request roles
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot request roles. Please authenticate first.");
    };

    // Check if user already has the requested role
    switch (roleRequest.requestedRole) {
      case (#Director) {
        if (isDirector(caller)) {
          return; // Already has Director role
        };

        // Restrict Director access to maximum 2 accounts
        let currentDirectorsCount = directorPrincipals.toArray().size();
        if (currentDirectorsCount >= 2) {
          Runtime.trap("Access denied: The Director role is limited to two accounts only. Maximum Director account count reached. Please log in as Manager or Reception if you are not a Director.");
        };

        // Grant Director role
        directorPrincipals.add(caller);
        // Also grant user role in AccessControl for basic permissions
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (#Manager) {
        if (isManager(caller)) {
          return; // Already has Manager role
        };

        // Verify passcode for Manager role
        switch (roleRequest.passcode) {
          case (null) {
            Runtime.trap("Access denied: A passcode is required to claim the Manager role.");
          };
          case (?passcode) {
            if (passcode != "1269") {
              Runtime.trap("Access denied: Incorrect passcode for Manager role.");
            };
          };
        };

        // Grant Manager role
        managerPrincipals.add(caller, true);
        // Also grant user role in AccessControl for basic permissions
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (#Reception) {
        if (isReception(caller)) {
          return; // Already has Reception role
        };

        // Verify passcode for Reception role
        switch (roleRequest.passcode) {
          case (null) {
            Runtime.trap("Access denied: A passcode is required to claim the Reception role.");
          };
          case (?passcode) {
            if (passcode != "2750") {
              Runtime.trap("Access denied: Incorrect passcode for Reception role.");
            };
          };
        };

        // Grant Reception role
        receptionPrincipals.add(caller, true);
        // Also grant user role in AccessControl for basic permissions
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
    };
  };
};


