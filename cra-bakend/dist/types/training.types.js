"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupervisionType = exports.SupervisionStatus = exports.TrainingType = void 0;
// Énumérations
var TrainingType;
(function (TrainingType) {
    TrainingType["FORMATION_COURTE"] = "FORMATION_COURTE";
    TrainingType["FORMATION_DIPLOMANTE"] = "FORMATION_DIPLOMANTE";
    TrainingType["STAGE_ADAPTATION"] = "STAGE_ADAPTATION";
    TrainingType["STAGE_RECHERCHE"] = "STAGE_RECHERCHE";
    TrainingType["ATELIER_TECHNIQUE"] = "ATELIER_TECHNIQUE";
    TrainingType["SEMINAIRE_FORMATION"] = "SEMINAIRE_FORMATION";
})(TrainingType || (exports.TrainingType = TrainingType = {}));
var SupervisionStatus;
(function (SupervisionStatus) {
    SupervisionStatus["EN_COURS"] = "EN_COURS";
    SupervisionStatus["SOUTENU"] = "SOUTENU";
    SupervisionStatus["ABANDONNE"] = "ABANDONNE";
})(SupervisionStatus || (exports.SupervisionStatus = SupervisionStatus = {}));
var SupervisionType;
(function (SupervisionType) {
    SupervisionType["DOCTORAT"] = "DOCTORAT";
    SupervisionType["MASTER"] = "MASTER";
    SupervisionType["LICENCE"] = "LICENCE";
    SupervisionType["INGENIEUR"] = "INGENIEUR";
})(SupervisionType || (exports.SupervisionType = SupervisionType = {}));
//# sourceMappingURL=training.types.js.map