// src/types/funding.types.ts
import { FundingType, FundingStatus } from '@prisma/client';

export interface CreateFundingDTO {
  fundingSource: string;
  fundingType: FundingType;
  status?: FundingStatus;
  requestedAmount: number;
  approvedAmount?: number;
  receivedAmount?: number;
  currency?: string;
  applicationDate?: Date;
  approvalDate?: Date;
  startDate?: Date;
  endDate?: Date;
  conditions?: string;
  reportingReqs?: string[];
  restrictions?: string[];
  contractNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  activityId: string;
  conventionId?: string;
}

export interface UpdateFundingDTO {
  fundingSource?: string;
  fundingType?: FundingType;
  status?: FundingStatus;
  requestedAmount?: number;
  approvedAmount?: number;
  receivedAmount?: number;
  currency?: string;
  applicationDate?: Date;
  approvalDate?: Date;
  startDate?: Date;
  endDate?: Date;
  conditions?: string;
  reportingReqs?: string[];
  restrictions?: string[];
  contractNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  conventionId?: string;
}

export interface FundingFilters {
  activityId?: string;
  fundingType?: FundingType;
  status?: FundingStatus;
  conventionId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
}