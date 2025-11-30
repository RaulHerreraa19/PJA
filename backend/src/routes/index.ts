import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import employeeRoutes from './employees.routes';
import clockingsRoutes from './clockings.routes';
import attendanceRoutes from './attendance.routes';
import periodsRoutes from './periods.routes';
import incidenceRulesRoutes from './incidenceRules.routes';
import reportsRoutes from './reports.routes';
import importRoutes from './import.routes';
import incidencesRoutes from './incidences.routes';
import catalogsRoutes from './catalogs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/clockings', clockingsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/periods', periodsRoutes);
router.use('/incidence-rules', incidenceRulesRoutes);
router.use('/reports', reportsRoutes);
router.use('/import', importRoutes);
router.use('/incidences', incidencesRoutes);
router.use('/catalogs', catalogsRoutes);

export default router;
