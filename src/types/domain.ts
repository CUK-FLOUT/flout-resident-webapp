export type ID = string;
export type ISODateString = string;

export interface AddressCandidate {
  roadAddress: string;
  jibunAddress: string;
  zipCode: string;
  buildingName?: string;
  buildingManagementNo: string;
}

export interface HouseInfo {
  address: string;
  isSemiBasement: boolean;
  floorLabel: string;
  builtYear?: number;
}

export type RiskLevel = 'HIGH' | 'CAUTION' | 'LOW';

export type InspectionNeed = 'PRIORITY' | 'RECOMMENDED' | 'INFO';

export type RiskFactorCode =
  'LOW_LYING' | 'DRAINAGE_CAPACITY' | 'FLOOD_HISTORY' | 'ROAD_SLOPE' | 'HEAVY_RAINFALL';

export interface RiskFactor {
  code: RiskFactorCode;
  description: string;
}

export interface RiskAssessment {
  id: ID;
  house: HouseInfo;
  riskLevel: RiskLevel;
  inspectionNeed: InspectionNeed;
  factors: RiskFactor[];
  analyzedAt: ISODateString;
  expectedSupport?: ExpectedSupport;
}

export interface ExpectedSupport {
  programName: string;
  facility: string;
  estimatedCost: number;
  note: string;
}

export interface GuideItem {
  id: ID;
  title: string;
  description: string;
  estimatedMinutes?: number;
  done: boolean;
}

export interface PreventionGuide {
  id: ID;
  assessmentId: ID;
  items: GuideItem[];
}

export type UnresolvedReason = 'WINDOW_ENTRANCE' | 'DRAIN_BATHROOM' | 'OTHER';

export type Tenure = 'OWNER' | 'TENANT' | 'OTHER';
export type YesNoUnknown = 'YES' | 'NO' | 'UNKNOWN';

export type WaterEntryPoint = 'WINDOW' | 'ENTRANCE' | 'BATHROOM' | 'DRAIN' | 'OTHER' | 'UNKNOWN';

export type ExistingFacility =
  'NONE' | 'WATER_BARRIER' | 'BACKFLOW_PREVENTER' | 'WINDOW_GUARD' | 'UNKNOWN';

export type VisitTimeSlot = 'MORNING' | 'AFTERNOON' | 'ANYTIME';

export interface InspectionRequestInput {
  assessmentId?: ID;
  address: string;
  applicantName: string;
  phone: string;
  tenure: Tenure;
  floodExperience: YesNoUnknown;
  waterEntryPoints: WaterEntryPoint[];
  photos: File[];
  existingFacility: ExistingFacility;
  reason?: string;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot;
}

export interface InspectionApplicationRequest {
  assessmentId: number;
  guideId?: number;
  address: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  contact: string;
  applicantName: string;
  occupancyType: 'OWNER' | 'TENANT' | 'ETC';
  floodExperience: YesNoUnknown;
  existingFacility: boolean;
  requestReason?: string;
  preferredVisitDate: string;
  preferredTimeSlot: 'MORNING' | 'AFTERNOON' | 'ANY';
  inflowLocations: ('WINDOW' | 'ENTRANCE' | 'BATHROOM' | 'DRAIN' | 'ETC' | 'UNKNOWN')[];
}

export interface InspectionDraftResponse {
  applicationId: number;
  inspectionId: number | null;
  receiptNo: string;
  status: 'DRAFT' | 'RECEIVED' | 'INSPECTION_COMPLETED';
  submittedAt: string | null;
}

export interface InspectionReceipt {
  applicationId: number;
  receiptNumber: string;
  applicant: { name: string; phone: string };
  address: string;
  detailAddress: string;
  applicationStatus: 'DRAFT' | 'RECEIVED' | 'INSPECTION_COMPLETED';
  inspectionStatus: string | null;
  createdAt: string;
  submittedAt?: string | null;
  attachmentCount: number;
}

