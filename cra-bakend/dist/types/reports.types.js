"use strict";
// src/types/report.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quarter = exports.ReportType = exports.ReportFormat = void 0;
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "pdf";
    ReportFormat["WORD"] = "docx";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
var ReportType;
(function (ReportType) {
    ReportType["ACTIVITIES"] = "activities";
    ReportType["CONVENTIONS"] = "conventions";
    ReportType["KNOWLEDGE_TRANSFERS"] = "knowledge_transfers";
})(ReportType || (exports.ReportType = ReportType = {}));
var Quarter;
(function (Quarter) {
    Quarter[Quarter["Q1"] = 1] = "Q1";
    Quarter[Quarter["Q2"] = 2] = "Q2";
    Quarter[Quarter["Q3"] = 3] = "Q3";
    Quarter[Quarter["Q4"] = 4] = "Q4"; // Octobre-Décembre
})(Quarter || (exports.Quarter = Quarter = {}));
//# sourceMappingURL=reports.types.js.map