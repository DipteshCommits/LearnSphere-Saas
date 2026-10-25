import { Router } from 'express';
import {
    updateGeneralInformation, getGeneralInformation, updateContactInformation, getContactInformation, updateAddressInformation, getAddressInformation,
    getOrgLogo,
    uploadOrgLogo, removeOrgLogo
} from './schoolProfile.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../../middlewares/role.middleware.js';
import { uploadLogoMiddleware } from '../../../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ORG_ADMIN"));

router.patch('/general-information', updateGeneralInformation);
router.get('/general-information', getGeneralInformation);
router.patch('/contact-information', updateContactInformation);
router.get('/contact-information', getContactInformation);
router.patch('/address-information', updateAddressInformation);
router.get('/address-information', getAddressInformation);
router.get('/logo', getOrgLogo);
router.post('/logo', uploadLogoMiddleware.single("logo"), uploadOrgLogo);
router.delete("/logo", removeOrgLogo);

export default router;