export interface InspectionUploadResponse {
  inspectionId: number;
  attachments: { attachmentId: number; filename: string; contentType: string; size: number }[];
}

export type ApplicationStage =
  | 'INSPECTION_RECEIVED'
  | 'VISIT_SCHEDULED'
  | 'INSPECTION_IN_PROGRESS'
  | 'INSPECTION_RESULT_PENDING'
  | 'INSPECTION_COMPLETED'
  | 'SUPPORT_RECEIVED'
  | 'SUPPORT_REVIEW'
  | 'SUPPORT_APPROVED'
  | 'SUPPORT_REJECTED'
  | 'CONSTRUCTION_SCHEDULED'
  | 'CONSTRUCTION_IN_PROGRESS'
  | 'COMPLETED';

export interface VisitSchedule {
  date: ISODateString;
  timeLabel: string;
  inspectorName?: string;
  confirmed: boolean;
}

export interface ApplicationSummary {
  id: ID;
  title: string;
  address: string;
  stage: ApplicationStage;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ApplicationListItem extends ApplicationSummary {
  receiptNumber: string;
  closed: boolean;
}

export interface ApplicationDetail extends ApplicationSummary {
  request: Omit<InspectionRequestInput, 'photos'> & { photoUrls: string[] };
  visit?: VisitSchedule;
  hasResult: boolean;
}

export type VulnerabilityType =
  'WINDOW_OPENING' | 'ENTRANCE' | 'SEWER_BACKFLOW' | 'STRUCTURE_OTHER';

export type ResolutionScope = 'INDIVIDUAL' | 'REGIONAL';

export interface VulnerablePoint {
  id: ID;
  type: VulnerabilityType;
  title: string;
  detail: string;
  photoUrls: string[];
}

export interface Recommendation {
  id: ID;
  facility: string;
  method: string;
  relatedPointIds: ID[];
}

export interface InspectionResult {
  applicationId: ID;
  inspectedAt: ISODateString;
  summary: string;
  scope: ResolutionScope;
  points: VulnerablePoint[];
  recommendations: Recommendation[];
  supportEligibility: 'ELIGIBLE' | 'CHECK_REQUIRED' | 'NOT_ELIGIBLE';
}

export interface SupportRequirement {
  title: string;
  description: string;
}

export interface SupportProgram {
  id: ID;
  name: string;
  description: string;
  target: string;
  benefit: string;
  conditions: SupportRequirement[];
  requiredDocuments: SupportRequirement[];
  reason?: string;
}

export type ConsentStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'SUBMITTED' | 'CONFIRMED';
export type SupportApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface InspectionApplicationDetail extends Omit<
  InspectionReceipt,
  'detailAddress' | 'inspectionStatus'
> {
  detailAddress: string | null;
  occupancyType: InspectionApplicationRequest['occupancyType'];
  floodExperience: YesNoUnknown;
  inflowLocations: InspectionApplicationRequest['inflowLocations'];
  existingFacility: boolean;
  requestReason: string | null;
  preferredVisitDate: string | null;
  preferredTimeSlot: InspectionApplicationRequest['preferredTimeSlot'] | null;
  inspectionStatus: 'RECEIVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | null;
  resultPublished: boolean;
  progress: {
    title?: string;
    stage: ApplicationStage | null;
    constructionId?: number | null;
    inspectionResultSummary?: string | null;
    visit: {
      scheduledAt: ISODateString | null;
      inspectorName: string | null;
      preVisitNotice: string | null;
    } | null;
    support?: {
      supportApplicationId: number;
      status: SupportApplicationStatus;
      requestedFacility?: string | null;
      supportScope?: string | null;
      rejectionReason?: string | null;
    } | null;
    construction?: {
      constructionId: number;
      status: ConstructionStatus;
      scheduledAt: ISODateString | null;
      completedAt: ISODateString | null;
      finalInstallationResult: string | null;
    } | null;
  } | null;
}

export interface RecommendedFacilities {
  applicationId: number;
  recommendationCount: number;
  facilities: string[];
}

export interface CreateSupportApplicationInput {
  applicationId: number;
  programId: number;
  requestedFacility: string;
  preferredVisitDate: string;
  preferredVisitTime: VisitTimeSlot;
}

export interface SupportApplicationResponse {
  supportApplicationId: number;
  applicationId: number;
  programId: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt: ISODateString | null;
  receiptNumber: string;
  applicantName: string;
  programName: string;
  createdAt: ISODateString;
}

export interface SupportAttachmentResponse {
  attachmentId: number;
  supportApplicationId: number;
  attachmentType: 'LANDLORD_CONSENT';
  fileName: string;
  size: number;
  contentType: string;
  submittedAt: ISODateString;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

export interface SupportReview {
  supportApplicationId: number;
  applicationId: number;
  receiptNo: string;
  applicantName: string;
  address: string;
  detailAddress: string | null;
  programName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt: ISODateString;
  requestedFacility: string;
  occupancyType: 'OWNER' | 'TENANT' | 'ETC';
  preferredConstructionDate: string;
  preferredTimeSlot: 'MORNING' | 'AFTERNOON' | 'ANY';
}

interface SupportDecisionBase {
  supportApplicationId: number;
  applicationId: number;
  receiptNo: string;
  applicantName: string;
  address: string;
  detailAddress: string | null;
  programName: string;
  requestedFacility: string;
}

export interface SupportApproval extends SupportDecisionBase {
  status: SupportApplicationStatus;
  approvedAt: ISODateString;
  supportScope: string | null;
  scheduledConstructionDate: string | null;
  scheduledConstructionTime: string | null;
}

export interface SupportRejection extends SupportDecisionBase {
  status: SupportApplicationStatus;
  rejectionReason: string | null;
  rejectedAt: ISODateString;
  inspectionId: number | null;
  inspectionResultPublished: boolean;
}

export interface SupportSchedule extends SupportDecisionBase {
  status: 'APPROVED';
  scheduledConstructionDate: string | null;
  scheduledConstructionTime: string | null;
}

export type SupportDecision = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ConstructionStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ConstructionSchedule {
  constructionId: number;
  supportApplicationId: number;
  applicationId: number;
  receiptNo: string;
  applicantName: string;
  address: string;
  detailAddress: string | null;
  status: ConstructionStatus;
  requestedFacility: string;
  supportScope: string | null;
  scheduledConstructionDate: string | null;
  scheduledConstructionTime: string | null;
}

export interface ConstructionPhoto {
  photoId: number;
  fileName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: ISODateString;
}

export interface ConstructionResult extends ConstructionSchedule {
  completedAt: ISODateString | null;
  finalInstallationResult: string | null;
  updatedAt: ISODateString;
  workHistory: { status: ConstructionStatus; changedAt: ISODateString }[];
  beforePhotos: ConstructionPhoto[];
  photos: ConstructionPhoto[];
}

export interface SupportProgress {
  applicationId: ID;
  programName: string;
  decision: SupportDecision;
  consent: ConsentStatus;
  rejectReason?: string;
  submittedAt: ISODateString;
  facility: string;
  preferredDate: string;
  preferredTimeSlot: VisitTimeSlot;
  scheduledAt?: ISODateString;
}

export type NotificationType =
  | 'INSPECTION_RECEIVED'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_STARTED'
  | 'INSPECTION_RESULT_PUBLISHED'
  | 'SUPPORT_RECEIVED'
  | 'SUPPORT_APPROVED'
  | 'SUPPORT_REJECTED'
  | 'CONSTRUCTION_SCHEDULED'
  | 'CONSTRUCTION_STARTED'
  | 'CONSTRUCTION_COMPLETED';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  applicationId: ID;
  receiptNumber: string;
  title: string;
  body: string;
  createdAt: ISODateString;
  read: boolean;
}
