"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerController = void 0;
const partner_service_1 = require("../services/partner.service");
const partnerValidation_1 = require("../utils/partnerValidation");
const partnerService = new partner_service_1.PartnerService();
class PartnerController {
    constructor() {
        // Créer un nouveau partenaire (Admin ou Chercheur)
        this.createPartner = async (req, res, next) => {
            try {
                const validatedData = partnerValidation_1.createPartnerSchema.parse(req.body);
                const partner = await partnerService.createPartner(validatedData);
                res.status(201).json({
                    success: true,
                    message: 'Partenaire créé avec succès',
                    data: partner,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Lister les partenaires avec filtres
        this.listPartners = async (req, res, next) => {
            try {
                const queryParams = partnerValidation_1.partnerListQuerySchema.parse(req.query);
                const result = await partnerService.listPartners(queryParams);
                res.status(200).json({
                    success: true,
                    data: result.partners,
                    pagination: result.pagination,
                    filters: {
                        applied: queryParams,
                        available: {
                            types: ['UNIVERSITE', 'INSTITUT_RECHERCHE', 'ENTREPRISE_PRIVEE', 'ONG', 'ORGANISME_PUBLIC', 'ORGANISATION_INTERNATIONALE', 'COOPERATIVE', 'ASSOCIATION'],
                            categories: ['National', 'International', 'Privé', 'Public', 'ONG']
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir un partenaire par ID
        this.getPartnerById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const partner = await partnerService.getPartnerById(id);
                res.status(200).json({
                    success: true,
                    data: partner,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Mettre à jour un partenaire
        this.updatePartner = async (req, res, next) => {
            try {
                const { id } = req.params;
                const validatedData = partnerValidation_1.updatePartnerSchema.parse(req.body);
                const partner = await partnerService.updatePartner(id, validatedData);
                res.status(200).json({
                    success: true,
                    message: 'Partenaire mis à jour avec succès',
                    data: partner,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Supprimer un partenaire
        this.deletePartner = async (req, res, next) => {
            try {
                const { id } = req.params;
                await partnerService.deletePartner(id);
                res.status(200).json({
                    success: true,
                    message: 'Partenaire supprimé avec succès',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Rechercher des partenaires par expertise
        this.searchByExpertise = async (req, res, next) => {
            try {
                const { expertise } = req.query;
                if (!expertise) {
                    return res.status(400).json({
                        success: false,
                        message: 'Le paramètre expertise est requis'
                    });
                }
                const expertiseArray = expertise.split(',').map(e => e.trim());
                const partners = await partnerService.searchPartnersByExpertise(expertiseArray);
                res.status(200).json({
                    success: true,
                    data: partners,
                    count: partners.length,
                    searchCriteria: {
                        expertise: expertiseArray
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.PartnerController = PartnerController;
//# sourceMappingURL=partner.controller.js.map