import { CreateStrategicPlanRequest, UpdateStrategicPlanRequest, CreateStrategicAxisRequest, UpdateStrategicAxisRequest, CreateStrategicSubAxisRequest, UpdateStrategicSubAxisRequest, CreateResearchProgramRequest, UpdateResearchProgramRequest, CreateResearchThemeRequest, UpdateResearchThemeRequest, CreateResearchStationRequest, UpdateResearchStationRequest } from '../types/strategic-planning.types';
export declare class StrategicPlanningService {
    createStrategicPlan(data: CreateStrategicPlanRequest, userId: string): Promise<{
        axes: ({
            subAxes: ({
                programs: ({
                    coordinator: {
                        email: string;
                        id: string;
                        firstName: string;
                        lastName: string;
                    };
                    themes: {
                        name: string;
                        description: string | null;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        code: string | null;
                        objectives: string[];
                        order: number | null;
                        programId: string;
                    }[];
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    startDate: Date | null;
                    endDate: Date | null;
                    strategicSubAxisId: string;
                    coordinatorId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicAxisId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicPlanId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number;
        endYear: number;
    }>;
    getStrategicPlans(params: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        startYear?: number;
        endYear?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            axes: ({
                subAxes: ({
                    programs: ({
                        _count: {
                            projects: number;
                        };
                        coordinator: {
                            email: string;
                            id: string;
                            firstName: string;
                            lastName: string;
                        };
                        themes: {
                            name: string;
                            description: string | null;
                            id: string;
                            isActive: boolean;
                            createdAt: Date;
                            updatedAt: Date;
                            code: string | null;
                            objectives: string[];
                            order: number | null;
                            programId: string;
                        }[];
                    } & {
                        name: string;
                        description: string | null;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        code: string | null;
                        startDate: Date | null;
                        endDate: Date | null;
                        strategicSubAxisId: string;
                        coordinatorId: string;
                    })[];
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    order: number | null;
                    strategicAxisId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicPlanId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            startYear: number;
            endYear: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStrategicPlanById(id: string): Promise<{
        axes: ({
            subAxes: ({
                programs: ({
                    _count: {
                        projects: number;
                    };
                    coordinator: {
                        email: string;
                        id: string;
                        firstName: string;
                        lastName: string;
                    };
                    themes: ({
                        _count: {
                            activities: number;
                            projects: number;
                        };
                    } & {
                        name: string;
                        description: string | null;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        code: string | null;
                        objectives: string[];
                        order: number | null;
                        programId: string;
                    })[];
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    startDate: Date | null;
                    endDate: Date | null;
                    strategicSubAxisId: string;
                    coordinatorId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicAxisId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicPlanId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number;
        endYear: number;
    }>;
    updateStrategicPlan(id: string, data: UpdateStrategicPlanRequest, userId: string): Promise<{
        axes: ({
            subAxes: ({
                programs: ({
                    coordinator: {
                        email: string;
                        id: string;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    startDate: Date | null;
                    endDate: Date | null;
                    strategicSubAxisId: string;
                    coordinatorId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicAxisId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicPlanId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number;
        endYear: number;
    }>;
    deleteStrategicPlan(id: string, userId: string): Promise<{
        message: string;
    }>;
    createStrategicAxis(data: CreateStrategicAxisRequest, userId: string): Promise<{
        strategicPlan: {
            name: string;
            id: string;
        };
        subAxes: ({
            programs: ({
                coordinator: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                startDate: Date | null;
                endDate: Date | null;
                strategicSubAxisId: string;
                coordinatorId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicAxisId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicPlanId: string;
    }>;
    getStrategicAxes(params: {
        page?: number;
        limit?: number;
        search?: string;
        strategicPlanId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            strategicPlan: {
                name: string;
                id: string;
            };
            subAxes: ({
                programs: ({
                    _count: {
                        projects: number;
                    };
                    coordinator: {
                        email: string;
                        id: string;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    startDate: Date | null;
                    endDate: Date | null;
                    strategicSubAxisId: string;
                    coordinatorId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicAxisId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicPlanId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStrategicAxisById(id: string): Promise<{
        strategicPlan: {
            name: string;
            id: string;
        };
        subAxes: ({
            programs: ({
                _count: {
                    projects: number;
                };
                coordinator: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
                themes: {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    objectives: string[];
                    order: number | null;
                    programId: string;
                }[];
            } & {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                startDate: Date | null;
                endDate: Date | null;
                strategicSubAxisId: string;
                coordinatorId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicAxisId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicPlanId: string;
    }>;
    updateStrategicAxis(id: string, data: UpdateStrategicAxisRequest, userId: string): Promise<{
        strategicPlan: {
            name: string;
            id: string;
        };
        subAxes: ({
            programs: ({
                coordinator: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                startDate: Date | null;
                endDate: Date | null;
                strategicSubAxisId: string;
                coordinatorId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicAxisId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicPlanId: string;
    }>;
    deleteStrategicAxis(id: string, userId: string): Promise<{
        message: string;
    }>;
    createStrategicSubAxis(data: CreateStrategicSubAxisRequest, userId: string): Promise<{
        strategicAxis: {
            name: string;
            id: string;
            strategicPlan: {
                name: string;
                id: string;
            };
        };
        programs: ({
            coordinator: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            themes: {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                objectives: string[];
                order: number | null;
                programId: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            startDate: Date | null;
            endDate: Date | null;
            strategicSubAxisId: string;
            coordinatorId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicAxisId: string;
    }>;
    getStrategicSubAxes(params: {
        page?: number;
        limit?: number;
        search?: string;
        strategicAxisId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            strategicAxis: {
                name: string;
                id: string;
                strategicPlan: {
                    name: string;
                    id: string;
                };
            };
            programs: ({
                _count: {
                    projects: number;
                    themes: number;
                };
                coordinator: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                startDate: Date | null;
                endDate: Date | null;
                strategicSubAxisId: string;
                coordinatorId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicAxisId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStrategicSubAxisById(id: string): Promise<{
        strategicAxis: {
            name: string;
            id: string;
            strategicPlan: {
                name: string;
                id: string;
            };
        };
        programs: ({
            _count: {
                projects: number;
            };
            coordinator: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            themes: {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                objectives: string[];
                order: number | null;
                programId: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            startDate: Date | null;
            endDate: Date | null;
            strategicSubAxisId: string;
            coordinatorId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicAxisId: string;
    }>;
    updateStrategicSubAxis(id: string, data: UpdateStrategicSubAxisRequest, userId: string): Promise<{
        strategicAxis: {
            name: string;
            id: string;
            strategicPlan: {
                name: string;
                id: string;
            };
        };
        programs: ({
            coordinator: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            startDate: Date | null;
            endDate: Date | null;
            strategicSubAxisId: string;
            coordinatorId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        order: number | null;
        strategicAxisId: string;
    }>;
    deleteStrategicSubAxis(id: string, userId: string): Promise<{
        message: string;
    }>;
    createResearchProgram(data: CreateResearchProgramRequest, userId: string): Promise<{
        coordinator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        strategicSubAxis: {
            name: string;
            id: string;
            strategicAxis: {
                name: string;
                id: string;
                strategicPlan: {
                    name: string;
                    id: string;
                };
            };
        };
        themes: {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            objectives: string[];
            order: number | null;
            programId: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        startDate: Date | null;
        endDate: Date | null;
        strategicSubAxisId: string;
        coordinatorId: string;
    }>;
    getResearchPrograms(params: {
        page?: number;
        limit?: number;
        search?: string;
        strategicSubAxisId?: string;
        coordinatorId?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            _count: {
                projects: number;
            };
            coordinator: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            strategicSubAxis: {
                name: string;
                id: string;
                strategicAxis: {
                    name: string;
                    id: string;
                    strategicPlan: {
                        name: string;
                        id: string;
                    };
                };
            };
            themes: {
                name: string;
                description: string | null;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                objectives: string[];
                order: number | null;
                programId: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            startDate: Date | null;
            endDate: Date | null;
            strategicSubAxisId: string;
            coordinatorId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getResearchProgramById(id: string): Promise<{
        _count: {
            projects: number;
        };
        coordinator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        strategicSubAxis: {
            name: string;
            id: string;
            strategicAxis: {
                name: string;
                id: string;
                strategicPlan: {
                    name: string;
                    id: string;
                };
            };
        };
        themes: ({
            _count: {
                activities: number;
                projects: number;
            };
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            objectives: string[];
            order: number | null;
            programId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        startDate: Date | null;
        endDate: Date | null;
        strategicSubAxisId: string;
        coordinatorId: string;
    }>;
    updateResearchProgram(id: string, data: UpdateResearchProgramRequest, userId: string): Promise<{
        coordinator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        strategicSubAxis: {
            name: string;
            id: string;
            strategicAxis: {
                name: string;
                id: string;
                strategicPlan: {
                    name: string;
                    id: string;
                };
            };
        };
        themes: {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            objectives: string[];
            order: number | null;
            programId: string;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        startDate: Date | null;
        endDate: Date | null;
        strategicSubAxisId: string;
        coordinatorId: string;
    }>;
    deleteResearchProgram(id: string, userId: string): Promise<{
        message: string;
    }>;
    createResearchTheme(data: CreateResearchThemeRequest, userId: string): Promise<{
        _count: {
            activities: number;
            projects: number;
        };
        program: {
            name: string;
            id: string;
            strategicSubAxis: {
                name: string;
                id: string;
                strategicAxis: {
                    name: string;
                    id: string;
                    strategicPlan: {
                        name: string;
                        id: string;
                    };
                };
            };
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        objectives: string[];
        order: number | null;
        programId: string;
    }>;
    getResearchThemes(params: {
        page?: number;
        limit?: number;
        search?: string;
        programId?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            _count: {
                activities: number;
                projects: number;
            };
            program: {
                name: string;
                id: string;
                strategicSubAxis: {
                    name: string;
                    id: string;
                    strategicAxis: {
                        name: string;
                        id: string;
                        strategicPlan: {
                            name: string;
                            id: string;
                        };
                    };
                };
            };
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            objectives: string[];
            order: number | null;
            programId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getResearchThemeById(id: string): Promise<{
        _count: {
            activities: number;
            projects: number;
        };
        program: {
            name: string;
            id: string;
            strategicSubAxis: {
                name: string;
                id: string;
                strategicAxis: {
                    name: string;
                    id: string;
                    strategicPlan: {
                        name: string;
                        id: string;
                    };
                };
            };
        };
        activities: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
        }[];
        projects: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
        }[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        objectives: string[];
        order: number | null;
        programId: string;
    }>;
    updateResearchTheme(id: string, data: UpdateResearchThemeRequest, userId: string): Promise<{
        _count: {
            activities: number;
            projects: number;
        };
        program: {
            name: string;
            id: string;
            strategicSubAxis: {
                name: string;
                id: string;
                strategicAxis: {
                    name: string;
                    id: string;
                    strategicPlan: {
                        name: string;
                        id: string;
                    };
                };
            };
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
        objectives: string[];
        order: number | null;
        programId: string;
    }>;
    deleteResearchTheme(id: string, userId: string): Promise<{
        message: string;
    }>;
    createResearchStation(data: CreateResearchStationRequest, userId: string): Promise<{
        _count: {
            activities: number;
            events: number;
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        surface: number | null;
    }>;
    getResearchStations(params: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            _count: {
                activities: number;
                events: number;
            };
        } & {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            surface: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateResearchStation(id: string, data: UpdateResearchStationRequest, userId: string): Promise<{
        _count: {
            activities: number;
            events: number;
        };
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        location: string;
        surface: number | null;
    }>;
    deleteResearchStation(id: string, userId: string): Promise<{
        message: string;
    }>;
    private createAuditLog;
    getStrategicHierarchy(): Promise<({
        axes: ({
            subAxes: ({
                programs: ({
                    coordinator: {
                        email: string;
                        id: string;
                        firstName: string;
                        lastName: string;
                    };
                    themes: ({
                        _count: {
                            activities: number;
                            projects: number;
                        };
                    } & {
                        name: string;
                        description: string | null;
                        id: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        code: string | null;
                        objectives: string[];
                        order: number | null;
                        programId: string;
                    })[];
                } & {
                    name: string;
                    description: string | null;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                    startDate: Date | null;
                    endDate: Date | null;
                    strategicSubAxisId: string;
                    coordinatorId: string;
                })[];
            } & {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                order: number | null;
                strategicAxisId: string;
            })[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            order: number | null;
            strategicPlanId: string;
        })[];
    } & {
        name: string;
        description: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number;
        endYear: number;
    })[]>;
    getStrategicPlanningStats(): Promise<{
        plans: number;
        axes: number;
        subAxes: number;
        programs: number;
        themes: number;
        stations: number;
        activeProjects: number;
    }>;
    getEligibleCoordinators(): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        specialization: string;
        department: string;
        _count: {
            coordinatedPrograms: number;
        };
    }[]>;
}
//# sourceMappingURL=strategic-planning.service.d.ts.map