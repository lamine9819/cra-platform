// src/controllers/partner.controller.ts - VERSION CORRIGÉE
import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/partner.service';
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnerListQuerySchema
} from '../utils/partnerValidation';

const partnerService = new PartnerService();

export class PartnerController {

  // Créer un nouveau partenaire (Admin ou Chercheur)
  createPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createPartnerSchema.parse(req.body);
      const partner = await partnerService.createPartner(validatedData);

      res.status(201).json({
        success: true,
        message: 'Partenaire créé avec succès',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les partenaires avec filtres
  listPartners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = partnerListQuerySchema.parse(req.query);
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
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un partenaire par ID
  getPartnerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const partner = await partnerService.getPartnerById(id);

      res.status(200).json({
        success: true,
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un partenaire
  updatePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updatePartnerSchema.parse(req.body);
      const partner = await partnerService.updatePartner(id, validatedData);

      res.status(200).json({
        success: true,
        message: 'Partenaire mis à jour avec succès',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un partenaire
  deletePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await partnerService.deletePartner(id);

      res.status(200).json({
        success: true,
        message: 'Partenaire supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Rechercher des partenaires par expertise
  searchByExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expertise } = req.query;
      
      if (!expertise) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre expertise est requis'
        });
      }

      const expertiseArray = (expertise as string).split(',').map(e => e.trim());
      const partners = await partnerService.searchPartnersByExpertise(expertiseArray);

      res.status(200).json({
        success: true,
        data: partners,
        count: partners.length,
        searchCriteria: {
          expertise: expertiseArray
        }
      });
    } catch (error) {
      next(error);
    }
  };
}