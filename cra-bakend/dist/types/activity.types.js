"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityStatus = exports.ActivityLifecycleStatus = exports.ActivityType = exports.ParticipantRole = void 0;
// Ajouter l'énumération ParticipantRole si elle n'existe pas déjà
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["RESPONSABLE"] = "RESPONSABLE";
    ParticipantRole["CO_RESPONSABLE"] = "CO_RESPONSABLE";
    ParticipantRole["CHERCHEUR_PRINCIPAL"] = "CHERCHEUR_PRINCIPAL";
    ParticipantRole["CHERCHEUR_ASSOCIE"] = "CHERCHEUR_ASSOCIE";
    ParticipantRole["TECHNICIEN"] = "TECHNICIEN";
    ParticipantRole["STAGIAIRE"] = "STAGIAIRE";
    ParticipantRole["PARTENAIRE_EXTERNE"] = "PARTENAIRE_EXTERNE";
    ParticipantRole["CONSULTANT"] = "CONSULTANT";
})(ParticipantRole || (exports.ParticipantRole = ParticipantRole = {}));
// Énumérations CRA
var ActivityType;
(function (ActivityType) {
    ActivityType["RECHERCHE_EXPERIMENTALE"] = "RECHERCHE_EXPERIMENTALE";
    ActivityType["RECHERCHE_DEVELOPPEMENT"] = "RECHERCHE_DEVELOPPEMENT";
    ActivityType["PRODUCTION_SEMENCES"] = "PRODUCTION_SEMENCES";
    ActivityType["FORMATION_DISPENSEE"] = "FORMATION_DISPENSEE";
    ActivityType["FORMATION_RECUE"] = "FORMATION_RECUE";
    ActivityType["STAGE"] = "STAGE";
    ActivityType["ENCADREMENT"] = "ENCADREMENT";
    ActivityType["TRANSFERT_ACQUIS"] = "TRANSFERT_ACQUIS";
    ActivityType["SEMINAIRE"] = "SEMINAIRE";
    ActivityType["ATELIER"] = "ATELIER";
    ActivityType["CONFERENCE"] = "CONFERENCE";
    ActivityType["DEMONSTRATION"] = "DEMONSTRATION";
    ActivityType["AUTRE"] = "AUTRE";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var ActivityLifecycleStatus;
(function (ActivityLifecycleStatus) {
    ActivityLifecycleStatus["NOUVELLE"] = "NOUVELLE";
    ActivityLifecycleStatus["RECONDUITE"] = "RECONDUITE";
    ActivityLifecycleStatus["CLOTUREE"] = "CLOTUREE";
})(ActivityLifecycleStatus || (exports.ActivityLifecycleStatus = ActivityLifecycleStatus = {}));
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PLANIFIEE"] = "PLANIFIEE";
    ActivityStatus["EN_COURS"] = "EN_COURS";
    ActivityStatus["SUSPENDUE"] = "SUSPENDUE";
    ActivityStatus["ANNULEE"] = "ANNULEE";
    ActivityStatus["CLOTUREE"] = "CLOTUREE";
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));
//# sourceMappingURL=activity.types.js.map